"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import ProfileHeaderSection from "./_components/ProfileHeaderSection";
import GitHubOverview       from "./_components/GithubOverview";
import LeetCodeOverview     from "./_components/LeetcodeOverview";
import SheetProgress        from "./_components/SheetProgress";
import ProblemOfTheDay      from "./_components/Problemoftheday";
import StreakCalendar        from "./_components/Streakcalendar";
import PortfolioPromptCard  from "./_components/PortfolioPromptCard";
import { computeProgress, Sheet, Attempt } from "@/app/dsa-sheet/lib/computeProgress";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";

type FollowedSheet = {
  id: string; name: string; topics: Sheet["topics"]; route: string;
};

function DeveloperProfileContent() {
  const { user } = useUser();
  const userId   = user?.id ?? "";

  const attemptsQuery = useQuery(api.progress.getAllAttempts, userId ? { userId } : "skip");
  const attempts      = attemptsQuery as unknown as Attempt[] | undefined;
  const followed      = useQuery(api.progress.getFollowedSheets, userId ? { userId } : "skip") ?? [];
  const toggleFollow  = useMutation(api.progress.toggleFollow);
  const [selected, setSelected] = useState<"progress" | "github" | "leetcode">("progress");

  async function handleUnfollow(id?: string) {
    if (!id || !userId) return;
    try { await toggleFollow({ userId, sheetSlug: id, follow: false }); }
    catch (err) { console.error("Unfollow failed", err); }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] w-full pt-16 pb-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">

          {/* ── Sidebar ────────────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-4">
            <ProfileHeaderSection
              onSelect={setSelected}
              selectedView={selected}
            />
          </aside>

          {/* ── Main ───────────────────────────────────────────────────────── */}
          <main className="min-w-0 py-2 space-y-4">

            {/* ── Progress view ── */}
            {selected === "progress" && (
              <>
                {/* Page heading */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">
                    Dev Profile
                  </p>
                  <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                    My Progress
                  </h1>
                </div>

                <PortfolioPromptCard />

                <div className="border-t border-[var(--border-subtle)]" />

                {/* ── POTD + Streak Calendar ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  <ProblemOfTheDay />
                  <StreakCalendar />
                </div>

                {/* ── Followed sheets ── */}
                {!followed || followed.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-[var(--border-subtle)] py-8 flex flex-col items-center gap-2 text-center">
                    <LayoutGrid className="w-6 h-6 text-[var(--text-disabled)]" />
                    <p className="text-sm text-[var(--text-faint)]">
                      You&apos;re not following any sheets yet.
                    </p>
                    <Link
                      href="/dsa-sheet"
                      className="text-xs text-[#3A5EFF] hover:text-[#4a6aff] transition-colors"
                    >
                      Browse DSA sheets →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(followed as FollowedSheet[]).map((s) => {
                      const progress = computeProgress({
                        sheet:         { topics: s.topics },
                        localAttempts: {},
                        attempts:      attempts ?? [],
                      });
                      return (
                        <SheetProgress
                          key={s.id}
                          id={s.id}
                          route={s.route}
                          sheetName={s.name}
                          progress={progress}
                          topics={s.topics}
                          onUnfollow={() => handleUnfollow(s.id)}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── GitHub view ── */}
            {selected === "github" && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">
                    Dev Profile
                  </p>
                  <h1 className="text-xl font-semibold text-[var(--text-primary)]">GitHub</h1>
                </div>
                <div className="border-t border-[var(--border-subtle)]" />
                <GitHubOverview />
              </>
            )}

            {/* ── LeetCode view ── */}
            {selected === "leetcode" && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">
                    Dev Profile
                  </p>
                  <h1 className="text-xl font-semibold text-[var(--text-primary)]">LeetCode</h1>
                </div>
                <div className="border-t border-[var(--border-subtle)]" />
                <LeetCodeOverview />
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

export default function DeveloperProfilePage() {
  return (
    <ProtectedRoute>
      <DeveloperProfileContent />
    </ProtectedRoute>
  );
}