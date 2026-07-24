"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { Users2, Lock, Globe, Copy, Check, Trophy, LogOut, Share2, UserPlus, Clock } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import type { Id } from "../../../../../../../packages/convex/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { BlendDetail } from "../../types";

// Milestones worth a small celebratory burst.
const PROGRESS_MILESTONES = [25, 50, 75, 100];

function useCountUp(target: number, durationMs = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

function MilestoneBurst({ onDone }: { onDone: () => void }) {
  const dots = Array.from({ length: 14 });
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
      initial="hidden"
      animate="visible"
      onAnimationComplete={onDone}
    >
      {dots.map((_, i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        const distance = 90 + Math.random() * 60;
        const colors = ["#3A5EFF", "#f59e0b", "#22c55e", "#f43f5e"];
        return (
          <motion.span
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: colors[i % colors.length] }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              opacity: 0,
              scale: 0.4,
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.01 }}
          />
        );
      })}
    </motion.div>
  );
}

export default function BlendHero({
  detail,
}: {
  detail: BlendDetail;
  currentUserId?: string;
}) {
  const router = useRouter();
  const leaveBlend = useMutation(api.blends.leaveBlend);
  const requestToJoin = useMutation(api.blends.requestToJoinBlend);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [burst, setBurst] = useState(false);
  const prevMetricRef = useRef<number | null>(null);
  const [scope, animate] = useAnimate();

  const { blend, isMember, isOwner, groupAvgPct, myJoinRequestStatus, resources } = detail;

  const animatedMetric = useCountUp(groupAvgPct);

  useEffect(() => {
    const prev = prevMetricRef.current;
    if (prev !== null && PROGRESS_MILESTONES.includes(groupAvgPct) && prev < groupAvgPct) {
      setBurst(true);
      animate(scope.current, { scale: [1, 1.06, 1] }, { duration: 0.5, ease: "easeOut" });
    }
    prevMetricRef.current = groupAvgPct;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupAvgPct]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/blend/${blend.slug}` : `/blend/${blend.slug}`;

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(blend.inviteCode);
      setCopied(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  // Public blends only — private blends aren't meant to be shared as a
  // link since joining them requires the invite code anyway.
  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: blend.name, url: shareUrl });
        return;
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      toast.success("Link copied!");
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  async function handleLeave() {
    if (!confirm(`Leave "${blend.name}"?`)) return;
    setLeaving(true);
    try {
      await leaveBlend({ blendId: blend._id as Id<"blends"> });
      toast.success("Left the blend");
      router.push("/blend");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to leave");
    } finally {
      setLeaving(false);
    }
  }

  async function handleRequestJoin() {
    setRequesting(true);
    try {
      const result = await requestToJoin({ blendId: blend._id as Id<"blends"> });
      if (result.alreadyRequested) toast("Request already sent — waiting on the owner", { icon: "⏳" });
      else toast.success("Request sent! You'll be notified once the owner responds.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setRequesting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{
                color: blend.visibility === "public" ? "#3A5EFF" : "var(--text-disabled)",
                background: blend.visibility === "public" ? "rgba(58,94,255,0.08)" : "var(--bg-hover)",
              }}
            >
              {blend.visibility === "public" ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
              {blend.visibility}
            </span>
            <span className="text-[10px] text-[var(--text-disabled)]">
              {resources.length} tracked
            </span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] truncate">{blend.name}</h1>
          {blend.description && (
            <p className="text-xs text-[var(--text-faint)] mt-1 max-w-md">{blend.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {blend.visibility === "public" && (
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              {shared ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
              Share
            </button>
          )}

          {isMember && blend.visibility === "private" && (
            <button
              onClick={copyInvite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors font-mono"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              {blend.inviteCode}
            </button>
          )}

          {isMember && !isOwner && (
            <button
              onClick={handleLeave}
              disabled={leaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-faint)] hover:text-red-400 hover:border-red-500/25 hover:bg-red-500/[0.06] transition-colors disabled:opacity-50"
            >
              <LogOut className="w-3 h-3" /> Leave
            </button>
          )}

          {/* Non-member on a public blend: request to join instead of an
              instant "Join" button — the owner approves/declines. */}
          {!isMember && blend.visibility === "public" && (
            <button
              onClick={handleRequestJoin}
              disabled={requesting || myJoinRequestStatus === "pending"}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-60 ${
                myJoinRequestStatus === "pending"
                  ? "border border-[var(--border-subtle)] text-[var(--text-disabled)]"
                  : "bg-[#3A5EFF] hover:bg-[#4a6aff] text-white"
              }`}
            >
              {myJoinRequestStatus === "pending" ? (
                <><Clock className="w-3.5 h-3.5" /> Request pending</>
              ) : (
                <><UserPlus className="w-3.5 h-3.5" /> {myJoinRequestStatus === "rejected" ? "Request again" : "Request to join"}</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Headline metric */}
      <div className="px-6 py-6 relative" ref={scope}>
        <AnimatePresence>
          {burst && <MilestoneBurst onDone={() => setBurst(false)} />}
        </AnimatePresence>

        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(58,94,255,0.08)", border: "1px solid rgba(58,94,255,0.2)" }}
          >
            <Trophy className="w-7 h-7 text-[#3A5EFF]" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1">
              Group Progress
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums text-[var(--text-primary)]">
                {animatedMetric}
              </span>
              <span className="text-lg text-[var(--text-muted)]">%</span>
            </div>
            <p className="text-xs text-[var(--text-disabled)] mt-1">
              Average progress across all {detail.members.length} member{detail.members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden">
          <motion.div
            className="h-full bg-[#3A5EFF] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${groupAvgPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="px-6 py-3 border-t border-[var(--border-subtle)] flex items-center gap-1.5 text-xs text-[var(--text-disabled)]">
        <Users2 className="w-3.5 h-3.5" />
        {blend.memberCount} member{blend.memberCount !== 1 ? "s" : ""}
      </div>
    </motion.div>
  );
}