"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import type { Doc } from "../../../../../../packages/convex/convex/_generated/dataModel";
import { GraduationCap, Pin, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

type SavedCourse = Doc<"saved_courses">;
type CourseSummary = Doc<"courses">;

export default function PinnedCourseCard() {
  const pinned = useQuery(api.pins.getMyPinnedCourse);
  const savedCourses = useQuery(api.courses.getSavedCourses, pinned === null ? {} : "skip");
  const allCourses = useQuery(api.courses.getAllCourses, pinned === null ? {} : "skip");
  const pinCourse = useMutation(api.pins.pinCourse);

  if (pinned === undefined) {
    return <div className="h-44 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] animate-pulse" />;
  }

  async function handlePin(slug: string) {
    try {
      await pinCourse({ courseSlug: slug });
      toast.success("Pinned to your dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to pin");
    }
  }

  if (!pinned) {
    // getSavedCourses only returns { courseSlug, savedAt } — join against
    // getAllCourses (already fetched elsewhere in the app) to get titles
    // for the picker, rather than adding a new enriched backend query.
    const enrichedSaved = (savedCourses ?? [])
      .map((s: SavedCourse) => {
        const course = (allCourses ?? []).find((c: CourseSummary) => c.slug === s.courseSlug);
        return course ? { slug: course.slug, title: course.title } : null;
      })
      .filter(Boolean) as { slug: string; title: string }[];

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden flex flex-col"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
          <GraduationCap className="w-3.5 h-3.5 text-[var(--text-faint)]" />
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Pinned Course</p>
        </div>

        {enrichedSaved.length > 0 ? (
          <div className="p-4 space-y-2">
            <p className="text-xs text-[var(--text-faint)] mb-1">Pick one of your saved courses to pin here:</p>
            {enrichedSaved.slice(0, 3).map((c) => (
              <button
                key={c.slug}
                onClick={() => handlePin(c.slug)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[var(--bg-input)] hover:bg-[var(--bg-hover)] transition-colors text-left"
              >
                <span className="text-xs text-[var(--text-secondary)] truncate">{c.title}</span>
                <Pin className="w-3 h-3 text-[#3A5EFF] shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center px-4">
            <p className="text-xs text-[var(--text-faint)]">Save a course to pin it here</p>
            <Link href="/courses" className="flex items-center gap-1 text-xs text-[#3A5EFF] hover:text-[#4a6aff] font-medium">
              Browse Courses <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 min-w-0">
          <GraduationCap className="w-3.5 h-3.5 text-[var(--text-faint)] shrink-0" />
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Pinned Course</p>
        </div>
        <Link
          href={`/courses/${pinned.courseSlug}`}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-[10px] font-medium transition-colors shrink-0"
        >
          Access <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{pinned.title}</p>

        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 shrink-0">
            <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--bg-hover)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.5" fill="none" stroke="#3A5EFF" strokeWidth="3"
                strokeDasharray={`${(pinned.pct / 100) * 97.4} 97.4`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
              {pinned.pct}%
            </span>
          </div>
          <div>
            <p className="text-xs text-[var(--text-secondary)]">{pinned.completedLessons} / {pinned.totalLessons} lessons</p>
            <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">Keep going!</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}