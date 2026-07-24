"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../packages/convex/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BookOpen, ChevronLeft } from "lucide-react";
import Link from "next/link";
import CourseSidebar from "./CourseSidebar";
import CheatSheetSidebarCard from "./CheatSheetSidebarCard";
import { Course } from "../../../courseTypes";

interface Props {
  course:   Course;
  children: React.ReactNode;
}

export default function CourseShell({ course, children }: Props) {
  const params           = useParams();
  const activeModSlug    = params.moduleSlug as string | undefined;
  const activeLessonSlug = params.lessonSlug as string | undefined;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const progressRows = useQuery(
    api.courses.getLessonProgress,
    { courseSlug: course.slug }
  ) ?? [];

  const completedSet = new Set<string>(
    progressRows.map((r: { moduleSlug: string; lessonSlug: string }) =>
      `${r.moduleSlug}::${r.lessonSlug}`
    )
  );

  const sidebarProps = {
    course,
    activeModSlug:    activeModSlug ?? "",
    activeLessonSlug,
    completedSet,
    onNavigate:       () => {},
  };

  return (
    <div className="flex mt-16 h-[calc(100vh-4rem)] overflow-hidden bg-[var(--bg-base)]">

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-30 bg-black/40 md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 z-[100] w-72 bg-[var(--bg-base)] border-r border-[var(--border-subtle)] md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border-subtle)] shrink-0">
                <span className="text-xs font-medium text-[var(--text-muted)] truncate">
                  {course.title}
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-faint)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Cheat sheet card also shown in the mobile drawer, same
                  top-of-sidebar placement as desktop. */}
              <div className="pt-3 shrink-0">
                <CheatSheetSidebarCard courseSlug={course.slug} />
              </div>
              <div className="flex-1 overflow-y-auto">
                <CourseSidebar {...sidebarProps} onNavigate={() => setDrawerOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 border-r border-[var(--border-subtle)] h-full overflow-hidden">

        <div className="px-4 py-4 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-base)]">
          <Link
            href="/courses"
            className="flex items-center gap-1.5 text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-faint)] transition-colors mb-3"
          >
            <ChevronLeft className="w-3 h-3" />All Courses
          </Link>

          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[rgba(58,94,255,0.08)] border border-[rgba(58,94,255,0.2)] flex items-center justify-center shrink-0 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 text-[#3A5EFF]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">
                Course
              </p>
              <h2 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                {course.title}
              </h2>
            </div>
          </div>

          {course.template === "structured" && (() => {
            const total = (course.modules ?? []).reduce((s, m) => s + (m.lessons?.length ?? 0), 0);
            const done  = completedSet.size;
            const pct   = total > 0 ? Math.floor((done / total) * 100) : 0;
            return total > 0 ? (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[var(--text-disabled)]">Progress</span>
                  <span className="text-[10px] font-medium text-[var(--text-faint)]">{done}/{total}</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                  <div
                    className="h-full bg-[#3A5EFF] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ) : null;
          })()}
        </div>

        {/* Cheat sheet — moved here from the bottom of the main content
            column, so it's visible immediately on every page of the
            course, not just the overview page after a long scroll. */}
        <div className="pt-3 shrink-0">
          <CheatSheetSidebarCard courseSlug={course.slug} />
        </div>

        <div className="flex-1 overflow-y-auto">
          <CourseSidebar {...sidebarProps} />
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto">

        <div className="md:hidden flex items-center gap-2 px-4 h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] sticky top-0 z-20">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-faint)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-[var(--text-muted)] truncate">
            {course.title}
          </span>
        </div>
        <div className="max-w-3xl mx-auto w-full pb-28">
          {children}
        </div>
      </main>
    </div>
  );
}