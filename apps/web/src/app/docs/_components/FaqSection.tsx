"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  {
    q: "What exactly is Script Valley?",
    a: "Script Valley is a free coding platform for students, built around DSA preparation for placements. One account replaces the usual stack: LeetCode for problems, GitHub for a portfolio, Notion for notes, a random compiler for quick tests. You get a multi-language compiler with AI debugging, curated DSA sheets, notes linked to questions, a portfolio you control, short interview-focused courses, and a contest calendar.",
  },
  {
    q: "Is Script Valley better than LeetCode?",
    a: "LeetCode still has the bigger problem bank, it's the best place to grind company-specific lists. We're not competing there. What we solve is the workflow around it: once you've picked a question, you still need a compiler, a place for notes, progress tracking, and something to show for the work after. Want raw volume? Stick with LeetCode. Want a LeetCode alternative that also handles notes, sheets, and your portfolio? That's us.",
  },
  {
    q: "What is the best LeetCode alternative for placements?",
    a: "If \"alternative\" means a bigger problem bank, that's not our lane, LeetCode is hard to match there. If it means an alternative workflow for placement prep, one that bundles the compiler, curated sheets, notes, and a portfolio instead of stitching five tools together, that's exactly what Script Valley is built for. Most students don't need more problems, they need one place to track the ones they've already done.",
  },
  {
    q: "What is the best platform for DSA preparation for placements?",
    a: "Depends what you're optimizing for. For pure volume, LeetCode and GeeksforGeeks both work fine. Script Valley is built around the full placement workflow: a curated sheet so you're not guessing what to practice, a compiler to test solutions inline, notes tied to each question, and a portfolio at the end so the prep is visible to recruiters. If your prep is spread across four tools right now, this closes that gap.",
  },
  {
    q: "Is there a free online compiler with AI debugging?",
    a: "Yes. The compiler runs JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, Swift, and Ruby, free, no sign-in required. When a run fails, AI Fix reads your code and the error, explains what broke in plain English, and applies a corrected version in one click. Optimise mode cleans up code that already works.",
  },
  {
    q: "Which programming languages are supported?",
    a: "JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, Swift, and Ruby, with more added over time. Switch instantly from the dropdown in the editor.",
  },
  {
    q: "Do I need an account to use Script Valley?",
    a: "You can browse public snippets and the landing page without signing in, so it works fine as a quick coding platform for students who just want to test something. Everything else, running code persistently, tracking DSA progress, notes, snippets, your portfolio, and courses, needs a free Google sign-in.",
  },
  {
    q: "Is Script Valley good for beginners?",
    a: "Yes. You can run code with no account, switch languages in one click, and AI Fix explains errors in plain English instead of a stack trace. Paired with DSA sheets that start from the basics, it works as well as a coding platform for beginners as it does for someone deep into placement prep.",
  },
  {
    q: "Is it really free?",
    a: "Yes. All core features are free, no subscriptions, no hidden charges, no credit card required. We may add optional paid tiers later, but the core product stays free.",
  },
  {
    q: "What does the AI assistant actually do?",
    a: "Reads your code and the error output, explains what broke, returns a corrected version, one click. Optimise mode rewrites working code for readability or performance.",
  },
  {
    q: "What are DSA Sheets?",
    a: "Curated problem sets, similar in spirit to Striver's SDE Sheet or NeetCode 150, organised by topic with per-question progress tracking, built for serious DSA preparation for placements. Mark a question solved, attempted, or skipped, and progress shows on your developer profile. Sheets download for offline revision, useful the night before an interview.",
  },
  {
    q: "Can I download DSA sheets for offline use?",
    a: "Yes, every sheet has a download option for offline revision. It's for quick pre-interview review, not a progress tracker, an offline copy won't sync your solved or attempted status back once you're online again.",
  },
  {
    q: "Can I share my code snippets?",
    a: "Yes. Public snippets are visible to everyone and searchable by language, private ones are visible only to you. Public snippets can be starred and commented on. Each gets a permanent shareable URL.",
  },
  {
    q: "How does the developer profile work?",
    a: "Auto-pulls from three sources: DSA sheet progress, GitHub activity (heatmap, language breakdown, streaks), and LeetCode stats (submission calendar, difficulty breakdown). Connect your handles from Edit Profile → Platforms and it updates on its own. Separate from your portfolio, which you build by hand.",
  },
  {
    q: "How do I build a developer portfolio as a student?",
    a: "Most portfolio builders auto-pull whatever's on your GitHub and spit out a templated page that looks like everyone else's. Script Valley's doesn't. You choose what goes on it, which projects, which links, which platforms to show. The design stays minimal on purpose, built for placements, not for showing off a template. Set it up once, share it with a single link on a resume or LinkedIn.",
  },
  {
    q: "Can I build a developer portfolio from coding practice?",
    a: "Yes, but on your terms. Your DSA progress, saved snippets, and profile stats are all there to draw from, you decide which ones actually go on the portfolio. It's not a dump of every problem you've touched, it's a curated page that shows your strongest work, built for recruiters, not for completeness.",
  },
  {
    q: "Are Script Valley courses better than GeeksforGeeks?",
    a: "GeeksforGeeks goes deep, full theory, long PDFs. Script Valley courses strip that out: learn only what matters for interviews, nothing else. Shorter by design, not by missing content. Hit 50% completion and you unlock handwritten notes for that course, downloadable, yours to revise from whenever. That's the real feature here, not a bonus, lean lessons plus notes you actually keep. \"Better\" depends on whether you want depth or exam-day efficiency.",
  },
  {
    q: "Where can I report a bug or request a feature?",
    a: "Use the feedback form linked in the footer and in the docs sidebar. Every submission is read and genuinely considered.",
  },
];

function FaqItem({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left group"
      >
        <span className="w-5 h-5 rounded-md bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[10px] font-semibold text-[var(--text-disabled)] flex items-center justify-center shrink-0 mt-[2px] group-hover:border-[var(--border-medium)] transition-colors">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span
          className={`flex-1 text-sm font-medium transition-colors duration-100 ${
            open ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
          }`}
        >
          {item.q}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 mt-[2px] transition-all duration-200 ${
            open ? "rotate-180 text-[#3A5EFF]" : "text-[var(--text-disabled)]"
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-4 pl-[calc(1.25rem+0.75rem+0.75rem)] pr-5 text-sm text-[var(--text-faint)] leading-[1.8]">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  return (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
      <div className="px-6 py-5 bg-[var(--bg-input)] border-b border-[var(--border-subtle)] flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-[#3A5EFF] shrink-0 mt-[3px]" />
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1">
            FAQ
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Frequently Asked Questions
          </h2>
          <p className="mt-1.5 text-sm text-[var(--text-faint)] leading-relaxed">
            Quick answers to the questions we get asked most.
          </p>
        </div>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {FAQS.map((item, i) => (
          <FaqItem key={item.q} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}