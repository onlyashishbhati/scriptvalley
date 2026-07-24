"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserMinus, AlertTriangle } from "lucide-react";

interface Props {
  isOpen:     boolean;
  onClose:    () => void;
  onConfirm:  () => void;
  loading:    boolean;
  memberName: string;
}

// Matches the existing DeleteNoteDialog / ResetProgressModal pattern used
// elsewhere in the app, instead of a native window.confirm().
export default function RemoveMemberDialog({ isOpen, onClose, onConfirm, loading, memberName }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="remove-member-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="remove-member-modal"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0,   scale: 0.97, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="w-full max-w-sm pointer-events-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <UserMinus className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Remove member</p>
                  <p className="text-xs text-[var(--text-faint)] mt-0.5 line-clamp-1">{memberName}</p>
                </div>
              </div>

              <div className="px-5 py-4 space-y-4">
                <p className="text-xs text-[var(--text-faint)] leading-relaxed">
                  <span className="text-[var(--text-secondary)] font-medium">{memberName}</span> will lose
                  access to this blend and its shared progress. They can rejoin later if you invite them again.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded-lg border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <AlertTriangle className="w-3.5 h-3.5" />
                    }
                    {loading ? "Removing…" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}