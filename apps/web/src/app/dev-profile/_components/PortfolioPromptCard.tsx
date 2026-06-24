"use client";

/**
 * PortfolioPromptCard.tsx
 *
 * Drop this into your dev-profile page (app/dev-profile/page.tsx), inside
 * the "progress" view, e.g. right after the page heading / StatsSummaryRow:
 *
 *   import PortfolioPromptCard from "./_components/PortfolioPromptCard";
 *   ...
 *   <PortfolioPromptCard />
 *
 * This was the missing link: the Share tab (username + visibility) and
 * Portfolio tab (bio/skills/projects) existed in edit-profile, but nothing
 * on dev-profile pointed at them, so there was no way to discover the
 * mini-portfolio feature at all.
 *
 * IMPORT PATH NOTE: this file lives at app/dev-profile/_components/.
 * Your confirmed, working app/dev-profile/page.tsx imports packages/convex
 * with 5 "../" segments. This file is one folder deeper (_components/),
 * so it needs exactly one more — 6 total. The previous version of this
 * file had 7, which was wrong (that depth is correct for
 * app/edit-profile/_components/ and app/u/[username]/_components/, which
 * sit under a differently-shaped path — copying the wrong sibling's prefix
 * is what caused this).
 *
 * Two states:
 *   - No username set yet → prompts to set one up (drives to Share tab)
 *   - Username set, profile private → shows the share-readiness state
 *   - Username set, profile public → shows the live link + copy button
 */

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Sparkles, Copy, Check, ArrowRight } from "lucide-react";

type UserData = {
  username?: string | null;
  profileVisibility?: "public" | "private" | null;
};

export default function PortfolioPromptCard() {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const rawUserData = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const [copied, setCopied] = useState(false);

  const d = rawUserData as unknown as UserData | null;

  // Still loading
  if (rawUserData === undefined) {
    return <div className="h-20 rounded-lg bg-[var(--bg-input)] animate-pulse" />;
  }

  const hasUsername = !!d?.username;
  const isPublic = d?.profileVisibility === "public";
  const shareUrl = d?.username ? `scriptvalley.com/u/${d.username}` : null;

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(`https://${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  // ── State 1: no username yet — prompt setup ──────────────────────────────
  if (!hasUsername) {
    return (
      <Link
        href="/edit-profile?tab=Share"
        className="group flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 transition-colors duration-100"
      >
        <div className="w-8 h-8 rounded-md bg-[#3A5EFF0d] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[#3A5EFF]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Create your shareable mini-portfolio
          </p>
          <p className="text-xs text-[var(--text-faint)] mt-0.5">
            Get a public profile link to share on LinkedIn, Twitter, or your resume
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </Link>
    );
  }

  // ── State 2: username set, still private ─────────────────────────────────
  if (!isPublic) {
    return (
      <Link
        href="/edit-profile?tab=Share"
        className="group flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 transition-colors duration-100"
      >
        <div className="w-8 h-8 rounded-md bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[var(--text-faint)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Your portfolio is ready. Make it public.
          </p>
          <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono truncate">
            scriptvalley.com/u/{d?.username}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </Link>
    );
  }

  // ── State 3: public — show the live link ──────────────────────────────────
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
      <div className="w-8 h-8 rounded-md bg-[#22c55e0d] flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-[#22c55e]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">Your portfolio is live</p>
        <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono truncate">{shareUrl}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100 shrink-0"
        aria-label="Copy profile link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <Link
        href={`/u/${d?.username}`}
        target="_blank"
        className="text-xs font-medium text-[#3A5EFF] hover:text-[#4a6aff] shrink-0"
      >
        View →
      </Link>
    </div>
  );
}