"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Code2, Loader2, Flame, CalendarDays } from "lucide-react";
import type { PortfolioTheme } from "./SidebarProfile";

type SubmissionCalendar = Record<string, number>;
type LCOverview = {
  username: string | null; totalSolved: number; totalSubmissions: number;
  totalQuestions: number; easySolved: number; mediumSolved: number; hardSolved: number;
  submissionCalendar: SubmissionCalendar; totalActiveDays: number;
};

function normalizeLeetcodeHandle(input?: string | null): string {
  if (!input) return "";
  const s = String(input).trim();
  if (!s.includes("http")) return s.replace(/^@/, "").trim();
  try {
    const u = new URL(s);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0]?.toLowerCase() === "u" && parts[1]) return parts[1];
    if (parts[0]?.toLowerCase() === "users" && parts[1]) return parts[1];
    return parts[0] || "";
  } catch {
    return "";
  }
}

function DiffBar({
  label, value, total, color, T, delay,
}: { label: string; value: number; total: number; color: string; T: PortfolioTheme; delay: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-widest w-14 shrink-0" style={{ color }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: T.surfaceHover }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut", delay }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-medium w-8 text-right tabular-nums shrink-0" style={{ color: T.text }}>{value}</span>
    </div>
  );
}

function StatTile({
  icon: Icon, label, value, T, delay,
}: { icon: React.ElementType; label: string; value: number; T: PortfolioTheme; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -3 }}
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: T.surface, border: `1px solid ${T.border}` }}
    >
      <div className="flex items-center gap-1.5" style={{ color: T.textFaint }}>
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-2xl font-bold tabular-nums" style={{ color: T.text }}>{value}</span>
    </motion.div>
  );
}

function Skeleton({ T }: { T: PortfolioTheme }) {
  return (
    <div className="flex items-center gap-2 py-10 justify-center" style={{ color: T.textFaint }}>
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Loading LeetCode activity…</span>
    </div>
  );
}

export default function LeetcodeTabSection({ handle, T }: { handle: string; T: PortfolioTheme }) {
  const username = useMemo(() => normalizeLeetcodeHandle(handle), [handle]);
  const [data, setData] = useState<LCOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/leetcode/overview?user=${encodeURIComponent(username)}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Couldn't load LeetCode activity");
        if (!cancelled) setData(json as LCOverview);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [username]);

  if (!username) return null;
  if (loading) return <Skeleton T={T} />;
  if (error || !data) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: T.textFaint }}>
        Couldn&apos;t load LeetCode activity right now.
      </p>
    );
  }

  const activeDays = data.totalActiveDays ?? Object.keys(data.submissionCalendar ?? {}).length;

  return (
    <div className="space-y-6">
      <motion.a
        href={`https://leetcode.com/u/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        whileHover={{ x: 3 }}
        className="inline-flex items-center gap-2 text-sm font-medium mb-1"
        style={{ color: T.accent }}
      >
        <Code2 className="w-4 h-4" />
        @{username}
      </motion.a>

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={Flame} label="Total solved" value={data.totalSolved} T={T} delay={0} />
        <StatTile icon={CalendarDays} label="Active days" value={activeDays} T={T} delay={0.05} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="rounded-xl p-4 space-y-3"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        <p className="text-[10px] uppercase tracking-widest" style={{ color: T.textFaint }}>
          Difficulty breakdown
        </p>
        <DiffBar label="Easy" value={data.easySolved} total={data.totalSolved} color="#22c55e" T={T} delay={0.15} />
        <DiffBar label="Medium" value={data.mediumSolved} total={data.totalSolved} color="#f59e0b" T={T} delay={0.2} />
        <DiffBar label="Hard" value={data.hardSolved} total={data.totalSolved} color="#ef4444" T={T} delay={0.25} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="rounded-xl overflow-hidden divide-y"
        style={{ background: T.surface, border: `1px solid ${T.border}`, borderColor: T.border }}
      >
        {[
          { label: "Total submissions", value: data.totalSubmissions },
          { label: "Total questions on LeetCode", value: data.totalQuestions },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3" style={{ borderColor: T.border }}>
            <span className="text-xs" style={{ color: T.textMuted }}>{label}</span>
            <span className="text-xs font-medium tabular-nums" style={{ color: T.text }}>{value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}