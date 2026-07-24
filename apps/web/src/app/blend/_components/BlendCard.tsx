"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users2, Lock, Globe, ArrowRight } from "lucide-react";
import { RESOURCE_TYPE_META, type Blend } from "../types";

export default function BlendCard({ blend, index, isMember }: { blend: Blend; index: number; isMember: boolean }) {
  const meta = RESOURCE_TYPE_META[blend.resourceType];
  const Icon = meta.icon;
  const count = blend.resourceCount ?? 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <Link href={`/blend/${blend.slug}`} className="block h-full">
        <div className="relative h-[150px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] transition-colors duration-100 overflow-hidden flex flex-col p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">{blend.name}</h3>
              <p className="flex items-center gap-1 text-xs text-[var(--text-disabled)] mt-0.5">
                <Icon className="w-3 h-3 shrink-0" />
                {count} {count === 1 ? meta.itemLabel : `${meta.itemLabel}s`} tracked
              </p>
            </div>
            <span
              className="shrink-0 flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{
                color: blend.visibility === "public" ? "#3A5EFF" : "var(--text-disabled)",
                background: blend.visibility === "public" ? "rgba(58,94,255,0.08)" : "var(--bg-hover)",
              }}
            >
              {blend.visibility === "public" ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
              {blend.visibility}
            </span>
          </div>

          {blend.description && (
            <p className="text-xs text-[var(--text-faint)] line-clamp-2 leading-relaxed">{blend.description}</p>
          )}

          <div className="mt-auto pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-disabled)]">
              <Users2 className="w-3.5 h-3.5" />
              <span>{blend.memberCount} member{blend.memberCount !== 1 ? "s" : ""}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-[#3A5EFF] font-medium">
              {isMember ? "Open" : "View"} <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}