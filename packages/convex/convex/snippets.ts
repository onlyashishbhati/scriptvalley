// Code snippets — create, delete, star, comment, and query.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSnippet = mutation({
  args: {
    title:     v.string(),
    language:  v.string(),
    code:      v.string(),
    isPrivate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("snippets", {
      userId:    identity.subject,
      userName:  user.name,
      title:     args.title,
      language:  args.language,
      code:      args.code,
      isPrivate: args.isPrivate,
    });
  },
});

// Deletes the snippet along with its comments and stars.
export const deleteSnippet = mutation({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, { snippetId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const snippet = await ctx.db.get(snippetId);
    if (!snippet) throw new Error("Snippet not found");
    if (snippet.userId !== identity.subject) throw new Error("Not authorized");

    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id", (q) => q.eq("snippetId", snippetId))
      .collect();
    for (const c of comments) await ctx.db.delete(c._id);

    await ctx.db.delete(snippetId);
  },
});

export const addComment = mutation({
  args: { snippetId: v.id("snippets"), content: v.string() },
  handler: async (ctx, { snippetId, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("snippetComments", {
      snippetId,
      userId:   identity.subject,
      userName: user.name,
      content,
    });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("snippetComments") },
  handler: async (ctx, { commentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comment = await ctx.db.get(commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== identity.subject) throw new Error("Not authorized");

    await ctx.db.delete(commentId);
  },
});

// Public listing — only shows non-private snippets.
export const getSnippets = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("snippets")
      .withIndex("by_privacy", (q) => q.eq("isPrivate", false))
      .order("desc")
      .collect();
  },
});

// Returns all snippets for the logged-in user, including private ones.
export const getUserSnippets = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("snippets")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getSnippetById = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, { snippetId }) => {
    const snippet = await ctx.db.get(snippetId);
    if (!snippet) throw new Error("Snippet not found");

    if (snippet.isPrivate) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity || snippet.userId !== identity.subject) throw new Error("Access denied");
    }

    return snippet;
  },
});

export const getComments = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, { snippetId }) => {
    return await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id", (q) => q.eq("snippetId", snippetId))
      .order("desc")
      .collect();
  },
});

export const getPrivateSnippets = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db
      .query("snippets")
      .withIndex("by_user_id_and_privacy", (q) =>
        q.eq("userId", identity.subject).eq("isPrivate", true)
      )
      .order("desc")
      .collect();
  },
});