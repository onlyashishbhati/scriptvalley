"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import SheetHeader       from "../_components/SheetHeader";
import TopicSection      from "../_components/TopicSection";
import SheetProgressCard from "../_components/SheetProgressCard";
import FilterTabs        from "../_components/FilterTabs";
import PrintableSheet    from "../_components/PrintableSheet";
import { computeProgress }  from "@/app/dsa-sheet/lib/computeProgress";
import { useNotes }         from "@/hooks/useNotes";
import { DSASheet }         from "../types";
import DSASheetPageSkeleton from "../_components/Dsasheetpageskeleton";

export default function DSASheetPage() {
  const { user }   = useUser();
  const isLoggedIn = !!user;
  const userId     = user?.id ?? "";
  const params     = useParams();
  const sheetSlug  = params.sheetId as string;

  const sheet = useQuery(api.sheets.getBySlug, { slug: sheetSlug }) as DSASheet | undefined;

  const [openTopics,    setOpenTopics]    = useState<string[]>([]);
  const [filter,        setFilter]        = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [localAttempts, setLocalAttempts] = useState<Record<string, boolean>>({});

  const recordAttempt = useMutation(api.progress.recordAttempt);
  const attempts      = useQuery(api.progress.getAttempts, user ? { userId } : "skip");

  // PERF: single sheet-wide starred query instead of one per QuestionRow.
  const starredQuestions = useQuery(
    api.starred.getStarredByUser,
    user ? { userId } : "skip",
  ) ?? [];
  const starredSet = new Set(starredQuestions.map((s: { questionTitle: string }) => s.questionTitle));

  const { getNotes, updateNotes, isSaving } = useNotes();

  const handleNotesUpdate = async (_topic: string, _questionTitle: string, notes: string) => {
    try { await updateNotes(_questionTitle, notes); }
    catch (err) { console.error("Failed to update notes:", err); }
  };

  if (sheet === undefined) return <DSASheetPageSkeleton />;

  if (!sheet) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">404</p>
          <p className="text-sm text-[var(--text-faint)]">Sheet not found</p>
        </div>
      </div>
    );
  }

  const toggleTopic = (topicName: string) => {
    setOpenTopics((prev) =>
      prev.includes(topicName) ? prev.filter((t) => t !== topicName) : [...prev, topicName],
    );
  };

  const handleToggle = async (
    e: React.ChangeEvent<HTMLInputElement>,
    topicName: string,
    questionTitle: string,
    difficulty: string,
  ) => {
    const attempted = e.target.checked;
    setLocalAttempts((prev) => ({ ...prev, [`${topicName}_${questionTitle}`]: attempted }));
    try { await recordAttempt({ userId, questionTitle, sheetSlug, difficulty, attempted }); }
    catch (err) { console.error("recordAttempt failed", err); }
  };

  const totalFilteredQuestions = (sheet.topics ?? []).reduce((acc, topic) => {
    return acc + topic.questions.filter((q) => filter === "All" || q.difficulty === filter).length;
  }, 0);

  const progressData = computeProgress({ sheet, localAttempts, attempts });

  return (
    <>
      {/* ── Screen UI ─────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-[var(--bg-base)] sv-print-hide">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 mt-14 mb-16 space-y-8">

          <SheetHeader
            sheet={sheet}
            showDownload={!!sheet}
          />

          <SheetProgressCard progress={progressData} topics={sheet.topics} />

          <div className="flex items-center justify-between gap-4">
            <FilterTabs filter={filter} setFilter={setFilter} />
            <span className="shrink-0 text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
              {totalFilteredQuestions}q
            </span>
          </div>

          <div className="border-t border-[var(--border-subtle)]" />

          <div className="space-y-2">
            {sheet.topics.map((topic, index) => (
              <TopicSection
                key={`${topic.topic}-${index}`}
                topic={topic}
                index={index}
                isOpen={openTopics.includes(topic.topic)}
                toggleTopic={toggleTopic}
                filter={filter}
                attempts={attempts ?? []}
                localAttempts={localAttempts}
                handleToggle={handleToggle}
                sheetId={sheet.slug}
                onNotesUpdate={handleNotesUpdate}
                isSaving={isSaving}
                getNotes={getNotes}
                isLoggedIn={isLoggedIn}
                starredSet={starredSet}
              />
            ))}
          </div>

        </div>
      </div>

      {/* ── Printable version — hidden on screen, shown only during print ─── */}
      <PrintableSheet sheet={sheet} />
    </>
  );
}