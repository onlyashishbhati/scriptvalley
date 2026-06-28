"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Sparkles, Copy, Check, ArrowRight, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

type UserData = {
  username?: string | null;
  profileVisibility?: "public" | "private" | null;
};

export default function PortfolioPromptCard() {
  const { user } = useUser();
  const userId = user?.id ?? "";
  const router = useRouter();
  const rawUserData = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const [copied, setCopied] = useState(false);

  const d = rawUserData as unknown as UserData | null;

  if (rawUserData === undefined) {
    return <div className="h-20 rounded-lg bg-[var(--bg-input)] animate-pulse" />;
  }

  const hasUsername = !!d?.username;
  const isPublic = d?.profileVisibility === "public";
  const shareUrl = d?.username ? `https://scriptvalley.com/u/${d.username}` : null;

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link.");
    }
  }

  function handleViewPortfolio() {
    if (!shareUrl) return;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  }

  // ── State 1: no username — toast + redirect to Share tab ─────────────────
  if (!hasUsername) {
    return (
      <button
        type="button"
        onClick={() => {
          toast("Set up your username first to get a public portfolio link.", { icon: "✨" });
          router.push("/dev-profile/edit-profile?tab=Share");
        }}
        className="group w-full flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 transition-colors duration-100 text-left"
      >
        <div className="w-8 h-8 rounded-md bg-[#3A5EFF0d] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[#3A5EFF]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Create your shareable portfolio
          </p>
          <p className="text-xs text-[var(--text-faint)] mt-0.5">
            Get a public profile link to share on LinkedIn, Twitter, or your resume
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </button>
    );
  }

  // ── State 2: username set but private — toast + redirect to Share tab ─────
  if (!isPublic) {
    return (
      <button
        type="button"
        onClick={() => {
          toast("Your portfolio is private. Make it public to share it.", { icon: "🔒" });
          router.push("/dev-profile/edit-profile?tab=Share");
        }}
        className="group w-full flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 transition-colors duration-100 text-left"
      >
        <div className="w-8 h-8 rounded-md bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[var(--text-faint)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Your portfolio is ready. Make it public
          </p>
          <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono truncate">
            scriptvalley.com/u/{d?.username}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
      </button>
    );
  }

  // ── State 3: public — copy + open in new tab ──────────────────────────────
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
      <div className="w-8 h-8 rounded-md bg-[#22c55e0d] flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-[#22c55e]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">Your portfolio is live</p>
        <p className="text-xs text-[var(--text-faint)] mt-0.5 font-mono truncate">
          scriptvalley.com/u/{d?.username}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100 shrink-0"
        aria-label="Copy profile link"
      >
        {copied
          ? <Check className="w-3.5 h-3.5 text-[#22c55e]" />
          : <Copy className="w-3.5 h-3.5" />
        }
      </button>

      <button
        type="button"
        onClick={handleViewPortfolio}
        className="flex items-center gap-1 text-xs font-medium text-[#3A5EFF] hover:text-[#4a6aff] shrink-0 transition-colors duration-100"
      >
        View <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  );
}