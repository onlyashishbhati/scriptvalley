"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Lock } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return null;

  if (isSignedIn) return <>{children}</>;

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0"
        style={{ filter: "blur(12px)", opacity: 0.25 }}
      >
        <div className="p-8 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-6 rounded-md bg-[var(--bg-hover)]"
              style={{ width: `${70 - (i % 3) * 12}%` }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-[var(--bg-base)]/60" />

      <div className="absolute inset-0 flex items-center justify-center px-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1     }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden shadow-2xl shadow-black/20"
          >
            <div className="px-6 py-5 bg-[var(--bg-input)] border-b border-[var(--border-subtle)] flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
                <Lock className="w-3.5 h-3.5 text-[#3A5EFF]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">
                  Restricted
                </p>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Sign in to continue
                </h2>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              <p className="text-sm text-[var(--text-faint)] leading-relaxed">
                This page is only available to signed-in users. Sign in with
                your Google account — no password, no setup, takes five seconds.
              </p>

              <ul className="flex flex-col gap-2">
                {[
                  "Free — no subscriptions, no credit card",
                  "Google sign-in, instant access",
                  "All your data synced across devices",
                ].map((hint) => (
                  <li key={hint} className="flex items-center gap-2 text-xs text-[var(--text-disabled)]">
                    <span className="w-1 h-1 rounded-full bg-[#3A5EFF] shrink-0" />
                    {hint}
                  </li>
                ))}
              </ul>

              <SignInButton mode="modal">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#3A5EFF] hover:bg-[#4a6aff] text-white text-sm font-medium transition-colors duration-150">
                  <LogIn className="w-4 h-4" />
                  Sign in with Google
                </button>
              </SignInButton>
            </div>

            <div className="px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-input)]">
              <p className="text-[10px] text-[var(--text-disabled)] text-center">
                By signing in you agree to our{" "}
                <a href="/docs?section=terms"   className="text-[#3A5EFF] hover:text-[#4a6aff] transition-colors">Terms</a>
                {" "}and{" "}
                <a href="/docs?section=privacy" className="text-[#3A5EFF] hover:text-[#4a6aff] transition-colors">Privacy Policy</a>.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}