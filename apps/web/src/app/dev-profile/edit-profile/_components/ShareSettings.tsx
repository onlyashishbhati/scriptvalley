"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import { useUser, useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Link2, Eye, EyeOff, Copy, Check, Share2 as ShareIcon } from "lucide-react";

type UserData = {
  username?: string | null;
  profileVisibility?: "public" | "private" | null;
  name?: string | null;
  collegeName?: string | null;
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1.5">{children}</p>;
}

// Debounce delay for the live username availability check.
const AVAILABILITY_DEBOUNCE_MS = 400;

export default function ShareSettings() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id ?? "";

  const rawUserData = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const setUsername = useMutation(api.users.setUsername);
  const setProfileVisibility = useMutation(api.users.setProfileVisibility);

  const [usernameInput, setUsernameInput] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [hydratedUsername, setHydratedUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const d = rawUserData as unknown as UserData | null;

  useEffect(() => {
    if (d && !hydratedUsername) {
      setUsernameInput(d.username ?? "");
      setHydratedUsername(true);
    }
  }, [d, hydratedUsername]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedUsername(usernameInput), AVAILABILITY_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [usernameInput]);

  const availability = useQuery(
    api.users.checkUsernameAvailability,
    userId && debouncedUsername.length >= 3
      ? { username: debouncedUsername, currentUserId: userId }
      : "skip",
  );

  const isCurrentUsername = d?.username === debouncedUsername.toLowerCase();
  const isChecking = usernameInput !== debouncedUsername && usernameInput.length >= 3;
  const canSaveUsername =
    usernameInput.length >= 3 &&
    usernameInput === debouncedUsername &&
    (isCurrentUsername || availability?.available === true);

  async function handleSaveUsername() {
    if (!isSignedIn || !userId) {
      toast.error("Please sign in.");
      return;
    }
    setIsSaving(true);
    try {
      try {
        await getToken({ template: "convex" });
      } catch {
        /* noop */
      }
      await setUsername({ userId, username: usernameInput });
      toast.success("Username saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save username.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleVisibility(next: "public" | "private") {
    if (!isSignedIn || !userId) {
      toast.error("Please sign in.");
      return;
    }
    try {
      await setProfileVisibility({ userId, visibility: next });
      toast.success(next === "public" ? "Profile is now public" : "Profile is now private");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update visibility.");
    }
  }

  const isPublic = d?.profileVisibility === "public";
  const shareUrl = d?.username ? `scriptvalley.com/u/${d.username}` : null;

  async function handleCopyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(`https://${shareUrl}`);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link.");
    }
  }

  async function handleNativeShare() {
    if (!shareUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "My ScriptValley profile", url: `https://${shareUrl}` });
        return;
      } catch {
        /* user cancelled */
      }
    }
    handleCopyLink();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="max-w-xl space-y-8"
    >
      {/* ── Username ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label>Username</Label>

        <div className="rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors duration-100 overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[var(--bg-input)] border-b border-[var(--border-default)]">
            <div className="w-6 h-6 rounded-md bg-[var(--bg-hover)] flex items-center justify-center shrink-0">
              <Link2 className="w-3.5 h-3.5 text-[var(--text-faint)]" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] flex-1">
              Your profile URL
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-base)]">
            <span className="text-xs text-[var(--text-disabled)] shrink-0 select-none">
              scriptvalley.com/u/
            </span>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
              placeholder="username"
              maxLength={20}
              className="flex-1 bg-transparent text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-disabled)] outline-none"
            />
            <button
              type="button"
              onClick={handleSaveUsername}
              disabled={!canSaveUsername || isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-xs font-medium transition-colors duration-100 disabled:opacity-50 shrink-0"
            >
              {isSaving ? "…" : "Save"}
            </button>
          </div>
        </div>

        <div className="px-1">
          {usernameInput.length > 0 && usernameInput.length < 3 && (
            <p className="text-[10px] text-[var(--text-disabled)]">At least 3 characters</p>
          )}
          {isChecking && <p className="text-[10px] text-[var(--text-disabled)]">Checking…</p>}
          {!isChecking &&
            usernameInput === debouncedUsername &&
            debouncedUsername.length >= 3 &&
            !isCurrentUsername &&
            availability && (
              <p className={`text-[10px] ${availability.available ? "text-[#22c55e]" : "text-red-400/70"}`}>
                {availability.available
                  ? "✓ Available"
                  : availability.reason === "taken"
                    ? "✗ Already taken"
                    : "✗ Invalid format — lowercase letters, numbers, hyphens, underscores only"}
              </p>
            )}
        </div>
      </div>

      {/* ── Visibility ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label>Profile Visibility</Label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleToggleVisibility("private")}
            className={`flex items-start gap-2.5 px-3 py-3 rounded-lg border text-left transition-colors duration-100 ${
              !isPublic
                ? "border-[#3A5EFF] bg-[#3A5EFF0d]"
                : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
            }`}
          >
            <EyeOff className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${!isPublic ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"}`} />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Private</p>
              <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">Only you can see this</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleToggleVisibility("public")}
            disabled={!d?.username}
            className={`flex items-start gap-2.5 px-3 py-3 rounded-lg border text-left transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed ${
              isPublic
                ? "border-[#3A5EFF] bg-[#3A5EFF0d]"
                : "border-[var(--border-subtle)] hover:border-[var(--border-default)]"
            }`}
          >
            <Eye className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isPublic ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"}`} />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Public</p>
              <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">Anyone with the link</p>
            </div>
          </button>
        </div>

        {!d?.username && (
          <p className="text-[10px] text-[var(--text-disabled)] px-1">
            Set a username above before making your profile public.
          </p>
        )}
      </div>

      {/* ── Share link ────────────────────────────────────────────────── */}
      {isPublic && shareUrl && (
        <div className="space-y-3">
          <Label>Share</Label>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)]">
            <span className="flex-1 text-sm text-[var(--text-secondary)] truncate font-mono">{shareUrl}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleNativeShare}
              className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100 shrink-0 sm:hidden"
            >
              <ShareIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}