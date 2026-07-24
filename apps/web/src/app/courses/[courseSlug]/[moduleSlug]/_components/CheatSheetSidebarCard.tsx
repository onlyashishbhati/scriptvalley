"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../../../../../packages/convex/convex/_generated/api";
import { FileText, Lock, Download, Eye, ChevronUp } from "lucide-react";

interface Props {
  courseSlug: string;
}

export default function CheatSheetSidebarCard({ courseSlug }: Props) {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);

  const access = useQuery(
    api.courses.getCheatSheetAccess,
    isLoaded ? { courseSlug } : "skip",
  ) as {
    hasSheet:    boolean;
    accessLevel: "none" | "view" | "download";
    url:         string | null;
    fileName:    string | null;
    pct?:        number;
    threshold?:  number | null;
  } | undefined;

  if (!access || !access.hasSheet) return null;

  const { accessLevel, url, fileName, pct = 0, threshold } = access;
  const displayName = fileName ?? "Cheat sheet";
  const locked = accessLevel === "none";

  return (
    <div className="mx-4 mb-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
          locked ? "bg-[var(--bg-hover)]" : "bg-[rgba(58,94,255,0.1)]"
        }`}>
          {locked ? <Lock className="w-3 h-3 text-[var(--text-disabled)]" /> : <FileText className="w-3 h-3 text-[#3A5EFF]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-secondary)] truncate">{displayName}</p>
          {locked ? (
            <p className="text-[10px] text-[var(--text-disabled)]">
              {user ? `Unlocks at ${threshold ?? 40}%` : "Sign in to unlock"}
            </p>
          ) : (
            <p className="text-[10px] text-[var(--text-disabled)]">
              {accessLevel === "download" ? "Ready to download" : `View unlocked · download at ${threshold ?? 50}%`}
            </p>
          )}
        </div>

        {!locked && url && accessLevel === "download" && (
          <a
            href={url}
            download={displayName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[#3A5EFF] hover:bg-[rgba(58,94,255,0.08)] transition-colors shrink-0"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        )}
        {!locked && url && accessLevel === "view" && (
          <button
            onClick={() => setOpen((p) => !p)}
            className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[#3A5EFF] hover:bg-[rgba(58,94,255,0.08)] transition-colors shrink-0"
            title={open ? "Hide" : "View"}
          >
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {locked && typeof pct === "number" && (
        <div className="px-3 pb-2.5">
          <div className="h-1 rounded-full bg-[var(--bg-hover)] overflow-hidden">
            <div
              className="h-full bg-[#3A5EFF] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {!locked && open && url && accessLevel === "view" && (
        <div className="px-3 pb-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#3A5EFF] hover:underline"
          >
            Open in new tab →
          </a>
        </div>
      )}
    </div>
  );
}