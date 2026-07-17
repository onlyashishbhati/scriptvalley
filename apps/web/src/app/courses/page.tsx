"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, X, Tag, Bookmark } from "lucide-react";
import CourseCard from "./_components/CourseCard";
import CoursesPageSkeleton from "./_components/CoursesPageSkeleton";
import { Course } from "./courseTypes";

type SavedCourse = { courseSlug: string };
type BtnPos      = { left: number; width: number };
type FilterKey   = "all" | "saved";
type ProgressRow = { moduleSlug: string; lessonSlug: string };

export default function CoursesPage() {
  const { user }   = useUser();

  const courses      = useQuery(api.courses.getAllCourses) as Course[] | undefined;
  const savedCourses     = useQuery(api.courses.getSavedCourses) ?? [];
  const progressCounts  = useQuery(api.courses.getAllLessonProgressCounts) ?? {};

  // PERF: figure out which visible courses are "in progress" (some but not
  // all lessons done) — those are the only ones that need per-lesson
  // progress rows for the "Continue" deep link. Then fetch all of them in
  // ONE batched query instead of letting each CourseCard open its own
  // subscription (see api.courses.getLessonProgressForSlugs).
  const inProgressSlugs = useMemo(() => {
    if (!courses) return [];
    return courses
      .filter((c) => {
        if (c.template !== "structured") return false;
        const total = (c.modules ?? []).reduce((s, m) => s + (m.lessons?.length ?? 0), 0);
        const done  = (progressCounts as Record<string, number>)[c.slug] ?? 0;
        return total > 0 && done > 0 && done < total;
      })
      .map((c) => c.slug);
  }, [courses, progressCounts]);

  const progressBySlug = useQuery(
    api.courses.getLessonProgressForSlugs,
    user && inProgressSlugs.length > 0 ? { courseSlugs: inProgressSlugs } : "skip",
  ) as Record<string, ProgressRow[]> | undefined;

  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter,     setActiveFilter]     = useState<FilterKey>("all");

  // Sliding indicator
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions,  setPositions]  = useState<Record<string, BtnPos>>({});

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const cont = containerRef.current!.getBoundingClientRect();
      const next: Record<string, BtnPos> = {};
      (["all", "saved"] as FilterKey[]).forEach((f) => {
        const btn = containerRef.current!.querySelector(`[data-filter="${f}"]`) as HTMLElement | null;
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        next[f] = { left: r.left - cont.left, width: r.width };
      });
      setPositions(next);
    };
    requestAnimationFrame(() => requestAnimationFrame(update));
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [user, activeFilter]);

  useEffect(() => { if (!user) setActiveFilter("all"); }, [user]);

  if (courses === undefined) return <CoursesPageSkeleton />;

  const allCategories = Array.from(
    new Set(courses.map((c) => c.category ?? "").filter(Boolean))
  ) as string[];

  const savedSlugs = new Set((savedCourses as SavedCourse[]).map((s) => s.courseSlug));

  const filtered = courses.filter((course) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(q) ||
      (course.description ?? "").toLowerCase().includes(q) ||
      (course.modules ?? []).some((m) => m.title.toLowerCase().includes(q));
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const finalCourses =
    activeFilter === "saved"
      ? filtered.filter((c) => savedSlugs.has(c.slug))
      : filtered;

  const activePos = positions[activeFilter];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 mt-8">

        {/* Page header */}
        <div className="mb-10">
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1"
          >
            Library
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-2xl font-semibold text-[var(--text-primary)] mb-2"
          >
            Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
            className="text-sm text-[var(--text-muted)]"
          >
            Structured courses built by instructors — learn concepts step by step.
          </motion.p>
        </div>

        {/* Filter switcher + count — mirrors DSA page exactly */}
        <div className="flex items-center mb-6">
          {user && (
            <div
              ref={containerRef}
              className="inline-flex relative bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-md px-1 py-1 gap-px"
            >
              {activePos && (
                <motion.div
                  className="absolute rounded-md bg-[var(--bg-active)]"
                  animate={{ left: activePos.left, width: activePos.width }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{ top: 4, bottom: 4, height: "calc(100% - 8px)" }}
                />
              )}
              <button
                data-filter="all"
                onClick={() => setActiveFilter("all")}
                className={`relative z-10 px-3 py-1.5 rounded-md text-xs transition-colors duration-100 ${
                  activeFilter === "all"
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                All Courses
              </button>
              <button
                data-filter="saved"
                onClick={() => setActiveFilter("saved")}
                className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors duration-100 ${
                  activeFilter === "saved"
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Bookmark className="w-3 h-3" />
                Saved
                {savedSlugs.size > 0 && (
                  <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold ml-0.5 ${
                    activeFilter === "saved"
                      ? "bg-[rgba(58,94,255,0.15)] text-[#3A5EFF]"
                      : "bg-[var(--bg-hover)] text-[var(--text-disabled)]"
                  }`}>
                    {savedSlugs.size}
                  </span>
                )}
              </button>
            </div>
          )}

          <span className="ml-auto text-xs text-[var(--text-disabled)]">
            {finalCourses.length} course{finalCourses.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Search + category chips */}
        <div className="mb-8 space-y-3">
          <div className="relative flex items-center h-9 bg-[var(--bg-input)] rounded-md px-3 focus-within:bg-[var(--bg-hover)] transition-colors duration-100">
            <Search className="w-3.5 h-3.5 text-[var(--text-faint)] mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course or module title…"
              className="flex-1 bg-transparent text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}
                className="p-1 rounded-sm text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {allCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
                <Tag className="w-3 h-3" />
                Filter
              </div>
              {allCategories.map((cat) => (
                <button key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors duration-100 ${
                    selectedCategory === cat
                      ? "bg-[var(--bg-hover)] border-[var(--border-medium)] text-[var(--text-secondary)]"
                      : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-1 text-xs text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors">
                  <X className="w-3 h-3" />Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          {finalCourses.length === 0 ? (
            activeFilter === "saved" ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-2 py-20 text-center"
              >
                <Bookmark className="w-8 h-8 text-[var(--text-disabled)]" />
                <p className="text-sm text-[var(--text-faint)]">No saved courses yet</p>
                <p className="text-xs text-[var(--text-disabled)]">
                  Click <span className="text-[var(--text-muted)]">Save</span> on any course to find it here
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 py-24 text-center"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[var(--text-disabled)]" />
                </div>
                <p className="text-sm text-[var(--text-faint)]">No courses found</p>
                <p className="text-xs text-[var(--text-disabled)]">Try a different search or clear the filter</p>
              </motion.div>
            )
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {finalCourses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  isSaved={savedSlugs.has(course.slug)}
                  completedLessons={(progressCounts as Record<string, number>)[course.slug] ?? 0}
                  progressRows={progressBySlug?.[course.slug]}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}