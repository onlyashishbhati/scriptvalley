"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ── Icons ─────────────────────────────────────────────────────────────── */

function IconHome() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 7.5 8 2l6 5.5V13a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1V7.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13.5 13.5 10.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function IconSheet() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2" width="11" height="12" rx="1.3" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 5.5h6M5 8h6M5 10.5h3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
function IconSnippet() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 13.5c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IconList() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3 4.5h10M3 8h10M3 11.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function IconArrowRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconUnlink() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d="M6.5 9.5 4 12a2 2 0 1 1-3-3l2.5-2.5M9.5 6.5 12 4a2 2 0 1 1 3 3l-2.5 2.5M2 14l2-2M12 4l2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const quickLinks = [
  { label: "Home", href: "/", icon: <IconHome /> },
  { label: "DSA Sheets", href: "/dsa-sheets", icon: <IconSheet /> },
  { label: "Snippets", href: "/snippets", icon: <IconSnippet /> },
  { label: "Dashboard", href: "/dashboard", icon: <IconProfile /> },
];

const dockItems = [
  { label: "Home", href: "/", icon: <IconHome /> },
  { label: "DSA Sheets", href: "/dsa-sheets", icon: <IconSheet /> },
  { label: "Snippets", href: "/snippets", icon: <IconSnippet /> },
  { label: "Search", href: "/explore", icon: <IconSearch /> },
  { label: "Profile", href: "/dev-profile", icon: <IconProfile /> },
];

export default function NotFound() {
  const [path, setPath] = useState("unknown-route");

  useEffect(() => {
    setPath(window.location.pathname.replace(/^\//, "") || "unknown-route");
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Scoped keyframes — fine to lift into globals.css later */}
      <style>{`
        @keyframes sv404FadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sv404Scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(500%); } }
        @keyframes sv404Drift { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        .sv404-fade { opacity: 0; animation: sv404FadeUp 0.55s ease forwards; }
        .sv404-scan { animation: sv404Scan 2.6s linear infinite; }
        .sv404-drift { animation: sv404Drift 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sv404-fade { opacity: 1; animation: none; }
          .sv404-scan, .sv404-drift { animation: none; }
        }
      `}</style>

      {/* Main */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16 mt-10 md:py-24">
        <div
          aria-hidden
          className="sv404-drift pointer-events-none absolute -right-10 -top-6 hidden select-none text-[230px] font-bold leading-none text-[var(--border-subtle)] md:block"
        >
          404
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <p className="sv404-fade text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]" style={{ animationDelay: "0ms" }}>
            Error · 404
          </p>
          <h1
            className="sv404-fade mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl"
            style={{ animationDelay: "60ms" }}
          >
            This page wandered off the sheet
          </h1>
          <p
            className="sv404-fade mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]"
            style={{ animationDelay: "120ms" }}
          >
            It's not part of any sheet, snippet, or course here. It may have been moved, renamed, or the link was mistyped.
          </p>

          {/* Search bar — matches DSA Sheets page styling */}
          <div
            className="sv404-fade mt-7 flex items-center gap-3 rounded-lg border border-transparent bg-input px-4 py-3 transition-colors focus-within:border-brand"
            style={{ animationDelay: "180ms" }}
          >
            <span className="text-[var(--text-faint)]">
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Search sheets, snippets, courses..."
              className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none"
            />
          </div>

          {/* Quick links — same pill pattern as your FILTER row */}
          <div className="sv404-fade mt-3 flex flex-wrap gap-2" style={{ animationDelay: "220ms" }}>
            {quickLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border-medium)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:-translate-y-0.5 hover:border-brand hover:text-brand"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Signature element — a "broken file" rendered as your sheet card */}
          <div
            className="sv404-fade group relative mt-8 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-elevated p-6 transition-shadow duration-300 hover:shadow-md"
            style={{ animationDelay: "280ms" }}
          >
            <div className="absolute left-0 top-0 h-[3px] w-full bg-[var(--danger)]" />
            <div className="sv404-scan absolute left-0 top-0 h-[3px] w-1/4 bg-gradient-to-r from-transparent via-white/80 to-transparent" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">The Lost Page</h2>
                <p className="mt-0.5 font-mono text-[11px] text-[var(--text-faint)]">/{path}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                style={{ borderColor: "var(--danger-border)", background: "var(--danger-bg)", color: "var(--danger)" }}
              >
                <IconUnlink /> 404
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-faint)]">
                <IconList /> 0 routes matched
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="rounded-md border border-[var(--border-medium)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-hover"
                >
                  Go back
                </button>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-hover)]"
                >
                  Go home <IconArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}