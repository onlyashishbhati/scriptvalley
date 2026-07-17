import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { upsertSheetProgress } from "./_helper";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Same seed + date = same pick all day. Different users get different questions.
function seededRandom(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h / 0xffffffff;
}

function pickEmoji(difficulty: string, streak: number): string {
  if (difficulty === "Hard") return "🏆";
  if (streak >= 3)           return "🔥";
  if (difficulty === "Easy") return "⚡";
  return "✅";
}

async function computeCurrentStreak(ctx: any, userId: string): Promise<number> {
  const logs = await ctx.db
    .query("potdLogs")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .order("desc")
    .collect();

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const log of logs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    const diff = Math.round((cursor.getTime() - logDate.getTime()) / 86400000);
    if (diff > 1) break;
    if (diff === 0 || diff === 1) { streak++; cursor = logDate; }
  }
  return streak;
}

type QuestionCandidate = {
  title:      string;
  difficulty: string;
  topic:      string;
  platform:   string;
  url:        string;
  sheetName:  string;
  sheetSlug:  string;
};

function flattenSheet(sheet: any): QuestionCandidate[] {
  const out: QuestionCandidate[] = [];
  for (const topic of sheet.content?.topics ?? []) {
    for (const q of topic.questions ?? []) {
      if (!q.title) continue;
      out.push({
        title:      q.title,
        difficulty: q.difficulty     ?? "Medium",
        topic:      topic.topic      ?? "",
        platform:   q.link?.platform ?? "others",
        url:        q.link?.url      ?? "",
        sheetName:  sheet.name,
        sheetSlug:  sheet.slug,
      });
    }
  }
  return out;
}

type SourceReason = "followed" | "other_sheets" | "global" | "all_done";

// Personalized POTD selection logic:
//   Case A — no followed sheets       → pick from all sheets (unattempted first)
//   Case B — all followed sheets done → pick from non-followed sheets
//   Case C — normal                   → pick unattempted from followed sheets
//   Case D — everything ever done     → repeat from global pool
export const getPersonalizedPotd = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;

    // Only the owning user can request their own personalized POTD.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return null;

    const date       = todayKey();
    const followRows = await ctx.db
      .query("user_sheet_follow")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const followedSlugs: string[] = followRows.map((r: any) => r.sheetSlug);

    const attemptRows = await ctx.db
      .query("attempts")
      .withIndex("by_user_question", (q: any) => q.eq("userId", userId))
      .collect();

    const attemptedSet = new Set<string>();
    for (const row of attemptRows) {
      if (row.attempted) attemptedSet.add(`${row.sheetSlug}::${row.questionTitle}`);
    }

    function isUnattempted(q: QuestionCandidate) {
      return !attemptedSet.has(`${q.sheetSlug}::${q.title}`);
    }

    function seedPick(pool: QuestionCandidate[]): QuestionCandidate {
      return pool[Math.floor(seededRandom(`${userId}::${date}`) * pool.length)];
    }

    function buildResult(
      picked: QuestionCandidate,
      pool:   QuestionCandidate[],
      isAllDone: boolean,
      sourceReason: SourceReason,
      streak: number
    ) {
      return { date, ...picked, streak, totalPool: pool.length, isAllDone, sourceReason };
    }

    // Case A
    if (followedSlugs.length === 0) {
      const allSheets  = await ctx.db.query("dsaSheets").collect();
      const allQs      = allSheets.flatMap(flattenSheet);
      if (allQs.length === 0) return null;
      const unattempted = allQs.filter(isUnattempted);
      const pool        = unattempted.length > 0 ? unattempted : allQs;
      const streak      = await computeCurrentStreak(ctx, userId);
      return buildResult(seedPick(pool), pool, unattempted.length === 0, "global", streak);
    }

    const followedSheets = (
      await Promise.all(
        followedSlugs.map((slug: string) =>
          ctx.db.query("dsaSheets").withIndex("by_slug", (q: any) => q.eq("slug", slug)).unique().catch(() => null)
        )
      )
    ).filter(Boolean);

    const followedData = followedSheets.map((s: any) => {
      const all = flattenSheet(s);
      return { slug: s.slug as string, all, unattempted: all.filter(isUnattempted) };
    });

    const unattemptedFromFollowed = followedData
      .filter((d) => d.unattempted.length > 0)
      .flatMap((d) => d.unattempted);

    // Case C
    if (unattemptedFromFollowed.length > 0) {
      const streak = await computeCurrentStreak(ctx, userId);
      return buildResult(seedPick(unattemptedFromFollowed), unattemptedFromFollowed, false, "followed", streak);
    }

    // Case B
    const followedSlugSet  = new Set(followedSlugs);
    const allSheets        = await ctx.db.query("dsaSheets").collect();
    const otherSheets      = allSheets.filter((s: any) => !followedSlugSet.has(s.slug));
    const unattemptedOther = otherSheets.flatMap(flattenSheet).filter(isUnattempted);

    if (unattemptedOther.length > 0) {
      const streak = await computeCurrentStreak(ctx, userId);
      return buildResult(seedPick(unattemptedOther), unattemptedOther, false, "other_sheets", streak);
    }

    // Case D — the user has done literally everything, just pick anything
    const allQs = allSheets.flatMap(flattenSheet);
    if (allQs.length === 0) return null;
    const streak = await computeCurrentStreak(ctx, userId);
    return buildResult(seedPick(allQs), allQs, true, "all_done", streak);
  },
});

