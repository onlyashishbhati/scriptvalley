"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useState, useEffect } from "react";

type AnnouncementType = "info" | "warning" | "success";

const TYPE_META: Record<AnnouncementType, {
  Icon:        React.ComponentType<{ className?: string }>;
  textClass:   string;
  bgClass:     string;
  borderClass: string;
}> = {
  info: {
    Icon:        Info,
    textClass:   "text-[#3A5EFF]",
    bgClass:     "bg-[rgba(58,94,255,0.07)]",
    borderClass: "border-[rgba(58,94,255,0.18)]",
  },
  warning: {
    Icon:        AlertTriangle,
    textClass:   "text-[#d97706]",
    bgClass:     "bg-[rgba(217,119,6,0.07)]",
    borderClass: "border-[rgba(217,119,6,0.18)]",
  },
  success: {
    Icon:        CheckCircle2,
    textClass:   "text-[#22c55e]",
    bgClass:     "bg-[rgba(34,197,94,0.07)]",
    borderClass: "border-[rgba(34,197,94,0.18)]",
  },
};

// Dismissed IDs are persisted in localStorage so they survive page navigation.
const STORAGE_KEY = "sv_dismissed_announcements";

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveDismissed(ids: Set<string>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids])); } catch {}
}

export default function AnnouncementBanner() {
  const announcements = useQuery(api.adminFeatures.getActiveAnnouncements);
  const [dismissed,   setDismissed]   = useState<Set<string>>(new Set());
  const [hydrated,    setHydrated]    = useState(false);

  // Read localStorage only after hydration to avoid SSR mismatch
  useEffect(() => {
    setDismissed(getDismissed());
    setHydrated(true);
  }, []);

  function dismiss(id: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissed(next);
      return next;
    });
  }

  // Don't render anything until hydrated (avoids flash of dismissed banners)
  if (!hydrated || !announcements || announcements.length === 0) return null;

  const visible = announcements.filter((a) => !dismissed.has(String(a._id)));
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-px mt-16 px-4">
      <AnimatePresence initial={false}>
        {visible.map((a) => {
          const type = (a.type ?? "info") as AnnouncementType;
          const m    = TYPE_META[type] ?? TYPE_META.info;
          const Icon = m.Icon;

          return (
            <motion.div
              key={String(a._id)}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div
                className={`
                  flex items-start gap-2.5 px-4 py-2.5 rounded-lg
                  border-b ${m.bgClass} ${m.borderClass}
                `}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${m.textClass}`} />

                <p className={`flex-1 text-[12px] leading-relaxed ${m.textClass}`}>
                  {a.message}
                </p>

                <button
                  onClick={() => dismiss(String(a._id))}
                  aria-label="Dismiss"
                  className={`
                    p-0.5 rounded shrink-0 mt-0.5 transition-colors
                    hover:bg-black/[0.06] ${m.textClass}
                  `}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}