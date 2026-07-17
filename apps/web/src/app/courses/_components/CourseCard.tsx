"use client";

import Link from "next/link";
import { Layers, FileText, Bookmark, BookmarkCheck, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "../courseTypes";

const LEVEL_META: Record<string, { label: string; color: string; bg: string }> = {
  beginner:     { label: "Beginner",     color: "#22c55e", bg: "rgba(34,197,94,0.08)"  },
  intermediate: { label: "Intermediate", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  advanced:     { label: "Advanced",     color: "#ef4444", bg: "rgba(239,68,68,0.08)"  },
  "all-levels": { label: "All Levels",   color: "#3A5EFF", bg: "rgba(58,94,255,0.08)"  },
};

// Builds a lesson slug the same way the rest of the app does
function makeLessonSlug(title: string, idx: number): string {
  const base = title.trim().toLowerCase()
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
  return base || `lesson-${idx + 1}`;
}

interface Props {
  course:            Course;
  isSaved:           boolean;
  completedLessons?: number;
  progressRows?: { moduleSlug: string; lessonSlug: string }[];
}

export default function CourseCard({ course, isSaved, completedLessons = 0, progressRows }: Props) {
  const { user }      = useUser();
  const router        = useRouter();
  const toggleSaveMut = useMutation(api.courses.saveOrUnsaveCourse);

  const moduleCount  = course.modules?.length ?? 0;
  const isStructured = course.template === "structured";

  const totalLessons = isStructured
    ? (course.modules ?? []).reduce((s, m) => s + (m.lessons?.length ?? 0), 0)
    : 0;

  const pct = totalLessons > 0
    ? Math.min(100, Math.floor((completedLessons / totalLessons) * 100))
    : 0;

  const hasStarted = isStructured && completedLessons > 0 && completedLessons < totalLessons;

  const completedSet = new Set(
    (progressRows ?? []).map((r) => `${r.moduleSlug}::${r.lessonSlug}`)
  );

  function getResumeHref(): string {
    if (!progressRows) return `/courses/${course.slug}`;
    const modules = [...(course.modules ?? [])].sort((a, b) => a.order - b.order);
    for (const mod of modules) {
      const lessons = [...(mod.lessons ?? [])].sort((a, b) => a.order - b.order);
      for (let li = 0; li < lessons.length; li++) {
        const lSlug = makeLessonSlug(lessons[li].title, li);
        if (!completedSet.has(`${mod.slug}::${lSlug}`)) {
          return `/courses/${course.slug}/${mod.slug}/${lSlug}`;
        }
      }
    }
    return `/courses/${course.slug}`;
  }

  const resumeHref = hasStarted ? getResumeHref() : null;

  const href = `/courses/${course.slug}`;

  const levelMeta = course.level ? LEVEL_META[course.level] : null;

  async function toggleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error("Sign in to save courses"); return; }
    try {
      await toggleSaveMut({ courseSlug: course.slug, save: !isSaved });
      toast.success(isSaved ? "Removed from saved" : "Course saved");
    } catch {
      toast.error("Something went wrong");
    }
  }

  // BUG FIX: this "Continue" control was a <Link> (renders <a>) nested
  // inside the card's outer <Link> (also an <a>) — the browser silently
  // closes the outer anchor early and React then hydrates a mismatched
  // tree, which is exactly the "<a> cannot be a descendant of <a>"
  // hydration error. Nested interactive anchors are invalid HTML
  // regardless of framework. Fixed by using a plain <button> that
  // stops propagation and navigates imperatively via useRouter — same
  // click behavior, no invalid nesting.
  function goToResume(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (resumeHref) router.push(resumeHref);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group"
    >
      <Link href={href} className="block h-full">
        <div className="relative h-[210px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] transition-colors duration-100 overflow-hidden flex flex-col">

          {isStructured && totalLessons > 0 ? (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bg-hover)]">
              <div
                className="h-full bg-[#3A5EFF] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          ) : (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-[#3A5EFF]" />
          )}

          <div className="p-4 flex flex-col gap-2.5 h-full pt-5">

            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1.5 flex-1">
                <h2 className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-1">
                  {course.title}
                </h2>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {course.category && (
                    <span className="inline-flex text-[10px] uppercase tracking-widest rounded px-1.5 py-0.5 border bg-[rgba(58,94,255,0.08)] border-[rgba(58,94,255,0.2)] text-[#3A5EFF]">
                      {course.category}
                    </span>
                  )}
                  {levelMeta && (
                    <span
                      className="inline-flex text-[10px] rounded px-1.5 py-0.5 font-medium"
                      style={{ color: levelMeta.color, background: levelMeta.bg }}
                    >
                      {levelMeta.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress % */}
              {isStructured && totalLessons > 0 && (
                <span className="shrink-0 text-[10px] text-[var(--text-disabled)] bg-[var(--bg-hover)] rounded px-1.5 py-0.5">
                  {pct}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--text-faint)] line-clamp-2 leading-relaxed">
              {course.description ?? "No description provided."}
            </p>

            {/* Footer */}
            <div className="mt-auto pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-disabled)]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{moduleCount} module{moduleCount !== 1 ? "s" : ""}</span>
                </div>
                {isStructured && totalLessons > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-disabled)]">
                    <FileText className="w-3 h-3" />
                    <span>{completedLessons}/{totalLessons}</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>

                {/* Continue button — shows only when in progress. Plain
                    <button>, not <Link>, to avoid an <a> nested inside the
                    card's outer <Link>'s <a>. */}
                {resumeHref && (
                  <button
                    onClick={goToResume}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors duration-100 text-[#3A5EFF] bg-[rgba(58,94,255,0.08)] hover:bg-[rgba(58,94,255,0.14)]"
                  >
                    <PlayCircle className="w-3 h-3" />
                    <span>Continue</span>
                  </button>
                )}

                {/* Save button */}
                <button
                  onClick={toggleSave}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors duration-100 ${
                    isSaved
                      ? "text-[#3A5EFF] bg-[rgba(58,94,255,0.08)]"
                      : "text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {isSaved
                    ? <BookmarkCheck className="w-3 h-3 fill-[#3A5EFF]" />
                    : <Bookmark      className="w-3 h-3" />
                  }
                  <span>{isSaved ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}