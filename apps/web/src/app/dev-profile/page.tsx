"use client";

import React, { useState } from "react";
import ProfileHeaderSection from "./_components/ProfileHeaderSection";
import GitHubOverview       from "./_components/GithubOverview";
import LeetCodeOverview     from "./_components/LeetcodeOverview";
import ProblemOfTheDay      from "./_components/Problemoftheday";
import StreakCalendar        from "./_components/Streakcalendar";
import BlendSnapshotCard    from "./_components/BlendSnapshotCard";
import PinnedSheetCard      from "./_components/PinnedSheetCard";
import PinnedCourseCard     from "./_components/PinnedCourseCard";
import ProtectedRoute from "@/components/ProtectedRoute";

function DeveloperProfileContent() {
  const [selected, setSelected] = useState<"progress" | "github" | "leetcode">("progress");

  return (
    // BUG FIX: this page's main content lives inside SiteChrome's normal
    // flow (not an internally-scrolling shell like CourseShell), so the
    // fixed floating dock was overlapping the last row of cards
    // (PinnedSheetCard/PinnedCourseCard) at the bottom. pb-28 gives the
    // dock's height + offset enough clearance.
    <div className="min-h-screen bg-[var(--bg-base)] w-full pt-16 pb-28">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">

          {/* Portfolio quick-access now lives inside ProfileHeaderSection
              itself (see that file) — no separate card needed here. */}
          <aside className="flex flex-col gap-4">
            <ProfileHeaderSection
              onSelect={setSelected}
              selectedView={selected}
            />
          </aside>

          <main className="min-w-0 py-2 space-y-4">

            {selected === "progress" && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">
                    Dev Profile
                  </p>
                  <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                    My Progress
                  </h1>
                </div>

                <div className="border-t border-[var(--border-subtle)]" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
                  <ProblemOfTheDay />
                  <StreakCalendar />
                </div>

                <BlendSnapshotCard />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PinnedSheetCard />
                  <PinnedCourseCard />
                </div>
              </>
            )}

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