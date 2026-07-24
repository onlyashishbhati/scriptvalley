"use client";

import { useRef, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { computeProgress } from "@/app/dsa-sheet/lib/computeProgress";
import { DSASheet } from "../types";
import DSACard from "./DSACard";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Search, Tag, X } from "lucide-react";
import DSASheetExploreSkeleton from "./Dsasheetexploreskeleton";

type SavedSheet    = { slug: string };
type SheetFilter   = "all" | "saved";
type BtnPos        = { left: number; width: number };

export default function DSASheetExplorePage() {
  const { user } = useUser();
  const userId   = user?.id;

  const rawSheets      = useQuery(api.sheets.getAll) as DSASheet[] | undefined;
  const sheets         = rawSheets ?? [];
  const attempts       = useQuery(api.progress.getAllAttempts, userId ? { userId } : "skip");
  const savedSheets    = useQuery(api.sheets.getSavedSheets)                                 ?? [];
  // CHANGED: "follow" retired — pin state now comes from pins.ts's single
  // getMyPinnedSheet query instead of a per-user list of followed slugs.
  const pinnedSheet    = useQuery(api.pins.getMyPinnedSheet, userId ? {} : "skip");

  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter,     setActiveFilter]     = useState<SheetFilter>("all");

  const containerRef = useRef<HTMLDivElement>(null);
  const [positions,  setPositions] = useState<Record<string, BtnPos>>({});

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const cont = containerRef.current!.getBoundingClientRect();
      const next: Record<string, BtnPos> = {};
      ["all", "saved"].forEach((f) => {
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

  useEffect(() => {
    if (!user) setActiveFilter("all");
  }, [user]);

  if (rawSheets === undefined) return <DSASheetExploreSkeleton />;

  const allCategories = Array.from(
    new Set(sheets.map((s) => s.category ?? "").filter(Boolean)),
  ) as string[];

  const filteredSheets = sheets.filter((sheet) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      sheet.name.toLowerCase().includes(q) ||
      (sheet.description ?? "").toLowerCase().includes(q) ||
      (sheet.topics ?? []).some((t) =>
        (t.questions ?? []).some((qn) => qn.title.toLowerCase().includes(q)),
      );
    const matchesCategory = !selectedCategory || sheet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const finalSheets =
    activeFilter === "saved"
      ? filteredSheets.filter((s) => (savedSheets as SavedSheet[]).some((sv) => sv.slug === s.slug))
      : filteredSheets;

  const activePos = positions[activeFilter];

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 mt-8">

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
            DSA Sheets
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-sm text-[var(--text-muted)]"
          >
            Browse curated sheets for interviews, revision, and concept mastery.
          </motion.p>
        </div>

        <div className="flex items-center mb-8">
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
                All Sheets
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
                {(savedSheets as SavedSheet[]).length > 0 && (
                  <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold ml-0.5 ${
                    activeFilter === "saved"
                      ? "bg-[rgba(58,94,255,0.15)] text-[#3A5EFF]"
                      : "bg-[var(--bg-hover)] text-[var(--text-disabled)]"
                  }`}>
                    {(savedSheets as SavedSheet[]).length}
                  </span>
                )}
              </button>
            </div>
          )}
          <span className="ml-auto text-xs text-[var(--text-disabled)]">
            {filteredSheets.length} sheet{filteredSheets.length !== 1 && "s"}
          </span>
        </div>

        <div className="mb-8 space-y-3">
          <div className="relative flex items-center h-9 bg-[var(--bg-input)] rounded-md px-3 focus-within:bg-[var(--bg-hover)] transition-colors duration-100">
            <Search className="w-3.5 h-3.5 text-[var(--text-faint)] mr-2.5 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by sheet, topic, or question title…"
              className="flex-1 bg-transparent text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-sm text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
              <Tag className="w-3 h-3" />Filter
            </div>
            {allCategories.map((cat) => (
              <button
                key={cat}
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
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 text-xs text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
              >
                <X className="w-3 h-3" />Clear
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finalSheets.map((sheet) => {
              const progress   = computeProgress({ sheet, localAttempts: {}, attempts: attempts ?? [] });
              const isSaved    = (savedSheets as SavedSheet[]).some((s) => s.slug === sheet.slug);
              const isPinned   = pinnedSheet?.sheetSlug === sheet.slug;
              return (
                <DSACard
                  key={sheet.slug}
                  sheet={sheet}
                  progress={progress.total}
                  isSaved={isSaved}
                  isPinned={isPinned}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {activeFilter === "saved" && finalSheets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-2 py-20"
          >
            <Bookmark className="w-8 h-8 text-[var(--text-disabled)]" />
            <p className="text-sm text-[var(--text-faint)]">No saved sheets yet</p>
            <p className="text-xs text-[var(--text-disabled)]">
              Click <span className="text-[var(--text-muted)]">Save</span> on a sheet to add it here
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}