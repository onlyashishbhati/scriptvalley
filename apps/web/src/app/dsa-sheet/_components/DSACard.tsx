"use client";

import Link from "next/link";
import { Pin, PinOff, Bookmark, BookmarkCheck, ListCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { DSASheet } from "@/app/dsa-sheet/types";
import { useMutation } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

type ProgressType = { completed: number; total: number };

interface Props {
  sheet: DSASheet;
  progress: ProgressType;
  // CHANGED: isFollowed replaced with isPinned — "follow" (the old
  // unlimited multi-sheet concept) has been retired. isSaved stays as the
  // unlimited bookmark; isPinned is the NEW single-item "show on my
  // dashboard" shortcut.
  isPinned: boolean;
  isSaved: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  popular:          { bg: "rgba(58,94,255,0.08)",  border: "rgba(58,94,255,0.2)",  text: "#3A5EFF" },
  "complete-dsa":   { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", text: "#818cf8" },
  "quick-revision": { bg: "rgba(34,197,94,0.08)",  border: "rgba(34,197,94,0.2)",  text: "#4ade80" },
  "topic-specific": { bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.2)", text: "#38bdf8" },
};

function stripHtml(html: string) { return html.replace(/<[^>]+>/g, ""); }

export default function DSACard({ sheet, progress, isPinned, isSaved }: Props) {
  const { user } = useUser();
  const pinMutation   = useMutation(api.pins.pinSheet);
  const unpinMutation = useMutation(api.pins.unpinSheet);
  const toggleSaveMutation = useMutation(api.sheets.saveOrUnsaveSheet);

  const totalQuestions = sheet.topics.reduce((acc, t) => acc + (t.questions?.length ?? 0), 0);
  const pct      = Math.floor((progress.completed / Math.max(1, progress.total)) * 100) || 0;
  const catStyle = CATEGORY_COLORS[sheet.category ?? ""];

  const togglePin = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return;
    try {
      if (isPinned) await unpinMutation({});
      else await pinMutation({ sheetSlug: sheet.slug });
    } catch (err) { console.error(err); }
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return;
    try { await toggleSaveMutation({ sheetSlug: sheet.slug, save: !isSaved }); }
    catch (err) { console.error(err); }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="group"
    >
      <Link href={`/dsa-sheet/${sheet.slug}`} className="block h-full">
        <div className="relative h-[200px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] transition-colors duration-100 overflow-hidden flex flex-col">

          <div className="absolute inset-x-0 top-0 h-[2px] bg-[var(--bg-hover)]">
            <div
              className="h-full bg-[#3A5EFF] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="p-4 flex flex-col gap-2.5 h-full pt-5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-1">
                <h2 className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate">
                  {sheet.name}
                </h2>
                {sheet.category && catStyle && (
                  <span
                    className="inline-flex text-[10px] uppercase tracking-widest rounded-md px-2 py-0.5 border"
                    style={{ background: catStyle.bg, borderColor: catStyle.border, color: catStyle.text }}
                  >
                    {sheet.category}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-[10px] text-[var(--text-disabled)] bg-[var(--bg-hover)] rounded px-2 py-0.5">
                {pct}%
              </span>
            </div>

            <p className="text-xs text-[var(--text-faint)] line-clamp-2 leading-relaxed">
              {stripHtml(sheet.description ?? "")}
            </p>

            <div className="mt-auto pt-2.5 border-t border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-disabled)]">
                <ListCheck className="w-3.5 h-3.5" />
                <span>{totalQuestions} questions</span>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                <button
                  onClick={togglePin}
                  title={isPinned ? "Unpin from dashboard" : "Pin to dashboard"}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors duration-100 ${
                    isPinned
                      ? "text-[#3A5EFF] bg-[#3A5EFF]/[0.08]"
                      : "text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                  {isPinned ? "Pinned" : "Pin"}
                </button>
                <button
                  onClick={toggleSave}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors duration-100 ${
                    isSaved
                      ? "text-[#3A5EFF] bg-[#3A5EFF]/[0.08]"
                      : "text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {isSaved
                    ? <BookmarkCheck className="w-3 h-3 fill-[#3A5EFF]" />
                    : <Bookmark       className="w-3 h-3" />
                  }
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}