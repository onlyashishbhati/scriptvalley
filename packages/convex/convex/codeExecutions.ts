import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

export const saveExecution = mutation({
  args: {
    language: v.string(),
    code:     v.string(),
    output:   v.optional(v.string()),
    error:    v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    await ctx.db.insert("codeExecutions", {
      ...args,
      userId: identity.subject,
    });
  },
});

export const getUserExecutions = query({
  args: {
    userId:         v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    // Only the owning user can read their own execution history.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.userId) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    return await ctx.db
      .query("codeExecutions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});