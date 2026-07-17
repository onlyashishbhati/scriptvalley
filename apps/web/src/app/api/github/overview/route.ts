import { NextResponse } from "next/server";

const GITHUB_API = "https://api.github.com/graphql";
const TOKEN = process.env.GITHUB_TOKEN;

const CACHE_TTL_MS = Number(process.env.GITHUB_STATS_TTL || 300) * 1000;
type CacheEntry = { ts: number; data: unknown };
const MEM_CACHE = new Map<string, CacheEntry>();

function pruneExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of MEM_CACHE) {
    if (now - entry.ts >= CACHE_TTL_MS) MEM_CACHE.delete(key);
  }
}

type LangEdge = { size: number; node: { name: string; color?: string | null } };

type RepoNode = {
  stargazerCount?: number | null;
  languages?: { edges?: LangEdge[] | null } | null;
};

type RepositoriesBlock = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: RepoNode[];
};

type ContributionDay = { contributionCount: number; date: string };
type ContributionWeek = { contributionDays: ContributionDay[] };

type ContributionsCollection = {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalIssueContributions: number;
  contributionCalendar: {
    totalContributions: number;
    weeks: ContributionWeek[];
  };
};

type OverviewUser = {
  avatarUrl: string;
  followers: { totalCount: number };
  repositories: RepositoriesBlock;
  contributionsCollection: ContributionsCollection;
};

function normalizeHandle(input?: string | null) {
  if (!input) return "";
  try {
    if (input.includes("http")) {
      const u = new URL(input);
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[0] || "";
    }
  } catch {
    // fallthrough
  }
  return input.trim().replace(/^@/, "");
}

/**
 * Perform a POST to GitHub GraphQL API and return the `data` field (or null).
 * Returned value is `unknown` — caller must validate shape.
 */
