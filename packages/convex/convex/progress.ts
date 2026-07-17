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

export const toggleFollow = mutation({
  args: { userId: v.string(), sheetSlug: v.string(), follow: v.boolean() },
  handler: async (ctx, { userId, sheetSlug, follow }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("user_sheet_follow")
      .withIndex("by_user_sheet", (q: any) =>
        q.eq("userId", userId).eq("sheetSlug", sheetSlug)
      )
      .unique()
      .catch(() => null);

    if (follow && !existing) {
      await ctx.db.insert("user_sheet_follow", { userId, sheetSlug, followedAt: Date.now() });
      return { ok: true, follow: true };
    }
    if (!follow && existing) {
      await ctx.db.delete(existing._id);
      return { ok: true, follow: false };
    }
    return { ok: true, follow };
  },
});

// Returns metadata for every sheet the user has followed.
export const getFollowedSheets = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return [];

    const follows = await ctx.db
      .query("user_sheet_follow")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    const results: { id: string; name: string; topics: any[]; route: string }[] = [];

    for (const f of follows) {
      const sheet = await ctx.db
        .query("dsaSheets")
        .withIndex("by_slug", (q: any) => q.eq("slug", f.sheetSlug))
        .unique()
        .catch(() => null);

      if (sheet) {
        results.push({
          id:     sheet.slug,
          name:   sheet.name ?? sheet.slug,
          topics: (sheet.content as any)?.topics ?? [],
          route:  `/dsa-sheet/${sheet.slug}`,
        });
      }
    }

    return results;
  },
});

// Records whether a question was attempted or unmarked.
// Also recomputes sheet_progress for the user + sheet combo.
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

    // Recompute progress only for this sheet so we don't scan the whole table.
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