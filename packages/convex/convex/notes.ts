import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Creates or updates a note. Passing an empty string deletes it.
export const upsertNote = mutation({
  args: {
    userId:        v.string(),
    questionTitle: v.string(),
    notes:         v.string(),
  },
  handler: async (ctx, { userId, questionTitle, notes }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("questionNotes")
      .withIndex("by_user_question", (q) =>
        q.eq("userId", userId).eq("questionTitle", questionTitle)
      )
      .unique();

    const now = Date.now();

    if (existing) {
      if (notes.trim() === "") {
        await ctx.db.delete(existing._id);
        return null;
      }
      await ctx.db.patch(existing._id, { notes, updatedAt: now });
      return existing._id;
    }

    if (notes.trim() !== "") {
      return await ctx.db.insert("questionNotes", {
        userId,
        questionTitle,
        notes,
        createdAt: now,
        updatedAt: now,
      });
    }

    return null;
  },
});

export const getNote = query({
  args: { userId: v.string(), questionTitle: v.string() },
  handler: async (ctx, { userId, questionTitle }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return "";

    const note = await ctx.db
      .query("questionNotes")
      .withIndex("by_user_question", (q) =>
        q.eq("userId", userId).eq("questionTitle", questionTitle)
      )
      .unique();
    return note?.notes || "";
  },
});

// Returns all notes as a map of questionTitle → noteText.
export const getAllNotes = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return {};

    const notes = await ctx.db
      .query("questionNotes")
      .withIndex("by_user_question", (q) => q.eq("userId", userId))
      .collect();

    const map: Record<string, string> = {};
    notes.forEach((n) => { map[n.questionTitle] = n.notes; });
    return map;
  },
});

export const deleteNote = mutation({
  args: { userId: v.string(), questionTitle: v.string() },
  handler: async (ctx, { userId, questionTitle }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    const note = await ctx.db
      .query("questionNotes")
      .withIndex("by_user_question", (q) =>
        q.eq("userId", userId).eq("questionTitle", questionTitle)
      )
      .unique();
    if (note) { await ctx.db.delete(note._id); return true; }
    return false;
  },
});

export const getNotesCount = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return 0;

    const notes = await ctx.db
      .query("questionNotes")
      .withIndex("by_user_question", (q) => q.eq("userId", userId))
      .collect();
    return notes.length;
  },
});

// Returns a flat list of { questionTitle, notes } — used on the notes export page.
export const getAllUserNotes = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) return [];

    const notes = await ctx.db
      .query("questionNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return notes.map((n) => ({ questionTitle: n.questionTitle, notes: n.notes }));
  },
});