async function gh(query: string, variables: Record<string, unknown>): Promise<unknown> {
  if (!TOKEN) throw new Error("Missing GITHUB_TOKEN in env");
  const res = await fetch(GITHUB_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json: unknown = await res.json().catch(() => null);

  // safe extraction of GraphQL errors
  const errors =
    json && typeof json === "object" && json !== null && "errors" in json
      ? (json as Record<string, unknown>)["errors"]
      : undefined;

  if (!res.ok || (Array.isArray(errors) && errors.length > 0)) {
    let msg: string | null = null;
    if (Array.isArray(errors)) {
      msg = errors
        .map((e) =>
          e && typeof e === "object" && "message" in (e as Record<string, unknown>)
            ? String((e as Record<string, unknown>).message)
            : String(e)
        )
        .join("; ");
    }
    throw new Error(msg || `GitHub HTTP ${res.status}`);
  }

  const dataField =
    json && typeof json === "object" && json !== null && "data" in json
      ? (json as Record<string, unknown>)["data"]
      : null;

  return dataField;
}

const OVERVIEW = `
query Overview($login: String!, $after: String) {
  user(login: $login) {
    avatarUrl
    followers { totalCount }
    repositories(privacy: PUBLIC, isFork: false, ownerAffiliations: OWNER, first: 100, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        stargazerCount
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount date } }
      }
    }
  }
}
`;

export async function GET(req: Request) {
  try {
    if (!TOKEN) {
      return NextResponse.json({ error: "Server missing GITHUB_TOKEN" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("user");
    if (!raw) {
      return NextResponse.json({ error: "Missing ?user=" }, { status: 400 });
    }

    const login = normalizeHandle(raw);
    if (!login) {
      return NextResponse.json({ error: "Invalid ?user parameter" }, { status: 400 });
    }

    pruneExpiredCache();
    const cacheKey = `github:${login}`;
    const cached = MEM_CACHE.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached.data, { status: 200 });
    }

    let after: string | null = null;
    let hasNext = true;

    const repos: RepoNode[] = [];
    let userBlock: OverviewUser | null = null;

    // paginate repos (stop early if user not found)
    while (hasNext) {
      const dataUnknown = await gh(OVERVIEW, { login, after });
      if (!dataUnknown || typeof dataUnknown !== "object") {
        return NextResponse.json({ error: `GitHub user "${login}" not found` }, { status: 404 });
      }

      // validate `user` field exists and is object
      const dataObj = dataUnknown as Record<string, unknown>;
      const userUnknown = dataObj["user"];
      if (!userUnknown || typeof userUnknown !== "object") {
        return NextResponse.json({ error: `GitHub user "${login}" not found` }, { status: 404 });
      }

      // narrow to OverviewUser — we rely on GraphQL shape but still perform runtime checks below
      const u = userUnknown as Record<string, unknown>;

      // quick runtime guards for required blocks to avoid runtime crashes
      if (
        !("avatarUrl" in u) ||
        !("followers" in u) ||
        !("repositories" in u) ||
        !("contributionsCollection" in u)
      ) {
        return NextResponse.json({ error: `GitHub user "${login}" not found or has unexpected schema` }, { status: 404 });
      }

      // now safe-cast to our OverviewUser type
      const userTyped = {
        avatarUrl: String(u["avatarUrl"]),
        followers: { totalCount: Number((u["followers"] as Record<string, unknown>)?.totalCount ?? 0) },
        repositories: (u["repositories"] as unknown) as RepositoriesBlock,
        contributionsCollection: (u["contributionsCollection"] as unknown) as ContributionsCollection,
      } as OverviewUser;

      if (!userBlock) userBlock = userTyped;

      // push repo nodes (repositories might be undefined or malformed — guard with runtime checks)
      try {
        const repoNodes = (userTyped.repositories && Array.isArray((userTyped.repositories as RepositoriesBlock).nodes))
          ? (userTyped.repositories as RepositoriesBlock).nodes
          : [];
        repos.push(...repoNodes);
      } catch {
        // ignore malformed repo nodes
      }

      hasNext = Boolean((userTyped.repositories && (userTyped.repositories.pageInfo?.hasNextPage)) || false);
      after = (userTyped.repositories && userTyped.repositories.pageInfo?.endCursor) || null;

      if (repos.length >= 300) break;
    }

    // language aggregation
    const langMap = new Map<string, { name: string; color?: string | null; bytes: number }>();
    let totalStars = 0;

    for (const r of repos) {
      totalStars += Number(r.stargazerCount ?? 0);
      const edges = r.languages?.edges;
      if (!Array.isArray(edges)) continue;
      for (const e of edges) {
        if (!e || !e.node || !e.node.name) continue;
        const prev = langMap.get(e.node.name) || { name: e.node.name, color: e.node.color, bytes: 0 };
        prev.bytes += e.size ?? 0;
        langMap.set(e.node.name, prev);
      }
    }

    const totalBytes = Array.from(langMap.values()).reduce((s, x) => s + x.bytes, 0) || 1;
    const languages = Array.from(langMap.values())
      .map((l) => ({
        name: l.name,
        color: l.color ?? "#999999",
        percent: +(100 * (l.bytes / totalBytes)).toFixed(0),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 8);

    // contributions & active-days
    if (!userBlock) {
      return NextResponse.json({ error: "Unexpected missing user block" }, { status: 500 });
    }

    const cal = userBlock.contributionsCollection.contributionCalendar;
    const weeks = Array.isArray(cal?.weeks) ? cal.weeks : [];
    let activeDays = 0;
    for (const w of weeks) {
      if (!w?.contributionDays) continue;
      for (const d of w.contributionDays) {
        if (d.contributionCount > 0) activeDays++;
      }
    }

    const payload = {
      avatarUrl: userBlock.avatarUrl,
      followers: userBlock.followers.totalCount,
      stars: totalStars,
      commits: userBlock.contributionsCollection.totalCommitContributions,
      prs: userBlock.contributionsCollection.totalPullRequestContributions,
      issues: userBlock.contributionsCollection.totalIssueContributions,
      totalContributions: cal?.totalContributions ?? 0,
      activeDays,
      languages,
      weeks,
    };

    MEM_CACHE.set(cacheKey, { ts: Date.now(), data: payload });
    return NextResponse.json(payload, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e ?? "Failed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";