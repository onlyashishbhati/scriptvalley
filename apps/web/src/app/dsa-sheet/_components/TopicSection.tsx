"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import QuestionRow from "./QuestionRow";
import toast from "react-hot-toast";

interface Question {
  title:      string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  link:       { platform: string; url: string };
}

interface SubTopic {
  name:      string;
  questions: Question[];
}

interface Attempt {
  questionTitle: string;
  attempted:     boolean;
}

interface Topic {
  topic:        string;
  questions:    Question[];
  useSubTopics: boolean;
  subTopics?:   SubTopic[];
}

interface TopicSectionProps {
  topic:         Topic;
  index:         number;
  isOpen:        boolean;
  toggleTopic:   (topic: string) => void;
  attempts:      Attempt[];
  localAttempts: Record<string, boolean>;
  handleToggle:  (
    e:             React.ChangeEvent<HTMLInputElement>,
    topic:         string,
    questionTitle: string,
    difficulty:    string,
  ) => void;
  filter:        "All" | "Easy" | "Medium" | "Hard";
  sheetId:       string;
  isLoggedIn:    boolean;
  onNotesUpdate: (topic: string, questionTitle: string, notes: string) => Promise<void>;
  isSaving:      boolean;
  getNotes:      (questionTitle: string) => string | undefined;
  // PERF: whole-sheet starred set, fetched once by the page (getStarredByUser)
  // and threaded down here instead of each QuestionRow subscribing individually.
  starredSet:    Set<string>;
}

// ─── Sub-topic accordion (used inside a topic when useSubTopics = true) ────────

