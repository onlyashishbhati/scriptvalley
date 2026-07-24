"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Github, Loader2, Star, GitCommit, GitPullRequest, CircleDot } from "lucide-react";
import type { PortfolioTheme } from "./SidebarProfile";

type Overview = {
  avatarUrl: string; followers: number; stars: number; commits: number;
  prs: number; issues: number; totalContributions: number; activeDays: number;
  languages: { name: string; color: string; percent: number }[];
  weeks: { contributionDays: { contributionCount: number; date: string }[] }[];
};

function normalizeGithubHandle(input?: string | null): string {
  if (!input) return "";
  try {
    if (input.includes("http")) {
      const u = new URL(input);
      const parts = u.pathname.split("/").filter(Boolean);
      return parts[0] || "";
    }
  } catch {
    /* fall through */
  }
  return input.trim().replace(/^@/, "");
}

function computeStreaks(weeks: Overview["weeks"]) {
  const days: number[] = [];
  for (const w of weeks ?? []) {
    for (const d of w.contributionDays ?? []) {
      days.push(d.contributionCount ?? 0);
    }
  }
  let max = 0, cur = 0;
  for (const v of days) {
    cur = v > 0 ? cur + 1 : 0;
    if (cur > max) max = cur;
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i] > 0) current++;
    else break;
  }
  return { max, current };
}

function StatTile({
  icon: Icon, label, value, T, delay,
}: { icon: React.ElementType; label: string; value: number; T: PortfolioTheme; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -3 }}
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center gap-1.5" style={{ color: T.textFaint }}>
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-2xl font-bold tabular-nums" style={{ color: T.text }}>{value}</span>
    </motion.div>
  );
}

function Skeleton({ T }: { T: PortfolioTheme }) {
  return (
    <div className="flex items-center gap-2 py-10 justify-center" style={{ color: T.textFaint }}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading GitHub activity…</span>
    </div>
  );
}

export default function GithubTabSection({ handle, T }: { handle: string; T: PortfolioTheme }) {
  const login = useMemo(() => normalizeGithubHandle(handle), [handle]);
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!login) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/github/overview?user=${encodeURIComponent(login)}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Couldn't load GitHub activity");
        if (!cancelled) setData(json as Overview);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [login]);

  if (!login) return null;
  if (loading) return <Skeleton T={T} />;
  if (error || !data) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: T.textFaint }}>
        Couldn&apos;t load GitHub activity right now.
      </p>
    );
  }

  const streaks = computeStreaks(data.weeks);
  const langTotal = data.languages.reduce((s, l) => s + (l.percent ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Handle header */}
      <motion.a
        href={`https://github.com/${login}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        whileHover={{ x: 3 }}
        className="inline-flex items-center gap-2 text-sm font-medium mb-1"
        style={{ color: T.accent }}
      >
        <Github className="w-4 h-4" />
        @{login}
      </motion.a>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile icon={GitCommit} label="Contributions" value={data.totalContributions} T={T} delay={0} />
        <StatTile icon={CircleDot} label="Active days" value={data.activeDays} T={T} delay={0.04} />
        <StatTile icon={Star} label="Stars" value={data.stars} T={T} delay={0.08} />
        <StatTile icon={GitPullRequest} label="PRs" value={data.prs} T={T} delay={0.12} />
      </div>

      {/* Contribution heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="rounded-xl overflow-hidden"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <span className="text-[10px] uppercase tracking-widest" style={{ color: T.textFaint }}>
            {data.totalContributions} contributions
          </span>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: T.textFaint }}>
            <span>Max streak <strong style={{ color: T.text }}>{streaks.max}</strong></span>
            <span>Current <strong style={{ color: T.text }}>{streaks.current}</strong></span>
          </div>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-[3px]" style={{ minWidth: 580 }}>
            {data.weeks.map((w, wi) => {
              const maxCount = Math.max(1, ...data.weeks.flatMap((wk) => wk.contributionDays.map((d) => d.contributionCount)));
              return (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {w.contributionDays.map((d, di) => {
                    const intensity = d.contributionCount > 0 ? Math.min(1, d.contributionCount / maxCount) : 0;
                    return (
                      <div
                        key={di}
                        title={`${d.contributionCount} contributions · ${d.date}`}
                        style={{
                          width: 11, height: 11, borderRadius: 2,
                          background: intensity === 0 ? T.surfaceNested : T.accent,
                          opacity: intensity === 0 ? 1 : 0.25 + intensity * 0.75,
                        }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Languages */}
      {data.languages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-xl p-4"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.textFaint }}>
            Top languages
          </p>
          <div className="w-full h-1.5 rounded-full overflow-hidden flex mb-4" style={{ background: T.surfaceHover }}>
            {data.languages.map((l, i) => (
              <div key={l.name + i} style={{ width: `${l.percent}%`, background: l.color }} className="h-full" title={`${l.name} ${l.percent}%`} />
            ))}
            {langTotal < 100 && <div style={{ width: `${100 - langTotal}%`, background: T.surfaceHover }} className="h-full" />}
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-3">
            {data.languages.map((l) => (
              <div key={l.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: l.color }} />
                <span style={{ color: T.textMuted }}>{l.name}</span>
                <span className="ml-auto shrink-0" style={{ color: T.textFaint }}>{l.percent}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}