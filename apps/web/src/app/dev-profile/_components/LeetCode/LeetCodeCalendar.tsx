"use client";

import React, { useMemo, useRef, useState } from "react";

type DayEntry = { dateISO: string; count: number; epoch: number };

function epochToISO(e: number) {
  return new Date(e * 1000).toISOString().slice(0, 10);
}
function formatNice(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });
}
// Green submission heatmap shades — semantic data colors, intentionally hardcoded
function colorForCount(c: number) {
  if (!c)    return "var(--bg-base)";
  if (c <= 1) return "#0f172a";
  if (c <= 3) return "#15803d";
  if (c <= 6) return "#22c55e";
  return "#4ade80";
}

export default function LeetCodeCalendar({
  calendar = {},
  monthsToShow = 6,
  squareSize = 12,
}: {
  calendar?: Record<string, number>;
  monthsToShow?: number;
  squareSize?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const entries = useMemo((): DayEntry[] => {
    const out: DayEntry[] = [];
    for (const k of Object.keys(calendar || {})) {
      const epoch = Number(k) || 0;
      if (!epoch) continue;
      out.push({ dateISO: epochToISO(epoch), count: Number(calendar[k] ?? 0), epoch });
    }
    return out.sort((a, b) => (a.dateISO > b.dateISO ? 1 : -1));
  }, [calendar]);

  const mapByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entries) m.set(e.dateISO, e.count);
    return m;
  }, [entries]);

  const monthsGrid = useMemo(() => {
    if (!entries.length) return [];
    const lastDate = new Date(entries[entries.length - 1].dateISO);
    const today = new Date();
    return Array.from({ length: monthsToShow }, (_, i) => {
      const d = new Date(lastDate.getFullYear(), lastDate.getMonth() - (monthsToShow - 1 - i), 1);
      if (d > today) return null;
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const isCur = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
      let dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      if (isCur) dim = Math.min(dim, today.getDate());
      const startWd = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
      const cols: { date?: string; count: number }[][] = [];
      let col: { date?: string; count: number }[] = Array.from({ length: startWd }).map(() => ({ count: 0 }));
      for (let dd = 1; dd <= dim; dd++) {
        const iso = new Date(d.getFullYear(), d.getMonth(), dd).toISOString().slice(0, 10);
        col.push({ date: iso, count: mapByDate.get(iso) ?? 0 });
        if (col.length === 7) { cols.push(col); col = []; }
      }
      if (col.length) {
        while (col.length < 7) col.push({ count: 0 });
        cols.push(col);
      }
      return { ym, cols };
    }).filter(Boolean) as { ym: string; cols: { date?: string; count: number }[][] }[];
  }, [entries, monthsToShow, mapByDate]);

  const stats = useMemo(() => {
    const total = entries.reduce((s, e) => s + e.count, 0);
    if (!entries.length) return { total, maxStreak: 0, currentStreak: 0 };
    const solvedSet = new Set(entries.filter((e) => e.count > 0).map((e) => e.dateISO));
    const dayMs = 86400000;
    let cur = new Date(entries[0].dateISO);
    const last = new Date(entries[entries.length - 1].dateISO);
    let maxStreak = 0, curStreak = 0;
    while (cur <= last) {
      const iso = cur.toISOString().slice(0, 10);
      if (solvedSet.has(iso)) { curStreak++; }
      else { if (curStreak > maxStreak) maxStreak = curStreak; curStreak = 0; }
      cur = new Date(cur.getTime() + dayMs);
    }
    if (curStreak > maxStreak) maxStreak = curStreak;
    let currentStreak = 0, d = new Date(last);
    while (solvedSet.has(d.toISOString().slice(0, 10))) {
      currentStreak++;
      d = new Date(d.getTime() - dayMs);
    }
    return { total, maxStreak, currentStreak };
  }, [entries]);

  const cell = squareSize;

  return (
    <div className="w-full" ref={containerRef}>
      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">
        <span>{stats.total} submissions</span>
        <span>Max <strong className="text-[var(--text-secondary)]">{stats.maxStreak}</strong></span>
        <span>Current <strong className="text-[var(--text-secondary)]">{stats.currentStreak}</strong></span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex items-start gap-3" style={{ paddingBottom: 4 }}>
          {monthsGrid.map((m) => (
            <div key={m.ym} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-[var(--text-disabled)]">
                {new Date(m.ym + "-01").toLocaleString(undefined, { month: "short" })}
              </span>
              <div
                style={{
                  display: "grid",
                  gridAutoFlow: "column",
                  gridTemplateRows: `repeat(7, ${cell}px)`,
                  gap: 3,
                }}
              >
                {m.cols.map((col, ci) =>
                  col.map((cellItem, ri) => {
                    const isBlank = !cellItem.date;
                    return (
                      <div
                        key={`${m.ym}-${ci}-${ri}`}
                        onMouseEnter={(e) =>
                          !isBlank &&
                          setTip({
                            x: e.clientX,
                            y: e.clientY,
                            text: `${formatNice(cellItem.date!)} · ${cellItem.count}  submissions`,
                          })
                        }
                        onMouseLeave={() => setTip(null)}
                        style={{
                          width: cell, height: cell, borderRadius: 2,
                          background: isBlank ? "transparent" : colorForCount(cellItem.count),
                          minWidth: cell, minHeight: cell,
                        }}
                      />
                    );
                  }),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {tip && (
        <div
          style={{ left: tip.x + 8, top: tip.y + 8, position: "fixed" }}
          className="pointer-events-none z-50 text-[10px] rounded-md px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-secondary)] shadow-lg whitespace-nowrap"
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}