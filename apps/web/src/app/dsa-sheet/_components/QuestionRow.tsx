"use client";

import { useState } from "react";
import { ClipboardCheck, ClipboardPen, Star, ExternalLink } from "lucide-react";
import { CiLock } from "react-icons/ci";
import NotesModal from "./NotesModal";
import { useNotes } from "@/hooks/useNotes";
import toast from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";

interface Question {
  title:      string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  link?:      { platform?: string; url?: string } | null;
}

interface QuestionRowProps {
  question:     Question;
  isLast:       boolean;
  attempted:    boolean;
  handleToggle: (e: React.ChangeEvent<HTMLInputElement>, questionTitle: string) => void;
  sheetId:      string;
  topic:        string;
  isLoggedIn:   boolean;
  isStarred:    boolean;
}

const DIFF_STYLE: Record<string, string> = {
  Easy:   "text-[#22c55e] bg-[#22c55e0d] border-[#22c55e25]",
  Medium: "text-[#f59e0b] bg-[#f59e0b0d] border-[#f59e0b25]",
  Hard:   "text-red-400 bg-red-500/[0.05] border-red-500/20",
};

function PlatformIcon({ platform }: { platform?: string }) {
  const [imgError, setImgError] = useState(false);
  const key = (platform ?? "").toLowerCase();

  const FALLBACK: Record<string, { label: string; color: string }> = {
    leetcode:     { label: "LC",  color: "#f89f1b" },
    gfg:          { label: "GFG", color: "#2f8d46" },
    codingninjas: { label: "CN",  color: "#f4813f" },
    hackerrank:   { label: "HR",  color: "#2ec866" },
    codeforces:   { label: "CF",  color: "#1f8acb" },
  };

  if (!imgError && key) {
    return (
      <img
        src={`/${key}.png`}
        alt={key}
        width={16}
        height={16}
        className="object-contain opacity-80 hover:opacity-100 transition-opacity w-4 h-4"
        onError={() => setImgError(true)}
      />
    );
  }

  const meta = FALLBACK[key];
  if (meta) {
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold leading-none"
        style={{ background: `${meta.color}18`, color: meta.color, border: `1px solid ${meta.color}30` }}
      >
        {meta.label}
      </span>
    );
  }

  return <ExternalLink className="w-3.5 h-3.5 text-[var(--text-disabled)]" />;
}

export default function QuestionRow({
  question, attempted, handleToggle, sheetId, topic, isLoggedIn, isStarred,
}: QuestionRowProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { getNotes, updateNotes, deleteNotes, isSaving } = useNotes();
  const noteContent = getNotes(question.title);

  const { user } = useUser();
  const userId   = user?.id ?? "";

  const toggleStar = useMutation(api.starred.toggleStar);

  const handleStar = async () => {
    if (!isLoggedIn || !userId) { toast.error("Login to star questions"); return; }
    try {
      await toggleStar({
        userId,
        sheetSlug:     sheetId,
        topic,
        questionTitle: question.title,
      });
    } catch {
      toast.error("Failed to star question");
    }
  };

  const linkUrl      = question.link?.url      ?? "#";
  const linkPlatform = question.link?.platform;

  const diffClass = DIFF_STYLE[question.difficulty]
    ?? "text-[var(--text-faint)] bg-[var(--bg-hover)] border-[var(--border-subtle)]";

  return (
    <>
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-4 py-3 text-sm transition-colors duration-100 hover:bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">

        <div className="flex items-center gap-2.5 min-w-0">
          {isLoggedIn ? (
            <input
              type="checkbox"
              checked={attempted}
              onChange={(e) => handleToggle(e, question.title)}
              className="h-3.5 w-3.5 rounded-sm border-[var(--border-medium)] bg-transparent accent-[#3A5EFF] shrink-0 focus:ring-0 focus:outline-none cursor-pointer"
            />
          ) : (
            <button onClick={() => toast.error("Login to track progress")} className="shrink-0">
              <CiLock className="w-3.5 h-3.5 text-[var(--text-disabled)]" />
            </button>
          )}
          <span className={`text-sm leading-snug truncate ${
            attempted ? "line-through text-[var(--text-disabled)]" : "text-[var(--text-secondary)]"
          }`}>
            {question.title}
          </span>
        </div>

        {/* Practice link */}
        <div className="flex justify-center w-12">
          {isLoggedIn ? (
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-[var(--text-faint)] hover:bg-[var(--bg-hover)] transition-colors duration-100 flex items-center justify-center"
            >
              <PlatformIcon platform={linkPlatform} />
            </a>
          ) : (
            <CiLock className="w-3.5 h-3.5 text-[var(--text-disabled)]" />
          )}
        </div>

        {/* Notes */}
        <div className="flex justify-center w-12">
          {isLoggedIn ? (
            <button
              onClick={() => setModalOpen(true)}
              className={`p-1.5 rounded-md transition-colors duration-100 ${
                noteContent
                  ? "text-[#3A5EFF] hover:bg-[#3A5EFF]/[0.08]"
                  : "text-[var(--text-disabled)] hover:text-[var(--text-faint)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {noteContent
                ? <ClipboardCheck className="w-3.5 h-3.5" />
                : <ClipboardPen   className="w-3.5 h-3.5" />
              }
            </button>
          ) : (
            <CiLock className="w-3.5 h-3.5 text-[var(--text-disabled)]" />
          )}
        </div>

        {/* Star */}
        <div className="flex justify-center w-12">
          <button
            onClick={handleStar}
            className={`p-1.5 rounded-md transition-colors duration-100 ${
              isStarred
                ? "text-[#f59e0b] hover:bg-[#f59e0b]/[0.08]"
                : "text-[var(--text-disabled)] hover:text-[#f59e0b] hover:bg-[var(--bg-hover)]"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? "fill-[#f59e0b]" : ""}`} />
          </button>
        </div>

        {/* Difficulty badge */}
        <div className="flex justify-center w-12">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${diffClass}`}>
            {question.difficulty}
          </span>
        </div>
      </div>

      {isModalOpen && isLoggedIn && (
        <NotesModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(content) => updateNotes(question.title, content)}
          onDelete={() => deleteNotes(question.title)}
          initialNotes={noteContent ?? ""}
          questionTitle={question.title}
          isSaving={isSaving}
        />
      )}
    </>
  );
}