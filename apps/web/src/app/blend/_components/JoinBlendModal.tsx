"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import toast from "react-hot-toast";

export default function JoinBlendModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const joinByCode = useMutation(api.blends.joinBlendByCode);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const result = await joinByCode({ inviteCode: code.trim() });
      toast.success(result.alreadyMember ? "You're already in this blend" : "Joined!");
      setCode("");
      onClose();
      router.push(`/blend/${result.slug}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            // BUG FIX: same z-index-vs-dock issue as CreateBlendModal — bumped
            // above the dock's z-50.
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm pointer-events-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[rgba(58,94,255,0.08)]">
                    <KeyRound className="w-3.5 h-3.5 text-[#3A5EFF]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">Join with a code</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-md text-[var(--text-faint)] hover:bg-[var(--bg-hover)] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full h-11 bg-[var(--bg-input)] rounded-md px-4 text-center text-lg font-mono tracking-[0.3em] text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] outline-none focus:bg-[var(--bg-hover)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting || !code.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Blend"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}