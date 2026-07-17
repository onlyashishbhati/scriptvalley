"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { safeFetchJSON } from "@/lib/fetchers";
import StatRow from "./GitHub/StatRow";
import Heatmap from "./GitHub/Heatmap";
import GitHubOverviewSkeleton from "./GitHub/GitHubOverviewSkeleton";
import { normalizeGithub, computeMaxStreak, computeCurrentStreak } from "./GitHub/githubUtils";
import { RefreshCw } from "lucide-react";

type Overview = {
  avatarUrl: string; followers: number; stars: number; commits: number;
  prs: number; issues: number; totalContributions: number; activeDays: number;
  languages: { name: string; color: string; percent: number }[];
  weeks: { contributionDays: { contributionCount: number; date: string }[] }[];
};
const POLL_INTERVAL_MS = 5 * 60 * 1000;

export default function GitHubOverview() {
  const { user }  = useUser();
  const userId    = user?.id ?? "";
  const platform  = useQuery(api.platforms.getUserPlatformData, userId ? { userId } : "skip");

  const [data,    setData]    = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const rawGithubUrl = (() => {
    if (!platform || typeof platform !== "object") return "";
    const p = platform as Record<string, unknown>;
    const v = p["githubUrl"];
    return typeof v === "string" ? v : "";
  })();
  const ghHandle = useMemo(() => normalizeGithub(rawGithubUrl ?? ""), [rawGithubUrl]);
  const pollRef  = useRef<number | null>(null);

  const fetchOverview = async (username: string) => {
    setLoading(true); setError(null);
    try {
      const { ok, json, text } = await safeFetchJSON(
        `/api/github/overview?user=${encodeURIComponent(username)}`, { cache: "no-store" },
      );
      if (!ok) {
        let msg = text ?? "Error";
        if (json && typeof json === "object") {
          const j = json as Record<string, unknown>;
          const e = j["error"] ?? j["message"] ?? j["status"];
          if (typeof e === "string") msg = e;
        }
        throw new Error(msg);
      }
      setData(json ? (json as Overview) : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setData(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (!ghHandle) { setData(null); setError(null); return; }
    fetchOverview(ghHandle);
    pollRef.current = window.setInterval(() => fetchOverview(ghHandle), POLL_INTERVAL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [ghHandle]);

  const langTotal = useMemo(
    () => data ? data.languages.reduce((s, l) => s + (l.percent ?? 0), 0) : 0,
    [data],
  );

  if (!ghHandle) return null;
  if (loading && !data) return <GitHubOverviewSkeleton />;

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-input)] border-b border-[var(--border-subtle)]">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">GitHub</p>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">Activity Overview</h2>
        </div>
        <button
          onClick={() => ghHandle && fetchOverview(ghHandle)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100 disabled:opacity-40"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Body */}
      <div className="p-4 bg-[var(--bg-base)] space-y-4">
        {error ? (
          <p className="text-xs text-red-400/70 py-4 text-center">{error}</p>
        ) : !data ? (
          <p className="text-sm text-[var(--text-faint)] py-8 text-center">No data available.</p>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1.5">Contributions</p>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{data.totalContributions}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1.5">Active Days</p>
                <p className="text-3xl font-bold text-[var(--text-primary)]">{data.activeDays}</p>
              </div>
            </div>

            {/* Heatmap */}
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-default)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
                  {data.totalContributions} contributions
                </p>
                <div className="flex items-center gap-3 text-[10px] text-[var(--text-disabled)]">
                  <span>Max streak <strong className="text-[var(--text-secondary)]">{computeMaxStreak(data as unknown)}</strong></span>
                  <span>Current <strong className="text-[var(--text-secondary)]">{computeCurrentStreak(data as unknown)}</strong></span>
                </div>
              </div>
              <div className="p-3 overflow-x-auto">
                <Heatmap weeks={data.weeks} />
              </div>
            </div>

            {/* Languages + Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-3">Languages</p>
                {/* Language bar — colors come from GitHub API, intentionally kept */}
                <div className="w-full h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden flex mb-4">
                  {data.languages.map((l, i) => (
                    <div
                      key={l.name + i}
                      style={{ width: `${l.percent}%`, backgroundColor: l.color }}
                      className="h-full"
                      title={`${l.name} ${l.percent}%`}
                    />
                  ))}
                  {langTotal < 100 && (
                    <div style={{ width: `${100 - langTotal}%` }} className="h-full bg-[var(--bg-hover)]" />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                  {data.languages.map((l) => (
                    <div key={l.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                      <span className="text-[var(--text-secondary)] truncate">{l.name}</span>
                      <span className="text-[var(--text-disabled)] ml-auto shrink-0">{l.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-3">Stats</p>
                <div className="space-y-0.5">
                  <StatRow label="Stars"   value={data.stars}   />
                  <StatRow label="Commits" value={data.commits} />
                  <StatRow label="PRs"     value={data.prs}     />
                  <StatRow label="Issues"  value={data.issues}  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}