export const isSolvedToday = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return false;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return false;

    const log = await ctx.db
      .query("potdLogs")
      .withIndex("by_user_date", (q: any) =>
        q.eq("userId", userId).eq("date", todayKey())
      )
      .unique()
      .catch(() => null);
    return !!log;
  },
});

// Marks the POTD as solved. Also writes to the attempts table so sheet progress stays in sync.
// Unmarking only removes the log — the attempt record is kept so progress isn't lost.
export const markSolvedToday = mutation({
  args: {
    userId:        v.string(),
    questionTitle: v.string(),
    sheetSlug:     v.string(),
    difficulty:    v.string(),
    solved:        v.boolean(),
  },
  handler: async (ctx, { userId, questionTitle, sheetSlug, difficulty, solved }) => {
    if (!userId) throw new Error("userId required");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const date = todayKey();

    const existingLog = await ctx.db
      .query("potdLogs")
      .withIndex("by_user_date", (q: any) => q.eq("userId", userId).eq("date", date))
      .unique()
      .catch(() => null);

    if (solved) {
      if (existingLog) return { ok: true }; // already marked today

      const streak = await computeCurrentStreak(ctx, userId);
      const emoji  = pickEmoji(difficulty, streak + 1);

      await ctx.db.insert("potdLogs", {
        userId, date, questionTitle, sheetSlug, solved: true, emoji, count: 1,
      });

      // Upsert attempt row so the question shows as done on the sheet page.
      const existingAttempt = await ctx.db
        .query("attempts")
        .withIndex("by_user_question", (q: any) =>
          q.eq("userId", userId).eq("questionTitle", questionTitle)
        )
        .unique()
        .catch(() => null);

      if (existingAttempt) {
        await ctx.db.patch(existingAttempt._id, { attempted: true, difficulty, sheetSlug });
      } else {
        await ctx.db.insert("attempts", { userId, questionTitle, sheetSlug, difficulty, attempted: true });
      }

      // Recompute sheet_progress using the shared helper.
      const userAttempts = await ctx.db
        .query("attempts")
        .withIndex("by_user_question", (q: any) => q.eq("userId", userId))
        .collect();

      const relevant = userAttempts.filter(
        (a: any) => String(a.sheetSlug) === String(sheetSlug) && !!a.attempted
      );

      await upsertSheetProgress(ctx.db, userId, sheetSlug, relevant);

      return { ok: true };
    } else {
      if (existingLog) await ctx.db.delete(existingLog._id);
      return { ok: true };
    }
  },
});

export const getStreakData = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return { currentStreak: 0, longestStreak: 0, totalSolved: 0, solvedDays: [] };

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) {
      return { currentStreak: 0, longestStreak: 0, totalSolved: 0, solvedDays: [] };
    }

    const logs = await ctx.db
      .query("potdLogs")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const solvedDays = logs.map((l: any) => ({
      date:  l.date,
      emoji: l.emoji,
      count: l.count ?? 1,
      title: l.questionTitle ?? "",
    }));

    let currentStreak = 0;
    {
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      for (const log of logs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        const diff = Math.round((cursor.getTime() - logDate.getTime()) / 86400000);
        if (diff > 1) break;
        if (diff === 0 || diff === 1) { currentStreak++; cursor = logDate; }
      }
    }

    let longestStreak = 0;
    {
      const sorted = [...logs].sort((a: any, b: any) => a.date.localeCompare(b.date));
      let run = sorted.length > 0 ? 1 : 0;
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1].date);
        const curr = new Date(sorted[i].date);
        prev.setHours(0, 0, 0, 0);
        curr.setHours(0, 0, 0, 0);
        const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diff === 1)  { run++; longestStreak = Math.max(longestStreak, run); }
        else if (diff > 1) { run = 1; }
      }
      longestStreak = Math.max(longestStreak, run, currentStreak);
    }

    return { currentStreak, longestStreak, totalSolved: logs.length, solvedDays };
  },
});