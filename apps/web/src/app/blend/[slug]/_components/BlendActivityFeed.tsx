"use client";

import { motion } from "framer-motion";
import { UserPlus, Sparkles } from "lucide-react";

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function BlendActivityFeed({
  feed,
}: {
  feed: { type: "joined"; userName: string; at: number }[];
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[var(--text-faint)]" />
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Activity</p>
      </div>

      {feed.length === 0 ? (
        <p className="text-xs text-[var(--text-disabled)] text-center py-8">Nothing yet — invite someone!</p>
      ) : (
        <div className="divide-y divide-[var(--border-default)]">
          {feed.map((item, i) => (
            <motion.div
              key={`${item.userName}-${item.at}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
              className="flex items-center gap-3 px-5 py-2.5"
            >
              <div className="w-6 h-6 rounded-md bg-[rgba(58,94,255,0.08)] flex items-center justify-center shrink-0">
                <UserPlus className="w-3 h-3 text-[#3A5EFF]" />
              </div>
              <p className="text-xs text-[var(--text-muted)] flex-1 min-w-0 truncate">
                <span className="text-[var(--text-secondary)] font-medium">{item.userName}</span> joined
              </p>
              <span className="text-[10px] text-[var(--text-disabled)] shrink-0">{timeAgo(item.at)}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}