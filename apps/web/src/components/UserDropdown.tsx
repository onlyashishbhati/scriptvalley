"use client";

import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Sun, Moon, ChevronDown, LayoutDashboard, BookOpen } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  variant?:     "student" | "instructor" | "admin";
  signInLabel?: string;
}

interface DropdownPos {
  top?:    number;
  bottom?: number;
  left?:   number;
}

export default function UserDropdown({
  variant     = "student",
  signInLabel = "Sign in",
}: Props) {
  const { user, isLoaded } = useUser();
  const { signOut }        = useClerk();
  const { openSignIn }     = useAuthModal();
  const { isDark: dark, toggle: toggleTheme } = useTheme();

  const [open, setOpen]     = useState(false);
  const [pos,  setPos]      = useState<DropdownPos>({});
  const [dropUp, setDropUp] = useState(false);
  const triggerRef          = useRef<HTMLDivElement>(null);
  const panelRef            = useRef<HTMLDivElement>(null);

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
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const DROPDOWN_WIDTH  = 224;
    const DROPDOWN_HEIGHT = 320;

    const rect = triggerRef.current.getBoundingClientRect();
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    const goUp = vh - rect.bottom < DROPDOWN_HEIGHT && rect.top > DROPDOWN_HEIGHT;
    setDropUp(goUp);

    const newPos: DropdownPos = {};
    if (goUp) {
      newPos.bottom = vh - rect.top + 6;
    } else {
      newPos.top = rect.bottom + 6;
    }

    const idealLeft = rect.right - DROPDOWN_WIDTH;
    newPos.left = Math.max(8, Math.min(idealLeft, vw - DROPDOWN_WIDTH - 8));

    setPos(newPos);
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
  }

  function Avatar() {
    if (user?.imageUrl) {
      return (
        <img
          src={user.imageUrl}
          alt={user.fullName ?? "Avatar"}
          className="w-7 h-7 rounded-full object-cover border border-[var(--border-subtle)]"
        />
      );
    }
    const initials =
      [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "?";
    return (
      <span className="w-7 h-7 rounded-full bg-[var(--brand-subtle)] border border-[var(--brand-border)] flex items-center justify-center text-[10px] font-semibold text-[var(--brand)]">
        {initials}
      </span>
    );
  }

  if (!isLoaded) {
    return <div className="w-7 h-7 rounded-full bg-[var(--bg-hover)] animate-pulse" />;
  }

  const dropdownPanel = (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: dropUp ? -6 : 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,               scale: 1    }}
          exit={{    opacity: 0, y: dropUp ? -6 : 6, scale: 0.97 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          style={{ position: "fixed", width: 224, zIndex: 9999, ...pos }}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl shadow-black/10 overflow-hidden"
        >
          {/* User info */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-input)]">
            <Avatar />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user?.fullName ?? user?.firstName ?? "User"}
              </p>
              <p className="text-[10px] text-[var(--text-disabled)] truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5 px-1.5 space-y-px">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              Profile
            </Link>

            {variant === "instructor" && (
              <Link
                href="/instructor"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                Instructor Dashboard
              </Link>
            )}

            {variant === "admin" && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                Admin Dashboard
              </Link>
            )}

            {(variant === "instructor" || variant === "admin") && (
              <a
                href="https://scriptvalley.com"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                Script Valley
              </a>
            )}

            <div className="h-px bg-[var(--border-subtle)] mx-1 my-1" />

            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              {dark
                ? <Sun  className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                : <Moon className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              }
              {dark ? "Light mode" : "Dark mode"}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              Sign out
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <SignedIn>
        <div ref={triggerRef} className="relative">
          <button
            onClick={() => setOpen((p) => !p)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Avatar />
            <ChevronDown
              className={`w-3 h-3 text-[var(--text-faint)] transition-transform duration-150 ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {typeof document !== "undefined" &&
            createPortal(dropdownPanel, document.body)}
        </div>
      </SignedIn>

      <SignedOut>
        <button
          onClick={openSignIn}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors"
        >
          {signInLabel}
        </button>
      </SignedOut>
    </>
  );
}