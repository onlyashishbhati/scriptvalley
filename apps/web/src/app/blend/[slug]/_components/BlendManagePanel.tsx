"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../../packages/convex/convex/_generated/api";
import type { Id } from "../../../../../../../packages/convex/convex/_generated/dataModel";
import toast from "react-hot-toast";
import type { BlendDetail } from "../../types";

export default function BlendManagePanel({ detail }: { detail: BlendDetail }) {
  const router = useRouter();
  const deleteBlend = useMutation(api.blends.deleteBlend);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    try {
      await deleteBlend({ blendId: detail.blend._id as Id<"blends"> });
      toast.success("Blend deleted");
      router.push("/blend");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="rounded-xl border border-red-500/20 bg-red-500/[0.03] overflow-hidden"
    >
      <div className="px-5 py-3.5 border-b border-red-500/10 flex items-center gap-2">
        <Settings className="w-3.5 h-3.5 text-red-400/70" />
        <p className="text-[10px] uppercase tracking-widest text-red-400/70">Owner controls</p>
      </div>
      <div className="px-5 py-4 space-y-3">
        <p className="text-xs text-[var(--text-faint)] leading-relaxed">
          Deleting this blend removes it for every member permanently.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${
            confirming
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-red-500/20 text-red-400/80 hover:bg-red-500/[0.06]"
          }`}
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : confirming ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          {deleting ? "Deleting…" : confirming ? "Click again to confirm" : "Delete blend"}
        </button>
        {confirming && !deleting && (
          <button
            onClick={() => setConfirming(false)}
            className="w-full text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
          >
            cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}