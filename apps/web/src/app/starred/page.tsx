"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../packages/convex/convex/_generated/api";
import { useMemo, useState } from "react";
import { Star, X } from "lucide-react";
import QuestionRow from "@/app/dsa-sheet/_components/QuestionRow";
import toast from "react-hot-toast";
import { Doc } from "../../../../../packages/convex/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import StarredPageSkeleton from "./_components/Starredpageskeleton";
import ProtectedRoute from "@/components/ProtectedRoute";

type StarredItem = Doc<"starred_questions">;
type Attempt     = Doc<"attempts">;

type QuestionRowQuestion = {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  link: { platform: string; url: string };
  githubLink?: string;
};

type Topic = { topic: string; questions?: QuestionRowQuestion[] };

type Sheet = {
  _id: string;
  slug: string;
  name: string;
  category?: string;
  description?: string;
  note?: unknown;
  content?: { topics?: Topic[] };
  topics?: Topic[];
  createdBy?: string;
  createdAt: number;
  updatedAt?: number;
  order?: number;
};

type EnrichedStarred = StarredItem & { sheet: Sheet; topicObj: Topic; question: QuestionRowQuestion };

function StarredContent() {
  const { user, isLoaded } = useUser();
  const userId = user?.id ?? "";

  const starred  = useQuery(api.starred.getStarredByUser, userId ? { userId } : "skip");
  const sheets   = useQuery(api.sheets.getAll) as Sheet[] | undefined;
  const attempts = useQuery(api.progress.getAttempts, userId ? { userId } : "skip");
  const recordAttempt = useMutation(api.progress.recordAttempt);

  const [sheetFilter, setSheetFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");
  // Optimistic local overrides for the attempted checkbox on this page —
  // mirrors the pattern used on the sheet detail page.
  const [localAttempts, setLocalAttempts] = useState<Record<string, boolean>>({});

  const enriched = useMemo<EnrichedStarred[]>(() => {
    if (!starred || !sheets) return [];
    const result: EnrichedStarred[] = [];
    for (const s of starred) {
      const sheet = sheets.find((sh) => sh.slug === s.sheetSlug);
      if (!sheet) continue;
      const topics = sheet.content?.topics || sheet.topics;
      if (!topics) continue;
      const topicObj = topics.find((t) => t.topic === s.topic);
      if (!topicObj) continue;
      const question = topicObj.questions?.find((q) => q.title === s.questionTitle);
      if (!question) continue;
      result.push({ ...s, sheet, topicObj, question });
    }
    return result;
  }, [starred, sheets]);

  const filtered = useMemo(
    () => enriched.filter((q) =>
      (sheetFilter === "All" || q.sheetSlug === sheetFilter) &&
      (topicFilter === "All" || q.topic === topicFilter),
    ),
    [enriched, sheetFilter, topicFilter],
  );

  const allSheets = ["All", ...new Set(enriched.map((q) => q.sheetSlug))];
  const allTopics = [
    "All",
    ...new Set(
      sheetFilter === "All"
        ? enriched.map((q) => q.topic)
        : enriched.filter((q) => q.sheetSlug === sheetFilter).map((q) => q.topic),
    ),
  ];

  // BUG FIX: this handler previously ignored the checkbox event entirely and
  // just showed a "Progress updated" toast without ever calling
  // recordAttempt — so the checkbox looked interactive but silently did
  // nothing, while telling the user it worked. Wired it to actually persist
  // the attempt, same as the sheet detail page.
  async function handleToggle(
    e: React.ChangeEvent<HTMLInputElement>,
    item: EnrichedStarred,
  ) {
    const attempted = e.target.checked;
    setLocalAttempts((prev) => ({ ...prev, [item.question.title]: attempted }));
    try {
      await recordAttempt({
        userId,
        questionTitle: item.question.title,
        sheetSlug: item.sheetSlug,
        difficulty: item.question.difficulty,
        attempted,
      });
      toast.success("Progress updated");
    } catch (err) {
      console.error("recordAttempt failed", err);
      toast.error("Failed to update progress");
    }
  }

  if (!isLoaded || (user && (!starred || !sheets))) {
    return <StarredPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 mt-8 mb-16 space-y-8">

        {/* Header */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1"
          >
            DSA
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="flex items-center gap-2 mb-2"
          >
            <Star className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b]" />
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Starred Questions</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-sm text-[var(--text-muted)]"
          >
            {enriched.length} starred · {filtered.length} showing
          </motion.p>
        </div>

        {/* Sheet filter */}
        {allSheets.length > 1 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Sheet</p>
            <div className="flex flex-wrap gap-1.5">
              {allSheets.map((s) => {
                const label = s === "All" ? "All" : (sheets?.find((sh) => sh.slug === s)?.name ?? s);
                return (
                  <button
                    key={s}
                    onClick={() => { setSheetFilter(s); setTopicFilter("All"); }}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors duration-100 ${
                      sheetFilter === s
                        ? "bg-[var(--bg-active)] border-[var(--border-medium)] text-[var(--text-secondary)]"
                        : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Topic filter */}
        {allTopics.length > 1 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {allTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopicFilter(t)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors duration-100 ${
                    topicFilter === t
                      ? "bg-[var(--bg-active)] border-[var(--border-medium)] text-[var(--text-secondary)]"
                      : "border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filter pills */}
        {(sheetFilter !== "All" || topicFilter !== "All") && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Filtering by</span>
            {sheetFilter !== "All" && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-md px-2 py-0.5">
                {sheets?.find((sh) => sh.slug === sheetFilter)?.name ?? sheetFilter}
                <button
                  onClick={() => { setSheetFilter("All"); setTopicFilter("All"); }}
                  className="text-[var(--text-disabled)] hover:text-[var(--text-muted)]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {topicFilter !== "All" && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] bg-[var(--bg-hover)] border border-[var(--border-subtle)] rounded-md px-2 py-0.5">
                {topicFilter}
                <button
                  onClick={() => setTopicFilter("All")}
                  className="text-[var(--text-disabled)] hover:text-[var(--text-muted)]"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="border-t border-[var(--border-subtle)]" />

        {/* List */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-2 py-16 text-[var(--bg-active)]"
            >
              <Star className="w-8 h-8" />
              <p className="text-sm text-[var(--text-faint)]">No starred questions found</p>
              <p className="text-xs text-[var(--text-disabled)]">Star a question from any sheet to see it here</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-[var(--border-subtle)] overflow-hidden"
            >
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[var(--bg-input)] border-b border-[var(--border-default)]">
                <span className="flex-1 text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Problem</span>
              </div>
              {filtered.map((item, i) => {
                const attempted =
                  localAttempts[item.question.title] ??
                  (attempts?.find((a: Attempt) => a.questionTitle === item.question.title)?.attempted ?? false);
                return (
                  <QuestionRow
                    key={item._id}
                    question={item.question}
                    topic={item.topic}
                    sheetId={item.sheetSlug}
                    isLoggedIn={true}
                    isLast={i === filtered.length - 1}
                    attempted={attempted}
                    // This page shows only starred questions, so every row
                    // here is, by definition, starred.
                    isStarred={true}
                    handleToggle={(e) => handleToggle(e, item)}
                  />
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default function StarredPage() {
  return (
    <ProtectedRoute>
      <StarredContent />
    </ProtectedRoute>
  );
}