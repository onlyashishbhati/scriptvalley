import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Toggles the star on a question. Returns whether it's now starred or not.
export const toggleStar = mutation({
  args: {
    userId:        v.string(),
    sheetSlug:     v.string(),
    topic:         v.string(),
    questionTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("starred_questions")
      .withIndex("by_user_question", (q) =>
        q.eq("userId", args.userId).eq("questionTitle", args.questionTitle)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { starred: false };
    }

    await ctx.db.insert("starred_questions", {
      userId:        args.userId,
      sheetSlug:     args.sheetSlug,
      topic:         args.topic,
      questionTitle: args.questionTitle,
      createdAt:     Date.now(),
    });

    return { starred: true };
  },
});

export const getStarredByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return [];

    return await ctx.db
      .query("starred_questions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const isStarred = query({
  args: { userId: v.string(), questionTitle: v.string() },
  handler: async (ctx, { userId, questionTitle }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return false;

    const existing = await ctx.db
      .query("starred_questions")
      .withIndex("by_user_question", (q) =>
        q.eq("userId", userId).eq("questionTitle", questionTitle)
      )
      .first();
    return !!existing;
  },
});