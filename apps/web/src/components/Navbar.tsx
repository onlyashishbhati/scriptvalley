"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, LayoutDashboard, ChevronDown,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { exploreItems } from "@/app/dsa-sheet/data/explore-items";
import { useTheme } from "@/hooks/useTheme";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import UserDropdown from "@/components/UserDropdown";
import NotificationBell from "@/components/NotificationBell";

type Position = { left: number; width: number; opacity: number };

// ── Theme toggle — unchanged ──────────────────────────────────────────────────
function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative flex items-center w-[42px] h-[22px] rounded-full border border-[var(--border-subtle)] bg-[var(--bg-hover)] transition-colors duration-200 focus:outline-none shrink-0"
    >
      <motion.div
        animate={{ x: isDark ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="absolute w-[16px] h-[16px] rounded-full bg-[var(--brand)] shadow-sm flex items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="moon"
              initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              width="9" height="9" viewBox="0 0 24 24" fill="white"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              initial={{ opacity: 0, rotate: 30, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -30, scale: 0.6 }}
              transition={{ duration: 0.15 }}
              width="9" height="9" viewBox="0 0 24 24"
              fill="white" stroke="white" strokeWidth="2"
            >
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2"  x2="12" y2="4"  />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="2"  y1="12" x2="4"  y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
              <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
              <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

// ── Nav cursor — unchanged ────────────────────────────────────────────────────
function NavCursor({ position }: { position: Position }) {
  return (
    <motion.li
      animate={{ left: position.left, width: position.width, opacity: position.opacity }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute z-0 h-7 rounded-md bg-[var(--bg-hover)] pointer-events-none"
    />
  );
}

// ── NavTab — unchanged ────────────────────────────────────────────────────────
function NavTab({
  label, href, setPosition,
}: {
  label: string;
  href: string;
  setPosition: (p: Position | ((prev: Position) => Position)) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        setPosition({
          left: ref.current.offsetLeft,
          width: ref.current.getBoundingClientRect().width,
          opacity: 1,
        });
      }}
      className="relative z-10"
    >
      <Link
        href={href}
        className="block px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-100"
      >
        {label}
      </Link>
    </li>
  );
}

// ── NavDropdown — unchanged ───────────────────────────────────────────────────
function NavDropdown({
  label, items, setPosition,
}: {
  label: string;
  items: typeof exploreItems;
  setPosition: (p: Position | ((prev: Position) => Position)) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        setPosition({
          left: ref.current.offsetLeft,
          width: ref.current.getBoundingClientRect().width,
          opacity: 1,
        });
        setOpen(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
        setPosition((prev: Position) => ({ ...prev, opacity: 0 }));
      }}
      className="relative z-10"
    >
      <div className="flex items-center gap-0.5 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-100 cursor-pointer">
        <span>{label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-3 h-3" />
        </motion.span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1.5 w-48 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-2xl shadow-black/20 py-1.5 z-50"
          >
            <p className="px-3 pt-0.5 pb-1.5 text-[9px] uppercase tracking-widest text-[var(--text-disabled)]">
              {label}
            </p>
            <div
              className="max-h-[220px] overflow-y-auto scrollbar-hide flex flex-col gap-px px-1.5"
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
            >
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.route}
                  className="block px-2.5 py-1.5 rounded-md text-xs text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors duration-75"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

const TABS = [
  { label: "DSA Sheets",            href: "/dsa-sheet"    },
  { label: "Snippets",              href: "/snippets"     },
  { label: "Courses",               href: "/courses"      },
  { label: "Interview Experiences", href: "/experiences"  },
  { label: "Contests",              href: "/contests"     },
];

export default function Navbar() {
  const { isSignedIn } = useUser();
  const { isDark }     = useTheme();
  const { openSignIn } = useAuthModal(); // ← replaces SignInButton
  const [isOpen,    setIsOpen]    = useState(false);
  const [position,  setPosition]  = useState<Position>({ left: 0, width: 0, opacity: 0 });

  return (
    <header
      className={`fixed w-full top-0 z-50 text-[var(--text-primary)] transition-colors duration-200 ${
        isSignedIn
          ? "bg-[var(--bg-base)] md:bg-[var(--bg-base)]/90 md:backdrop-blur-md border-b border-[var(--border-subtle)]"
          : "bg-transparent py-3"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-4 py-2 relative flex items-center justify-between ${
          isSignedIn
            ? ""
            : "border border-[var(--border-subtle)] md:rounded-full bg-[var(--bg-base)]/80 backdrop-blur-md"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 z-10 shrink-0">
          <Image
            alt="Script Valley"
            width={86}
            height={86}
            src={isDark ? "/dark-logo.png" : "/light-logo.png"}
          />
        </Link>

        {/* Desktop nav tabs — centered */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
          <ul
            className="flex items-center gap-px relative"
            onMouseLeave={() => setPosition((p) => ({ ...p, opacity: 0 }))}
          >
            <NavCursor position={position} />
            {TABS.map((t) => (
              <NavTab key={t.href} {...t} setPosition={setPosition} />
            ))}
            <NavDropdown label="Explore" items={exploreItems} setPosition={setPosition} />
          </ul>
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2 z-10">
          <ThemeToggle />

          {isSignedIn && (
            <>
              {/* NEW — notification bell, signed-in users only. Placed
                  before the Dashboard link so it reads left-to-right as
                  "alerts, then navigation, then account", matching where
                  most sites put a bell (immediately next to account UI). */}
              <NotificationBell />

              <Link
                href="/dev-profile"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] transition-colors duration-100"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </>
          )}

          <UserDropdown signInLabel="Sign in" />
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
          className="md:hidden p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors z-10"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.aside
              className="fixed top-0 right-0 h-full w-[272px] md:hidden bg-[var(--bg-base)] border-l border-[var(--border-subtle)] z-50 flex flex-col"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Image
                    alt="Script Valley"
                    width={86}
                    height={86}
                    src={isDark ? "/dark-logo.png" : "/light-logo.png"}
                  />
                </Link>
                <div className="flex items-center gap-2">
                  {/* NEW — bell also available in the mobile drawer header,
                      next to the theme toggle and close button. */}
                  {isSignedIn && <NotificationBell />}
                  <ThemeToggle />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-md text-[var(--text-disabled)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Drawer nav */}
              <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--text-disabled)] px-2 mb-1">
                    {isSignedIn ? "Tools" : "Navigate"}
                  </p>
                  {TABS.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex px-2 py-2 rounded-md text-xs text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      {label}
                    </Link>
                  ))}
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--text-disabled)] px-2 mb-1">
                    Explore
                  </p>
                  {exploreItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.route}
                      onClick={() => setIsOpen(false)}
                      className="flex px-2 py-2 rounded-md text-xs text-[var(--text-disabled)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Drawer account section */}
              <div className="px-3 py-4 border-t border-[var(--border-subtle)] space-y-2">
                <p className="text-[9px] uppercase tracking-widest text-[var(--text-disabled)] px-1 mb-2">
                  Account
                </p>

                {isSignedIn ? (
                  <>
                    <Link
                      href="/dev-profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Go to Dashboard
                    </Link>
                    {/* UserDropdown in mobile — shows avatar + dropdown */}
                    <div className="px-1 pt-1">
                      <UserDropdown />
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => { openSignIn(); setIsOpen(false); }}
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-md border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] transition-colors"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}