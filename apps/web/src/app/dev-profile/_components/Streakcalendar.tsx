"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, ChevronLeft, ChevronRight, CalendarDays, Check, Zap, Award } from "lucide-react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../../../packages/convex/convex/_generated/api";

interface SolvedDay { date: string; emoji: string; count: number; title: string; }
interface StreakData { currentStreak: number; longestStreak: number; totalSolved: number; solvedDays: SolvedDay[]; }

const WEEKDAYS = ["S","M","T","W","T","F","S"];
const MONTHS   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// CHANGED: the `emoji` field from potd.ts now holds a semantic key
// ("hard"/"streak"/"easy"/"solved") instead of a literal emoji character —
// this maps each key to a Lucide icon + a brighter, more saturated color
// than the previous dull grays/low-opacity fills.
const DAY_ICON_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  hard:   { icon: Award,     color: "#fbbf24", bg: "rgba(251,191,36,0.16)" },
  streak: { icon: Flame,     color: "#fb923c", bg: "rgba(251,146,60,0.16)" },
  easy:   { icon: Zap,       color: "#38bdf8", bg: "rgba(56,189,248,0.16)" },
  solved: { icon: Check,     color: "#34d399", bg: "rgba(52,211,153,0.16)" },
};

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function DayCell({ date, solved, isToday, isCurrentMonth }: {
  date: Date; solved: SolvedDay | null; isToday: boolean; isCurrentMonth: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const future = date > new Date() && !isToday;
  const meta = solved ? (DAY_ICON_META[solved.emoji] ?? DAY_ICON_META.solved) : null;
  const Icon = meta?.icon;

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => { if (solved) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        whileHover={solved ? { scale: 1.25 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className={`
          w-6 h-6 rounded-md flex items-center justify-center select-none relative text-[10px]
          ${!isCurrentMonth || future ? "opacity-20" : ""}
          ${isToday && !solved ? "ring-1 ring-[#3A5EFF] bg-[rgba(58,94,255,0.1)]" : ""}
          ${solved ? "cursor-pointer" : ""}
        `}
        style={solved && meta ? { background: meta.bg } : undefined}
      >
        {solved && Icon ? (
          <Icon className="w-3 h-3" style={{ color: meta!.color }} strokeWidth={2.5} />
        ) : (
          <span className={isToday ? "text-[#3A5EFF] font-bold" : "text-[var(--text-disabled)]"}>
            {date.getDate()}
          </span>
        )}
        {isToday && !solved && (
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-[#3A5EFF]" />
        )}
      </motion.div>

      <AnimatePresence>
        {hovered && solved && meta && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.1 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-20 pointer-events-none"
          >
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-medium)] rounded-lg px-2 py-1.5 shadow-xl shadow-black/20 w-max max-w-[160px]">
              <p className="text-[9px] font-semibold text-[var(--text-secondary)] truncate">{solved.title || "Solved"}</p>
              <p className="text-[8px] text-[var(--text-disabled)]">{solved.date}</p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-[var(--border-medium)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StreakCalendar() {
  const { user } = useUser();
  const userId   = user?.id ?? "";
  const data = useQuery(api.potd.getStreakData, userId ? { userId } : "skip") as StreakData | undefined;

  const today = useMemo(() => new Date(), []);
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const solvedMap = useMemo(() => {
    const m = new Map<string, SolvedDay>();
    data?.solvedDays.forEach((d) => m.set(d.date, d));
    return m;
  }, [data]);

  const calendarDays = useMemo(() => {
    const first    = new Date(viewYear, viewMonth, 1).getDay();
    const inMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
    const inPrev   = new Date(viewYear, viewMonth, 0).getDate();
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--)
      days.push({ date: new Date(viewYear, viewMonth - 1, inPrev - i), isCurrentMonth: false });
    for (let i = 1; i <= inMonth; i++)
      days.push({ date: new Date(viewYear, viewMonth, i), isCurrentMonth: true });
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++)
      days.push({ date: new Date(viewYear, viewMonth + 1, i), isCurrentMonth: false });
    return days;
  }, [viewYear, viewMonth]);

  function prev() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function next() {
    if (viewYear === today.getFullYear() && viewMonth === today.getMonth()) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const atCurrent = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const todayKey  = toKey(today);

  if (!userId || data === undefined) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 animate-pulse h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="h-3 w-20 rounded bg-[var(--bg-hover)]" />
          <div className="flex gap-1.5">
            <div className="h-5 w-10 rounded bg-[var(--bg-hover)]" />
            <div className="h-5 w-10 rounded bg-[var(--bg-hover)]" />
            <div className="h-5 w-10 rounded bg-[var(--bg-hover)]" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mt-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-md bg-[var(--bg-hover)] mx-auto" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 flex flex-col gap-2.5 h-full">

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#fb923c] shrink-0" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">Streak</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[
            { icon: Flame,        val: data.currentStreak, color: "#fb923c", bg: "rgba(251,146,60,0.12)",  tip: "streak" },
            { icon: Trophy,       val: data.longestStreak, color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  tip: "best"   },
            { icon: CalendarDays, val: data.totalSolved,   color: "#34d399", bg: "rgba(52,211,153,0.12)",  tip: "total"  },
          ].map(({ icon: Icon, val, color, bg, tip }) => (
            <div
              key={tip}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border"
              style={{ background: bg, borderColor: `${color}40` }}
            >
              <Icon className="w-2.5 h-2.5" style={{ color }} />
              <span className="text-[10px] font-bold" style={{ color }}>{val}</span>
              <span className="text-[8px] text-[var(--text-disabled)]">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={prev} className="p-0.5 rounded text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
          <ChevronLeft className="w-3 h-3" />
        </button>
        <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={next} disabled={atCurrent}
          className="p-0.5 rounded text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="flex items-center justify-center">
            <span className="text-[8px] font-semibold uppercase tracking-wider text-[var(--text-disabled)]">{d}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewYear}-${viewMonth}`}
          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.12 }}
          className="grid grid-cols-7 gap-y-0.5 flex-1"
        >
          {calendarDays.map(({ date, isCurrentMonth }, idx) => (
            <DayCell
              key={idx} date={date}
              solved={solvedMap.get(toKey(date)) ?? null}
              isToday={toKey(date) === todayKey}
              isCurrentMonth={isCurrentMonth}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Legend — icons instead of emoji characters, brighter colors */}
      <div className="flex items-center gap-2.5 pt-1 border-t border-[var(--border-default)] flex-wrap">
        {[
          { key: "solved", label: "Solved" },
          { key: "streak", label: "Streak" },
          { key: "easy",   label: "Easy"   },
          { key: "hard",   label: "Hard"   },
        ].map(({ key, label }) => {
          const meta = DAY_ICON_META[key];
          const Icon = meta.icon;
          return (
            <div key={key} className="flex items-center gap-1">
              <Icon className="w-2.5 h-2.5" style={{ color: meta.color }} />
              <span className="text-[8px] text-[var(--text-disabled)]">{label}</span>
            </div>
          );
        })}
        {data.currentStreak > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-medium" style={{ color: "#fb923c" }}>
            <Flame className="w-2.5 h-2.5" /> {data.currentStreak}d streak!
          </span>
        )}
      </div>
    </div>
  );
}