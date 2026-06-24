/**
 * badgeEngine.ts
 *
 * Computes badges at read-time from data already returned by getPublicProfile.
 * No database access — all badge conditions are pure functions over the
 * _badgeInputs block that getPublicProfile embeds in its response.
 *
 * CHANGED in this revision:
 *   - icon is now a Lucide icon NAME (string), not an emoji character.
 *     The component layer maps this name to an actual lucide-react
 *     component — see BadgesGrid.tsx's ICON_MAP. Kept as a string here
 *     (not a component reference) so this file stays framework-agnostic
 *     and importable from both Convex (server) and React (client) without
 *     pulling react/lucide-react into the Convex bundle.
 *   - each badge now also returns `progress: { current, target }` so the
 *     UI can render a progress bar for locked badges instead of just a
 *     binary locked/unlocked state. For badges with no natural numeric
 *     progress (e.g. Social Butterfly — a boolean condition), current/target
 *     is 0/1 or 1/1.
 *
 * Usage (server or client):
 *   import { computeBadges } from "./badgeEngine";
 *   const badges = computeBadges(profile._badgeInputs);
 */

export type BadgeInputs = {
  currentStreak: number;
  totalSolved: number;
  sheetProgressRows: { sheetSlug: string; totalSolved: number; totalAttempted: number }[];
  followedSheetSlugs: string[];
  courseSlugsStarted: string[];
  allSocialsLinked: boolean;
  githubLinked: boolean;
  leetcodeLinked: boolean;
  accountCreationTime: number;
};

// Lucide icon names — see BadgesGrid.tsx's ICON_MAP for the actual
// lucide-react component each of these resolves to.
export type BadgeIconName =
  | "flame"
  | "trophy"
  | "target"
  | "swords"
  | "clipboard-check"
  | "graduation-cap"
  | "sprout"
  | "users"
  | "zap";

export type Badge = {
  id: string;
  label: string;
  icon: BadgeIconName;
  earned: boolean;
  unlockHint: string;
  progress: { current: number; target: number };
};

// ─── Badge definitions ────────────────────────────────────────────────────────
const EARLY_ADOPTER_CUTOFF_MS = new Date("2025-12-31T23:59:59Z").getTime();

type BadgeDef = {
  id: string;
  label: string;
  icon: BadgeIconName;
  unlockHint: string;
  check: (inputs: BadgeInputs) => boolean;
  progress: (inputs: BadgeInputs) => { current: number; target: number };
};

const BADGE_DEFS: BadgeDef[] = [
  {
    id: "streak_7",
    label: "Week Warrior",
    icon: "flame",
    unlockHint: "Maintain a 7-day POTD streak",
    check: ({ currentStreak }) => currentStreak >= 7,
    progress: ({ currentStreak }) => ({ current: Math.min(currentStreak, 7), target: 7 }),
  },
  {
    id: "streak_30",
    label: "Month Master",
    icon: "trophy",
    unlockHint: "Maintain a 30-day POTD streak",
    check: ({ currentStreak }) => currentStreak >= 30,
    progress: ({ currentStreak }) => ({ current: Math.min(currentStreak, 30), target: 30 }),
  },
  {
    id: "solved_100",
    label: "Century Solver",
    icon: "target",
    unlockHint: "Solve 100 problems via POTD",
    check: ({ totalSolved }) => totalSolved >= 100,
    progress: ({ totalSolved }) => ({ current: Math.min(totalSolved, 100), target: 100 }),
  },
  {
    id: "solved_500",
    label: "Problem Slayer",
    icon: "swords",
    unlockHint: "Solve 500 problems via POTD",
    check: ({ totalSolved }) => totalSolved >= 500,
    progress: ({ totalSolved }) => ({ current: Math.min(totalSolved, 500), target: 500 }),
  },
  {
    id: "sheet_complete",
    label: "Sheet Master",
    icon: "clipboard-check",
    unlockHint: "Complete 100% of any followed DSA sheet",
    check: ({ sheetProgressRows, followedSheetSlugs }) => {
      const followedSet = new Set(followedSheetSlugs);
      return sheetProgressRows.some(
        (sp) =>
          followedSet.has(sp.sheetSlug) &&
          sp.totalAttempted > 0 &&
          sp.totalSolved >= sp.totalAttempted,
      );
    },
    progress: ({ sheetProgressRows, followedSheetSlugs }) => {
      const followedSet = new Set(followedSheetSlugs);
      const relevant = sheetProgressRows.filter((sp) => followedSet.has(sp.sheetSlug));
      if (relevant.length === 0) return { current: 0, target: 1 };
      // Use the single most-progressed followed sheet as the displayed ratio.
      const best = relevant.reduce((a, b) => {
        const aRatio = a.totalAttempted > 0 ? a.totalSolved / a.totalAttempted : 0;
        const bRatio = b.totalAttempted > 0 ? b.totalSolved / b.totalAttempted : 0;
        return bRatio > aRatio ? b : a;
      });
      return { current: best.totalSolved, target: Math.max(best.totalAttempted, 1) };
    },
  },
  {
    id: "course_done",
    label: "Course Completer",
    icon: "graduation-cap",
    unlockHint: "Complete all lessons in any course",
    check: ({ courseSlugsStarted }) => courseSlugsStarted.length > 0,
    progress: ({ courseSlugsStarted }) => ({
      current: courseSlugsStarted.length > 0 ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: "early_adopter",
    label: "Early Adopter",
    icon: "sprout",
    unlockHint: "Join ScriptValley in its early days",
    check: ({ accountCreationTime }) =>
      accountCreationTime > 0 && accountCreationTime <= EARLY_ADOPTER_CUTOFF_MS,
    progress: ({ accountCreationTime }) => ({
      current: accountCreationTime > 0 && accountCreationTime <= EARLY_ADOPTER_CUTOFF_MS ? 1 : 0,
      target: 1,
    }),
  },
  {
    id: "social_full",
    label: "Social Butterfly",
    icon: "users",
    unlockHint: "Fill in all 4 social links (LinkedIn, Twitter, portfolio, resume)",
    check: ({ allSocialsLinked }) => allSocialsLinked,
    progress: ({ allSocialsLinked }) => ({ current: allSocialsLinked ? 1 : 0, target: 1 }),
  },
  {
    id: "platform_pro",
    label: "Platform Pro",
    icon: "zap",
    unlockHint: "Connect both GitHub and LeetCode profiles",
    check: ({ githubLinked, leetcodeLinked }) => githubLinked && leetcodeLinked,
    progress: ({ githubLinked, leetcodeLinked }) => ({
      current: (githubLinked ? 1 : 0) + (leetcodeLinked ? 1 : 0),
      target: 2,
    }),
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeBadges(inputs: BadgeInputs): Badge[] {
  const results: Badge[] = BADGE_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    icon: def.icon,
    earned: def.check(inputs),
    unlockHint: def.unlockHint,
    progress: def.progress(inputs),
  }));

  return [...results.filter((b) => b.earned), ...results.filter((b) => !b.earned)];
}

export function computeBadgesSummary(inputs: BadgeInputs): { earned: number; total: number } {
  const earned = BADGE_DEFS.filter((def) => def.check(inputs)).length;
  return { earned, total: BADGE_DEFS.length };
}