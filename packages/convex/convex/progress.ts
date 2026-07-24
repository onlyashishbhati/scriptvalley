import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { upsertSheetProgress } from "./_helper";

export const getAttempts = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return [];

    return await ctx.db
      .query("attempts")
      .withIndex("by_user_question", (q: any) => q.eq("userId", userId))
      .collect();
  },
});

// Alias kept so existing callers don't break.
export const getAllAttempts = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return [];

    return await ctx.db
      .query("attempts")
      .withIndex("by_user_question", (q: any) => q.eq("userId", userId))
      .collect();
  },
});

export const recordAttempt = mutation({
  args: {
    userId:        v.string(),
    questionTitle: v.string(),
    sheetSlug:     v.string(),
    difficulty:    v.string(),
    attempted:     v.boolean(),
  },
  handler: async (ctx, { userId, questionTitle, sheetSlug, difficulty, attempted }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("attempts")
      .withIndex("by_user_question", (q: any) =>
        q.eq("userId", userId).eq("questionTitle", questionTitle)
      )
      .unique()
      .catch(() => null);

    if (existing) {
      await ctx.db.patch(existing._id, { attempted, difficulty, sheetSlug });
    } else {
      await ctx.db.insert("attempts", { userId, questionTitle, sheetSlug, difficulty, attempted });
    }

    const userAttempts = await ctx.db
      .query("attempts")
      .withIndex("by_user_question", (q: any) => q.eq("userId", userId))
      .collect();

    const relevant = userAttempts.filter(
      (a: any) => String(a.sheetSlug) === String(sheetSlug) && !!a.attempted
    );

    await upsertSheetProgress(ctx.db, userId, sheetSlug, relevant);

    const byDiff = { easy: 0, medium: 0, hard: 0 };
    for (const a of relevant) {
      const d = String(a.difficulty || "medium").toLowerCase();
      if (d.startsWith("easy"))      byDiff.easy++;
      else if (d.startsWith("hard")) byDiff.hard++;
      else                           byDiff.medium++;
    }

    return { ok: true, totalSolved: relevant.length, byDifficulty: byDiff };
  },
}); 