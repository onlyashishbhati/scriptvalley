"use client";

import React, { useMemo, useRef, useState } from "react";

export default function Heatmap({
  weeks,
}: {
  weeks: { contributionDays: { contributionCount: number; date: string }[] }[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const maxCount = useMemo(() => {
    let m = 0;
    weeks.forEach((w) => w.contributionDays.forEach((d) => (m = Math.max(m, d.contributionCount))));
    return m;
  }, [weeks]);

  // Green heatmap shades — semantic data colors, intentionally hardcoded
  const getColor = (count: number) => {
    if (count <= 0) return "var(--bg-base)";
    if (maxCount <= 1) return "#22c55e";
    const q = Math.ceil((count / maxCount) * 4);
    return (["#14532d", "#16a34a", "#22c55e", "#4ade80"] as const)[q - 1] ?? "#4ade80";
  };

  const onEnter = (e: React.MouseEvent, date: string, count: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    setTip({
      x: e.clientX - (rect?.left ?? 0),
      y: e.clientY - (rect?.top ?? 0),
      text: `${count} contribution${count === 1 ? "" : "s"} · ${date}`,
    });
  };
  const onMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    setTip((t) => t ? { ...t, x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) } : t);
  };
  const onLeave = () => setTip(null);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-[3px] overflow-x-auto">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]" style={{ minWidth: 11 }}>
            {w.contributionDays.map((d, di) => (
              <div
                key={di}
                onMouseEnter={(e) => onEnter(e, d.date, d.contributionCount)}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                style={{
                  width: 11, height: 11, borderRadius: 2,
                  backgroundColor: getColor(d.contributionCount),
                  boxShadow: d.contributionCount > 0 ? "0 0 0 1px rgba(0,0,0,0.4) inset" : undefined,
                }}
                aria-label={`${d.contributionCount} contributions on ${d.date}`}
              />
            ))}
          </div>
        ))}
      </div>

      {tip && (
        <div
          className="pointer-events-none text-[10px] rounded-md px-2 py-1 bg-[var(--bg-elevated)] border border-[var(--border-medium)] text-[var(--text-secondary)] shadow-lg"
          style={{
            position: "absolute",
            left: tip.x + 8,
            top: tip.y - 8,
            transform: "translateY(-50%)",
            whiteSpace: "nowrap",
            zIndex: 50,
          }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}