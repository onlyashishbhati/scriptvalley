import { NextResponse } from "next/server";

const LEETSCAN_BASE = (process.env.LEETSCAN_BASE || "https://leetscan-api-main.vercel.app").replace(/\/$/, "");
const API_KEY = process.env.LEETSCAN_API_KEY || "";
const CACHE_TTL_MS = Number(process.env.LEETSCAN_TTL || 60) * 1000;

type CacheEntry = { ts: number; data: unknown };
const MEM_CACHE = new Map<string, CacheEntry>();

function pruneExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of MEM_CACHE) {
    if (now - entry.ts >= CACHE_TTL_MS) MEM_CACHE.delete(key);
  }
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, opts: RequestInit = {}, retries = 2, backoff = 300) {
  for (let i = 0; ; i++) {
    try {
      const res = await fetch(url, opts);
      if (res.ok) return res;
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        if (i >= retries) return res;
        await sleep(backoff * (i + 1));
        continue;
      }
      return res;
    } catch (err: unknown) {
      if (i >= retries) throw err;
      await sleep(backoff * (i + 1));
    }
  }
}

/**
 * Extract username from LeetCode URL or plain input.
 * Your Convex stores always like: https://leetcode.com/u/<username>
 */
function normalizeUsername(raw?: string | null) {
  if (!raw) return "";

  try {
    const u = new URL(raw);
    const parts = u.pathname.split("/").filter(Boolean);

    // expected format: /u/<username>
    if (parts[0] === "u" && parts[1]) {
      return parts[1];
    }

    return "";
  } catch {
    // if someone entered just the username instead of URL
    return raw.replace(/^@/, "").trim();
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("user");
    if (!raw) return NextResponse.json({ error: "Missing ?user=" }, { status: 400 });

    const username = normalizeUsername(raw);
    if (!username) {
      return NextResponse.json({ error: "Invalid LeetCode username input" }, { status: 400 });
    }

    pruneExpiredCache();
    const cacheKey = `leetscan:${username}`;

    // cache check
    const cached = MEM_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, { status: 200 });
    }

    const url = `${LEETSCAN_BASE}/${encodeURIComponent(username)}`;
    const headers: Record<string, string> = { "User-Agent": "thecodeone/1.0" };
    if (API_KEY) headers["x-api-key"] = API_KEY;

    const res = await fetchWithRetry(url, { method: "GET", headers }, 2, 300);
    if (!res.ok) {
      const fallback = {
        username,
        totalSolved: 0,
        totalSubmissions: 0,
        totalQuestions: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        submissionCalendar: {},
        recentSubmissions: [],
        profile: { userAvatar: null },
        badges: [],
        totalActiveDays: 0,
        fetchedAt: new Date().toISOString(),
        source: "leetscan_error",
      };
      MEM_CACHE.set(cacheKey, { ts: Date.now(), data: fallback });
      return NextResponse.json(fallback, { status: 200 });
    }

    const j: unknown = await res.json().catch(() => null);
    if (!j || typeof j !== "object") {
      return NextResponse.json({ error: "Invalid leetscan response" }, { status: 500 });
    }

    // Use type guards / safe extraction
    const safe = j as Record<string, unknown>;

    const totalSolved = Number(safe.totalSolved ?? 0);
    const easySolved = Number(safe.easySolved ?? 0);
    const mediumSolved = Number(safe.mediumSolved ?? 0);
    const hardSolved = Number(safe.hardSolved ?? 0);
    const totalSubmissions = Number(safe.totalSubmissions ?? 0);
    const totalQuestions = Number(safe.totalQuestions ?? 0);

    const calendar =
      safe.submissionCalendar && typeof safe.submissionCalendar === "object"
        ? (safe.submissionCalendar as Record<string, unknown>)
        : {};
    const badges = Array.isArray(safe.badges) ? safe.badges : [];
    const avatar =
      safe.profile && typeof safe.profile === "object" && "userAvatar" in (safe.profile as Record<string, unknown>)
        ? (safe.profile as Record<string, unknown>)["userAvatar"]
        : null;
    const recentSubmissions = Array.isArray(safe.recentSubmissions) ? safe.recentSubmissions : [];

    const totalActiveDays = Object.keys(calendar || {}).length;

    const payload = {
      username: typeof safe.username === "string" ? safe.username : username,
      totalSolved,
      totalSubmissions,
      totalQuestions,
      easySolved,
      mediumSolved,
      hardSolved,
      submissionCalendar: calendar,
      recentSubmissions,
      profile: safe.profile ?? {},
      avatar,
      badges,
      totalActiveDays,
      fetchedAt: new Date().toISOString(),
      source: "leetscan",
    };

    MEM_CACHE.set(cacheKey, { ts: Date.now(), data: payload });
    return NextResponse.json(payload, { status: 200 });
  } catch (e: unknown) {
    // safer message extraction
    const msg = e instanceof Error ? e.message : e && typeof e === "object" && "message" in e ? String((e as Record<string, unknown>).message) : String(e ?? "Failed");
    console.error("LeetScan overview error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";