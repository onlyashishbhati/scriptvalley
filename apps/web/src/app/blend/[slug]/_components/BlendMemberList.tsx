"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Crown, UserMinus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import type { Id } from "../../../../../../../packages/convex/convex/_generated/dataModel";
import toast from "react-hot-toast";
import RemoveMemberDialog from "./RemoveMemberDialog";
import type { BlendDetail, BlendMemberProgress } from "../../types";

const RANK_MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function BlendMemberList({
  detail,
  currentUserId,
}: {
  detail: BlendDetail;
  currentUserId?: string;
}) {
  const removeMember = useMutation(api.blends.removeMember);
  // NEW — replaces the previous window.confirm() with a proper themed
  // dialog (RemoveMemberDialog), consistent with DeleteNoteDialog /
  // ResetProgressModal elsewhere in the app.
  const [pendingRemoval, setPendingRemoval] = useState<BlendMemberProgress | null>(null);
  const [removing, setRemoving] = useState(false);

  async function handleConfirmRemove() {
    if (!pendingRemoval) return;
    setRemoving(true);
    try {
      await removeMember({ blendId: detail.blend._id as Id<"blends">, targetUserId: pendingRemoval.userId });
      toast.success(`${pendingRemoval.userName} removed`);
      setPendingRemoval(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Ranking</p>
      </div>

      <LayoutGroup>
        <div className="divide-y divide-[var(--border-default)]">
          <AnimatePresence initial={false}>
            {detail.members.map((m, i) => {
              const isYou = m.userId === currentUserId;
              return (
                <motion.div
                  layout
                  key={m.userId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut", delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-5 py-3 ${isYou ? "bg-[rgba(58,94,255,0.04)]" : ""}`}
                >
                  <div className="w-6 text-center shrink-0">
                    {RANK_MEDAL[i] ? (
                      <span className="text-base">{RANK_MEDAL[i]}</span>
                    ) : (
                      <span className="text-xs text-[var(--text-disabled)] tabular-nums">{i + 1}</span>
                    )}
                  </div>

                  <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
                    {initials(m.userName)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-[var(--text-secondary)] truncate">
                        {m.userName}{isYou && <span className="text-[var(--text-disabled)]"> (you)</span>}
                      </p>
                      {m.role === "owner" && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">{m.detail}</p>
                  </div>

                  <div className="w-16 shrink-0">
                    <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
                      <motion.div
                        className="h-full bg-[#3A5EFF] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${m.pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 + i * 0.03 }}
                      />
                    </div>
                    <p className="text-[9px] text-[var(--text-disabled)] text-right mt-0.5 tabular-nums">{m.pct}%</p>
                  </div>

                  {detail.isOwner && m.role !== "owner" && (
                    <button
                      onClick={() => setPendingRemoval(m)}
                      className="p-1 rounded-md text-[var(--text-disabled)] hover:text-red-400 hover:bg-red-500/[0.06] transition-colors shrink-0"
                      title="Remove member"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      <RemoveMemberDialog
        isOpen={!!pendingRemoval}
        onClose={() => setPendingRemoval(null)}
        onConfirm={handleConfirmRemove}
        loading={removing}
        memberName={pendingRemoval?.userName ?? ""}
      />
    </div>
  );
}