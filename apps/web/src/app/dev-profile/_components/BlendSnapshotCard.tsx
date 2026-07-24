"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import type { Doc } from "../../../../../../packages/convex/convex/_generated/dataModel";
import { Users2, FileSpreadsheet, GraduationCap, Lock, Globe, ArrowRight, Plus } from "lucide-react";

type BlendSummary = Doc<"blends"> & {
  resourceCount?: number;
};

const VISIBLE_CAP = 4;

export default function BlendSnapshotCard() {
  const blends = useQuery(api.blends.getMyBlends);

  if (blends === undefined) {
    return <div className="h-40 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] animate-pulse" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Users2 className="w-3.5 h-3.5 text-[#3A5EFF]" />
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Blend</p>
        </div>
        <Link
          href="/blend"
          className="flex items-center gap-1 text-[10px] text-[var(--text-disabled)] hover:text-[#3A5EFF] transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {blends.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center px-4">
          <p className="text-xs text-[var(--text-faint)]">You&apos;re not in any blends yet</p>
          <Link
            href="/blend"
            className="flex items-center gap-1 text-xs text-[#3A5EFF] hover:text-[#4a6aff] font-medium"
          >
            <Plus className="w-3 h-3" /> Create or join one
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-default)]">
          {blends.slice(0, VISIBLE_CAP).map((b: BlendSummary) => {
            const Icon = b.resourceType === "sheet" ? FileSpreadsheet : GraduationCap;
            return (
              <Link
                key={b._id}
                href={`/blend/${b.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-[rgba(58,94,255,0.08)] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#3A5EFF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-secondary)] truncate">{b.name}</p>
                  <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">
                    {b.memberCount} member{b.memberCount !== 1 ? "s" : ""} · {b.resourceCount ?? 0} tracked
                  </p>
                </div>
                <span className="shrink-0 text-[var(--text-disabled)]">
                  {b.visibility === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                </span>
              </Link>
            );
          })}
          {blends.length > VISIBLE_CAP && (
            <Link
              href="/blend"
              className="block text-center text-[10px] text-[var(--text-disabled)] hover:text-[#3A5EFF] px-4 py-2 transition-colors"
            >
              +{blends.length - VISIBLE_CAP} more →
            </Link>
          )}
        </div>
      )}
    </motion.div>
  );
}