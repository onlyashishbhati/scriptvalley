"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Users2, UserMinus, PartyPopper, UserPlus, Check, X } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../packages/convex/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

type Notifications = FunctionReturnType<typeof api.notifications.getMyNotifications>;
type NotificationItem = NonNullable<Notifications>[number];

const TYPE_ICON: Record<string, React.ElementType> = {
  blend_member_joined: Users2,
  blend_removed: UserMinus,
  blend_milestone: PartyPopper,
  blend_join_request: UserPlus,
  blend_join_approved: Check,
  blend_join_rejected: X,
  generic: Bell,
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function NotificationBell() {
  const { isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = useQuery(api.notifications.getUnreadCount, isSignedIn ? {} : "skip") ?? 0;
  const notifications = useQuery(api.notifications.getMyNotifications, open ? { limit: 20 } : "skip") ?? [];
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
  }, [open]);

  if (!isSignedIn) return null;

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          style={{ position: "fixed", top: pos.top, right: pos.right, width: 340, zIndex: 9999 }}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-2xl shadow-black/10 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <p className="text-sm font-medium text-[var(--text-primary)]">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead({})}
                className="flex items-center gap-1 text-[10px] text-[var(--text-disabled)] hover:text-[#3A5EFF] transition-colors"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center px-4">
                <Bell className="w-5 h-5 text-[var(--text-disabled)]" />
                <p className="text-xs text-[var(--text-faint)]">You&apos;re all caught up</p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((n: NotificationItem) => {
                  const Icon = TYPE_ICON[n.type] ?? Bell;
                  const content = (
                    <div
                      onClick={() => { if (!n.read) markRead({ id: n._id }); setOpen(false); }}
                      className={`flex items-start gap-3 px-4 py-2.5 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer ${
                        !n.read ? "bg-[rgba(58,94,255,0.04)]" : ""
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        !n.read ? "bg-[rgba(58,94,255,0.1)]" : "bg-[var(--bg-hover)]"
                      }`}>
                        <Icon className={`w-3.5 h-3.5 ${!n.read ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--text-secondary)] leading-snug">{n.title}</p>
                        <p className="text-[10px] text-[var(--text-disabled)] mt-0.5">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#3A5EFF] shrink-0 mt-1.5" />}
                    </div>
                  );
                  return n.link ? (
                    <Link key={n._id} href={n.link}>{content}</Link>
                  ) : (
                    <div key={n._id}>{content}</div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={triggerRef} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
      >
        <Bell className="w-4 h-4" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-[#3A5EFF] text-white text-[9px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {typeof document !== "undefined" && createPortal(panel, document.body)}
    </div>
  );
}