function SubTopicAccordion({
  subTopic,
  topicName,
  filter,
  attempts,
  localAttempts,
  handleToggle,
  sheetId,
  isLoggedIn,
  starredSet,
}: {
  subTopic:      SubTopic;
  topicName:     string;
  filter:        "All" | "Easy" | "Medium" | "Hard";
  attempts:      Attempt[];
  localAttempts: Record<string, boolean>;
  handleToggle:  TopicSectionProps["handleToggle"];
  sheetId:       string;
  isLoggedIn:    boolean;
  starredSet:    Set<string>;
}) {
  const [open, setOpen] = useState(false);

  const filteredQuestions = subTopic.questions.filter(
    (q) => filter === "All" || q.difficulty === filter,
  );

  const attemptedCount = filteredQuestions.filter((q) => {
    const key = `${topicName}_${q.title}`;
    return (
      localAttempts[key] ??
      attempts.some((a) => a.questionTitle === q.title && a.attempted)
    );
  }).length;

  const totalQ = filteredQuestions.length;
  const pct    = totalQ === 0 ? 0 : Math.round((attemptedCount / totalQ) * 100);

  return (
    <div className="border-t border-[var(--border-subtle)]">
      {/* Sub-topic header */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-5 py-2.5 bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] transition-colors duration-100 text-left"
      >
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.12 }}>
            <ChevronDown className="w-3 h-3 text-[var(--text-disabled)]" />
          </motion.div>
          <span className="text-[11px] text-[var(--text-faint)] font-medium">
            {subTopic.name}
          </span>
          {totalQ > 0 && (
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-disabled)] bg-[var(--bg-hover)] px-1.5 py-0.5 rounded">
              {totalQ}q
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-5 sm:pl-0">
          <span className="text-[10px] text-[var(--text-disabled)]">
            {attemptedCount}/{totalQ}
          </span>
          {/* Progress bar — brand blue intentionally hardcoded */}
          <div className="w-24 h-[3px] rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div
              className="h-full bg-[#3A5EFF] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-disabled)] w-7 text-right">
            {pct}%
          </span>
        </div>
      </button>

      {/* Sub-topic question rows */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              {filteredQuestions.length === 0 ? (
                <div className="py-6 text-center text-sm text-[var(--text-disabled)] border-t border-[var(--border-subtle)]">
                  No {filter} problems in this sub-topic
                </div>
              ) : (
                filteredQuestions.map((q, i) => (
                  <QuestionRow
                    key={q.title}
                    question={q}
                    topic={topicName}
                    sheetId={sheetId}
                    isLoggedIn={isLoggedIn}
                    isLast={i === filteredQuestions.length - 1}
                    isStarred={starredSet.has(q.title)}
                    attempted={
                      localAttempts[`${topicName}_${q.title}`] ??
                      attempts.find((a) => a.questionTitle === q.title)?.attempted ??
                      false
                    }
                    handleToggle={(e, questionTitle) => {
                      if (!isLoggedIn) {
                        toast.error("Login to track your progress");
                        return;
                      }
                      handleToggle(e, topicName, questionTitle, q.difficulty);
                    }}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TopicSection ──────────────────────────────────────────────────────────────

export default function TopicSection({
  topic,
  index,
  isOpen,
  toggleTopic,
  attempts,
  localAttempts,
  handleToggle,
  filter,
  sheetId,
  isLoggedIn,
  starredSet,
}: TopicSectionProps) {

  // ── Flat mode counts ──────────────────────────────────────────────────────
  const flatFiltered = topic.useSubTopics
    ? []
    : topic.questions.filter((q) => filter === "All" || q.difficulty === filter);

  // ── Sub-topic mode counts — aggregate across all sub-topics ──────────────
  const subTopicFiltered = topic.useSubTopics
    ? (topic.subTopics ?? []).flatMap((st) =>
        st.questions.filter((q) => filter === "All" || q.difficulty === filter)
      )
    : [];

  const allFiltered   = topic.useSubTopics ? subTopicFiltered : flatFiltered;
  const attemptedCount = allFiltered.filter((q) => {
    const key = `${topic.topic}_${q.title}`;
    return (
      localAttempts[key] ??
      attempts.some((a) => a.questionTitle === q.title && a.attempted)
    );
  }).length;

  const totalQ = allFiltered.length;
  const pct    = totalQ === 0 ? 0 : Math.round((attemptedCount / totalQ) * 100);

  return (
    <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">

      {/* Topic header */}
      <button
        onClick={() => toggleTopic(topic.topic)}
        className="w-full flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-[var(--bg-input)] hover:bg-[var(--bg-elevated)] transition-colors duration-100 text-left"
      >
        <div className="flex items-center gap-2.5">
          <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.15 }}>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-faint)]" />
          </motion.div>
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
            Step {index + 1}
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {topic.topic}
          </span>
          {topic.useSubTopics && (
            <span className="text-[9px] uppercase tracking-widest text-[var(--text-disabled)] bg-[var(--bg-hover)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded">
              {(topic.subTopics ?? []).length} sub-topics
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 sm:pl-0">
          <span className="text-[10px] text-[var(--text-disabled)]">
            {attemptedCount}/{totalQ}
          </span>
          {/* Progress bar — brand blue intentionally hardcoded */}
          <div className="w-32 h-1 rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div
              className="h-full bg-[#3A5EFF] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-disabled)] w-7 text-right">
            {pct}%
          </span>
        </div>
      </button>

      {/* Body — flat questions OR sub-topic accordions */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {topic.useSubTopics ? (
              // ── Sub-topics mode ───────────────────────────────────────────
              <div>
                {(topic.subTopics ?? []).length === 0 ? (
                  <div className="py-8 text-center text-sm text-[var(--text-disabled)] border-t border-[var(--border-subtle)]">
                    No sub-topics in this section
                  </div>
                ) : (
                  (topic.subTopics ?? []).map((st, si) => (
                    <SubTopicAccordion
                      key={`${st.name}-${si}`}
                      subTopic={st}
                      topicName={topic.topic}
                      filter={filter}
                      attempts={attempts}
                      localAttempts={localAttempts}
                      handleToggle={handleToggle}
                      sheetId={sheetId}
                      isLoggedIn={isLoggedIn}
                      starredSet={starredSet}
                    />
                  ))
                )}
              </div>
            ) : (
              // ── Flat mode ─────────────────────────────────────────────────
              <div className="overflow-x-auto">
                {flatFiltered.map((q, i) => (
                  <QuestionRow
                    key={q.title}
                    question={q}
                    topic={topic.topic}
                    sheetId={sheetId}
                    isLoggedIn={isLoggedIn}
                    isLast={i === flatFiltered.length - 1}
                    isStarred={starredSet.has(q.title)}
                    attempted={
                      localAttempts[`${topic.topic}_${q.title}`] ??
                      attempts.find((a) => a.questionTitle === q.title)?.attempted ??
                      false
                    }
                    handleToggle={(e, questionTitle) => {
                      if (!isLoggedIn) {
                        toast.error("Login to track your progress");
                        return;
                      }
                      handleToggle(e, topic.topic, questionTitle, q.difficulty);
                    }}
                  />
                ))}

                {flatFiltered.length === 0 && (
                  <div className="py-8 text-center text-sm text-[var(--text-disabled)] border-t border-[var(--border-default)]">
                    No {filter} problems in this topic
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}