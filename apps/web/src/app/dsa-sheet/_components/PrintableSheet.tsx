"use client";

/**
 * PrintableSheet.tsx
 *
 * Generates a clean, paper-friendly DSA study sheet for printing.
 *
 * DESIGN DECISIONS:
 *   - No progress tracking — solved/unsolved state is intentionally excluded.
 *     The student uses the blank □ checkbox to tick questions by hand on paper.
 *   - No percentage bars, no completion counts — this is a reference sheet,
 *     not a progress report.
 *   - Every question from every topic is listed — no truncation, paginated
 *     naturally via CSS page flow.
 *   - Difficulty totals shown in the header strip (Easy/Medium/Hard counts)
 *     so the student knows what to expect, but no "solved X/Y" state.
 *   - ScriptValley branding in header and footer so it looks like a real
 *     official study resource.
 *
 * VISIBILITY FIX:
 *   Uses `visibility: hidden` on body + `visibility: visible` on this
 *   component and all descendants — the only technique that works for a
 *   deeply nested component (display:none on body > * cannot be overridden
 *   by display:block on a grandchild).
 */

import type { DSASheet } from "../types";

interface Props {
  sheet: DSASheet;
}

const DIFF_COLOR: Record<string, string> = {
  Easy:   "#22c55e",
  Medium: "#d97706",
  Hard:   "#dc2626",
};

export default function PrintableSheet({ sheet }: Props) {
  // Compute totals for the header strip — counts only, no progress
  let easyTotal = 0, mediumTotal = 0, hardTotal = 0;

  sheet.topics.forEach((topic) => {
    const allQuestions = topic.useSubTopics
      ? (topic.subTopics ?? []).flatMap((st) => st.questions)
      : topic.questions;
    allQuestions.forEach((q) => {
      if (q.difficulty === "Easy")   easyTotal++;
      else if (q.difficulty === "Medium") mediumTotal++;
      else if (q.difficulty === "Hard")   hardTotal++;
    });
  });

  const totalQuestions = easyTotal + mediumTotal + hardTotal;
  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="sv-print-only" aria-hidden="true">

      {/* ── Document header ─────────────────────────────────────────────── */}
      <div className="sv-print-doc-header">
        <div>
          <div className="sv-print-wordmark">
            <span className="sv-print-wordmark-text">ScriptValley</span>
            <span className="sv-print-wordmark-badge">DSA</span>
          </div>
          <p className="sv-print-sheet-label">Study Sheet</p>
          <h1 className="sv-print-sheet-title">{sheet.name}</h1>
          {sheet.description && (
            <p
              className="sv-print-sheet-desc"
              dangerouslySetInnerHTML={{ __html: sheet.description }}
            />
          )}
        </div>

        <div className="sv-print-header-meta">
          <p className="sv-print-total-label">Total Questions</p>
          <p className="sv-print-total-value">{totalQuestions}</p>
          <p className="sv-print-total-sub">{sheet.topics.length} topics</p>
        </div>
      </div>

      {/* ── Difficulty strip — totals only, no progress ─────────────────── */}
      <div className="sv-print-diff-strip">
        {[
          { label: "Easy",   count: easyTotal,   color: "#22c55e" },
          { label: "Medium", count: mediumTotal, color: "#d97706" },
          { label: "Hard",   count: hardTotal,   color: "#dc2626" },
        ].map(({ label, count, color }) => (
          <div key={label} className="sv-print-diff-cell">
            <span className="sv-print-diff-label" style={{ color }}>{label}</span>
            <span className="sv-print-diff-count" style={{ color }}>{count}</span>
            <span className="sv-print-diff-word">questions</span>
          </div>
        ))}
      </div>

      {/* ── Topics ──────────────────────────────────────────────────────── */}
      {sheet.topics.map((topic, ti) => {
        const isSubTopics = topic.useSubTopics && (topic.subTopics?.length ?? 0) > 0;
        const flatCount = isSubTopics
          ? (topic.subTopics ?? []).reduce((acc, st) => acc + st.questions.length, 0)
          : topic.questions.length;

        return (
          <div key={`${topic.topic}-${ti}`} className="sv-print-topic">

            {/* Topic header — dark bar */}
            <div className="sv-print-topic-header">
              <span className="sv-print-step-num">Step {ti + 1}</span>
              <span className="sv-print-topic-name">{topic.topic}</span>
              <span className="sv-print-topic-count">{flatCount} questions</span>
            </div>

            {isSubTopics ? (
              /* Sub-topic mode */
              (topic.subTopics ?? []).map((st, si) => (
                <div key={`${st.name}-${si}`}>
                  <p className="sv-print-subtopic-header">▸ {st.name}</p>
                  <table className="sv-print-table">
                    <tbody>
                      {st.questions.map((q, qi) => (
                        <tr key={`${q.title}-${qi}`} className="sv-print-row">
                          <td className="sv-print-col-check">
                            <span className="sv-print-checkbox-empty" />
                          </td>
                          <td className="sv-print-col-num">{qi + 1}</td>
                          <td className="sv-print-col-title">{q.title}</td>
                          <td className="sv-print-col-diff">
                            <span style={{ color: DIFF_COLOR[q.difficulty] ?? "#6b6b6b" }}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="sv-print-col-platform">
                            {q.link?.platform ?? ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              /* Flat mode */
              <table className="sv-print-table">
                <tbody>
                  {topic.questions.map((q, qi) => (
                    <tr key={`${q.title}-${qi}`} className="sv-print-row">
                      <td className="sv-print-col-check">
                        <span className="sv-print-checkbox-empty" />
                      </td>
                      <td className="sv-print-col-num">{qi + 1}</td>
                      <td className="sv-print-col-title">{q.title}</td>
                      <td className="sv-print-col-diff">
                        <span style={{ color: DIFF_COLOR[q.difficulty] ?? "#6b6b6b" }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="sv-print-col-platform">
                        {q.link?.platform ?? ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="sv-print-footer">
        <div className="sv-print-footer-left">
          <span className="sv-print-footer-dot" />
          ScriptValley · scriptvalley.com
        </div>
        <span>{printDate}</span>
      </div>
    </div>
  );
}