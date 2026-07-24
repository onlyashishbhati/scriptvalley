"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import type { Id } from "../../../../../../../packages/convex/convex/_generated/dataModel";
import toast from "react-hot-toast";
import { Check, X, UserPlus } from "lucide-react";
import type { BlendDetail } from "../../types";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function BlendJoinRequestsPanel({ detail }: { detail: BlendDetail }) {
  const respond = useMutation(api.blends.respondToJoinRequest);

  async function handle(userId: string, approve: boolean) {
    try {
      await respond({ blendId: detail.blend._id as Id<"blends">, requestUserId: userId, approve });
      toast.success(approve ? "Approved — they're in!" : "Request declined");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to respond");
    }
  }

  if (detail.pendingRequests.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <UserPlus className="w-3.5 h-3.5 text-[#3A5EFF]" />
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Join requests</p>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(58,94,255,0.1)] text-[#3A5EFF] font-bold ml-auto">
          {detail.pendingRequests.length}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {detail.pendingRequests.map((req) => (
          <motion.div
            key={req.userId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border-default)] last:border-0 overflow-hidden"
          >
            <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-semibold text-[var(--text-muted)] shrink-0">
              {initials(req.userName)}
            </div>
            <p className="flex-1 text-xs text-[var(--text-secondary)] truncate">{req.userName}</p>
            <button
              onClick={() => handle(req.userId, true)}
              className="p-1.5 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              title="Approve"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handle(req.userId, false)}
              className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
              title="Decline"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}