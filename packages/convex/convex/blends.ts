// Blend — small groups tracking shared progress on one or more DSA sheets,
// or one or more courses. See schema.ts for why there's no separate
// activity-log table.
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { BLEND_LIMITS } from "./schema";
import { makeSlug } from "./_helper";

const {
  MAX_PRIVATE_BLEND_MEMBERS,
  MAX_PUBLIC_BLEND_MEMBERS,
  MAX_BLEND_NAME_LEN,
  MAX_BLEND_DESC_LEN,
  INVITE_CODE_LENGTH,
  MAX_RESOURCES_PER_BLEND,
} = BLEND_LIMITS;

const resourceTypeV = v.union(v.literal("sheet"), v.literal("course"));

// ─── Small local helpers ──────────────────────────────────────────────────────

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function randomInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

async function generateUniqueInviteCode(db: any): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomInviteCode();
    const existing = await db
      .query("blends")
      .withIndex("by_invite_code", (q: any) => q.eq("inviteCode", code))
      .unique()
      .catch(() => null);
    if (!existing) return code;
  }
  throw new Error("Could not generate a unique invite code — please try again.");
}

// Mirrors sheets.ts's parseContent — dsaSheets.content can be a JSON string
// or an already-parsed object depending on how the row was written.
function parseSheetContent(content: any) {
  if (!content) return { topics: [] };
  if (typeof content === "string") {
    try { return JSON.parse(content); } catch { return { topics: [] }; }
  }
  return content;
}

// Total question count for a sheet — handles both flat and sub-topic modes,
// same shape potd.ts's flattenSheet already understands.
function countSheetQuestions(sheetDoc: any): number {
  const content = parseSheetContent(sheetDoc?.content);
  let count = 0;
  for (const topic of content.topics ?? []) {
    if (topic.useSubTopics && topic.subTopics?.length) {
      for (const st of topic.subTopics) count += (st.questions ?? []).length;
    } else {
      count += (topic.questions ?? []).length;
    }
  }
  return count;
}

function countCourseLessons(courseDoc: any): number {
  return (courseDoc?.modules ?? []).reduce(
    (sum: number, mod: any) => sum + (mod.lessons?.length ?? 0),
    0,
  );
}

async function requireMember(db: any, blendId: Id<"blends">, userId: string) {
  const membership = await db
    .query("blend_members")
    .withIndex("by_blend_user", (q: any) => q.eq("blendId", blendId).eq("userId", userId))
    .unique()
    .catch(() => null);
  if (!membership) throw new Error("You're not a member of this blend");
  return membership;
}

// ─── Mutations: create / manage ──────────────────────────────────────────────

export const createBlend = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("private"), v.literal("public")),
    resourceType: resourceTypeV,
  },
  handler: async (ctx, { name, description, visibility, resourceType }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to create a blend");
    const userId = identity.subject;

    const cleanName = name.trim();
    if (!cleanName) throw new Error("Give your blend a name");
    if (cleanName.length > MAX_BLEND_NAME_LEN)
      throw new Error(`Name must be ${MAX_BLEND_NAME_LEN} characters or fewer`);

    const cleanDesc = description?.trim() ?? "";
    if (cleanDesc.length > MAX_BLEND_DESC_LEN)
      throw new Error(`Description must be ${MAX_BLEND_DESC_LEN} characters or fewer`);

    // Slug for /blend/[slug] — same generate-and-dedupe pattern
    // courses.ts/sheets.ts already use for their own slugs.
    const baseSlug = makeSlug(cleanName);
    let slug = baseSlug;
    let counter = 1;
    while (
      await ctx.db.query("blends").withIndex("by_slug", (q) => q.eq("slug", slug)).unique()
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    const userRow = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    const inviteCode = await generateUniqueInviteCode(ctx.db);
    const now = Date.now();

    const blendId = await ctx.db.insert("blends", {
      name: cleanName,
      slug,
      description: cleanDesc || undefined,
      ownerUserId: userId,
      visibility,
      resourceType,
      inviteCode,
      memberCount: 1,
      createdAt: now,
    });

    await ctx.db.insert("blend_members", {
      blendId,
      userId,
      userName: userRow?.name || identity.name || "Member",
      role: "owner",
      joinedAt: now,
    });

    return { ok: true, blendId, slug, inviteCode };
  },
});

// Owner-only: keeps a blend's tracked list intentional (especially on
// public blends, where anyone can become a member) rather than something
// any member can pile onto unchecked.
export const addResource = mutation({
  args: { blendId: v.id("blends"), resourceSlug: v.string() },
  handler: async (ctx, { blendId, resourceSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const blend = await ctx.db.get(blendId);
    if (!blend) throw new Error("Blend not found");
    if (blend.ownerUserId !== identity.subject)
      throw new Error("Only the blend owner can add what's tracked");

    const existingCount = (
      await ctx.db.query("blend_resources").withIndex("by_blend", (q) => q.eq("blendId", blendId)).collect()
    ).length;
    if (existingCount >= MAX_RESOURCES_PER_BLEND)
      throw new Error(`You can track up to ${MAX_RESOURCES_PER_BLEND} at once`);

    const dup = await ctx.db
      .query("blend_resources")
      .withIndex("by_blend_slug", (q) => q.eq("blendId", blendId).eq("resourceSlug", resourceSlug))
      .unique()
      .catch(() => null);
    if (dup) throw new Error("Already tracking that");

    let resourceName = resourceSlug;
    if (blend.resourceType === "sheet") {
      const sheet = await ctx.db.query("dsaSheets").withIndex("by_slug", (q) => q.eq("slug", resourceSlug)).unique();
      if (!sheet) throw new Error("That sheet doesn't exist");
      resourceName = sheet.name;
    } else {
      const course = await ctx.db.query("courses").withIndex("by_slug", (q) => q.eq("slug", resourceSlug)).unique();
      if (!course) throw new Error("That course doesn't exist");
      resourceName = course.title;
    }

    await ctx.db.insert("blend_resources", {
      blendId,
      resourceSlug,
      resourceName,
      addedByUserId: identity.subject,
      addedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const removeResource = mutation({
  args: { blendId: v.id("blends"), resourceSlug: v.string() },
  handler: async (ctx, { blendId, resourceSlug }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const blend = await ctx.db.get(blendId);
    if (!blend) throw new Error("Blend not found");
    if (blend.ownerUserId !== identity.subject)
      throw new Error("Only the blend owner can remove what's tracked");

    const row = await ctx.db
      .query("blend_resources")
      .withIndex("by_blend_slug", (q) => q.eq("blendId", blendId).eq("resourceSlug", resourceSlug))
      .unique()
      .catch(() => null);
    if (!row) throw new Error("Not currently tracking that");

    await ctx.db.delete(row._id);
    return { ok: true };
  },
});

// ─── Mutations: joining ───────────────────────────────────────────────────────

async function addMemberDirectly(ctx: any, blend: any, userId: string, identityName?: string) {
  const existing = await ctx.db
    .query("blend_members")
    .withIndex("by_blend_user", (q: any) => q.eq("blendId", blend._id).eq("userId", userId))
    .unique()
    .catch(() => null);
  if (existing) return { ok: true, blendId: blend._id, slug: blend.slug, alreadyMember: true };

  const cap = blend.visibility === "private" ? MAX_PRIVATE_BLEND_MEMBERS : MAX_PUBLIC_BLEND_MEMBERS;
  if (blend.memberCount >= cap) throw new Error(`This blend is full (max ${cap} members)`);

  const userRow = await ctx.db
    .query("users")
    .withIndex("by_user_id", (q: any) => q.eq("userId", userId))
    .unique();

  const now = Date.now();
  await ctx.db.insert("blend_members", {
    blendId: blend._id,
    userId,
    userName: userRow?.name || identityName || "Member",
    role: "member",
    joinedAt: now,
  });
  await ctx.db.patch(blend._id, { memberCount: blend.memberCount + 1 });

  if (blend.ownerUserId !== userId) {
    await ctx.db.insert("notifications", {
      userId: blend.ownerUserId,
      type: "blend_member_joined",
      title: `${userRow?.name || "Someone"} joined "${blend.name}"`,
      body: undefined,
      link: `/blend/${blend.slug}`,
      read: false,
      createdAt: now,
    });
  }

  return { ok: true, blendId: blend._id, slug: blend.slug, alreadyMember: false };
}

// Private blends: instant join via the secret invite code — the code
// itself is the approval gate, no separate request step needed.
export const joinBlendByCode = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, { inviteCode }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to join a blend");

    const code = inviteCode.trim().toUpperCase();
    const blend = await ctx.db.query("blends").withIndex("by_invite_code", (q) => q.eq("inviteCode", code)).unique();
    if (!blend) throw new Error("Invalid invite code");

    return await addMemberDirectly(ctx, blend, identity.subject, identity.name);
  },
});

// Public blends: request → owner approves/declines (see blend_join_requests
// in schema.ts for why). Re-requesting after a decline is allowed.
export const requestToJoinBlend = mutation({
  args: { blendId: v.id("blends") },
  handler: async (ctx, { blendId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in to request to join");
    const userId = identity.subject;

    const blend = await ctx.db.get(blendId);
    if (!blend) throw new Error("Blend not found");
    if (blend.visibility !== "public")
      throw new Error("This blend is invite-only — ask the owner for the invite code");

    const existingMember = await ctx.db
      .query("blend_members")
      .withIndex("by_blend_user", (q) => q.eq("blendId", blendId).eq("userId", userId))
      .unique()
      .catch(() => null);
    if (existingMember) return { ok: true, alreadyMember: true, alreadyRequested: false };

    if (blend.memberCount >= MAX_PUBLIC_BLEND_MEMBERS)
      throw new Error(`This blend is full (max ${MAX_PUBLIC_BLEND_MEMBERS} members)`);

    const userRow = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    const now = Date.now();

    const existingRequest = await ctx.db
      .query("blend_join_requests")
      .withIndex("by_blend_user", (q) => q.eq("blendId", blendId).eq("userId", userId))
      .unique()
      .catch(() => null);

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return { ok: true, alreadyMember: false, alreadyRequested: true };
      }
      // Allow re-requesting after a previous rejection.
      await ctx.db.patch(existingRequest._id, { status: "pending", requestedAt: now, respondedAt: undefined });
    } else {
      await ctx.db.insert("blend_join_requests", {
        blendId,
        userId,
        userName: userRow?.name || identity.name || "Someone",
        status: "pending",
        requestedAt: now,
      });
    }

    await ctx.db.insert("notifications", {
      userId: blend.ownerUserId,
      type: "blend_join_request",
      title: `${userRow?.name || "Someone"} wants to join "${blend.name}"`,
      body: undefined,
      link: `/blend/${blend.slug}`,
      read: false,
      createdAt: now,
    });

    return { ok: true, alreadyMember: false, alreadyRequested: false };
  },
});

export const respondToJoinRequest = mutation({
  args: { blendId: v.id("blends"), requestUserId: v.string(), approve: v.boolean() },
  handler: async (ctx, { blendId, requestUserId, approve }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const blend = await ctx.db.get(blendId);
    if (!blend) throw new Error("Blend not found");
    if (blend.ownerUserId !== identity.subject)
      throw new Error("Only the blend owner can respond to join requests");

    const request = await ctx.db
      .query("blend_join_requests")
      .withIndex("by_blend_user", (q) => q.eq("blendId", blendId).eq("userId", requestUserId))
      .unique();
    if (!request || request.status !== "pending") throw new Error("No pending request from that user");

    const now = Date.now();

    if (approve) {
      if (blend.memberCount >= MAX_PUBLIC_BLEND_MEMBERS)
        throw new Error(`This blend is full (max ${MAX_PUBLIC_BLEND_MEMBERS} members)`);

      await ctx.db.patch(request._id, { status: "approved", respondedAt: now });
      await ctx.db.insert("blend_members", {
        blendId, userId: requestUserId, userName: request.userName, role: "member", joinedAt: now,
      });
      await ctx.db.patch(blendId, { memberCount: blend.memberCount + 1 });
      await ctx.db.insert("notifications", {
        userId: requestUserId,
        type: "blend_join_approved",
        title: `You're in! "${blend.name}" accepted your request`,
        body: undefined,
        link: `/blend/${blend.slug}`,
        read: false,
        createdAt: now,
      });
    } else {
      await ctx.db.patch(request._id, { status: "rejected", respondedAt: now });
      await ctx.db.insert("notifications", {
        userId: requestUserId,
        type: "blend_join_rejected",
        title: `Your request to join "${blend.name}" wasn't accepted`,
        body: undefined,
        link: undefined,
        read: false,
        createdAt: now,
      });
    }

    return { ok: true };
  },
});

export const leaveBlend = mutation({
  args: { blendId: v.id("blends") },
  handler: async (ctx, { blendId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const userId = identity.subject;

    const blend = await ctx.db.get(blendId);
    if (!blend) throw new Error("Blend not found");
    if (blend.ownerUserId === userId)
      throw new Error("You own this blend — delete it instead of leaving");

    const membership = await requireMember(ctx.db, blendId, userId);
    await ctx.db.delete(membership._id);
    await ctx.db.patch(blendId, { memberCount: Math.max(0, blend.memberCount - 1) });

    return { ok: true };
  },
});

export const removeMember = mutation({
  args: { blendId: v.id("blends"), targetUserId: v.string() },
  handler: async (ctx, { blendId, targetUserId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const blend = await ctx.db.get(blendId);
    if (!blend) throw new Error("Blend not found");
    if (blend.ownerUserId !== identity.subject)
      throw new Error("Only the blend owner can remove members");
    if (targetUserId === blend.ownerUserId)
      throw new Error("The owner can't remove themselves — delete the blend instead");

    const membership = await ctx.db
      .query("blend_members")
      .withIndex("by_blend_user", (q) => q.eq("blendId", blendId).eq("userId", targetUserId))
      .unique();
    if (!membership) throw new Error("That user isn't a member");

    await ctx.db.delete(membership._id);
    await ctx.db.patch(blendId, { memberCount: Math.max(0, blend.memberCount - 1) });

    await ctx.db.insert("notifications", {
      userId: targetUserId,
      type: "blend_removed",
      title: `You were removed from "${blend.name}"`,
      body: undefined,
      link: undefined,
      read: false,
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

export const deleteBlend = mutation({
  args: { blendId: v.id("blends") },
  handler: async (ctx, { blendId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const blend = await ctx.db.get(blendId);
    if (!blend) throw new Error("Blend not found");
    if (blend.ownerUserId !== identity.subject)
      throw new Error("Only the blend owner can delete it");

    const [members, resources, requests] = await Promise.all([
      ctx.db.query("blend_members").withIndex("by_blend", (q) => q.eq("blendId", blendId)).collect(),
      ctx.db.query("blend_resources").withIndex("by_blend", (q) => q.eq("blendId", blendId)).collect(),
      ctx.db.query("blend_join_requests").withIndex("by_blend", (q) => q.eq("blendId", blendId)).collect(),
    ]);
    await Promise.all([
      ...members.map((m: any) => ctx.db.delete(m._id)),
      ...resources.map((r: any) => ctx.db.delete(r._id)),
      ...requests.map((r: any) => ctx.db.delete(r._id)),
    ]);
    await ctx.db.delete(blendId);

    return { ok: true };
  },
});

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getMyBlends = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const memberships = await ctx.db
      .query("blend_members")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    const blends = await Promise.all(memberships.map((m) => ctx.db.get(m.blendId).catch(() => null)));
    const valid = blends.filter((b): b is NonNullable<typeof b> => !!b);

    const withCounts = await Promise.all(
      valid.map(async (b) => ({
        ...b,
        resourceCount: (
          await ctx.db.query("blend_resources").withIndex("by_blend", (q) => q.eq("blendId", b._id)).collect()
        ).length,
      })),
    );

    return withCounts.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getPublicBlends = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    const rows = await ctx.db
      .query("blends")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .order("desc")
      .take(100);

    const filtered = !search?.trim()
      ? rows
      : rows.filter((b) => b.name.toLowerCase().includes(search.trim().toLowerCase()));

    return await Promise.all(
      filtered.map(async (b) => ({
        ...b,
        resourceCount: (
          await ctx.db.query("blend_resources").withIndex("by_blend", (q) => q.eq("blendId", b._id)).collect()
        ).length,
      })),
    );
  },
});

// Per-resource, per-member % — parallelized across resources and members
// since both lists are small and bounded (MAX_RESOURCES_PER_BLEND,
// MAX_PRIVATE/PUBLIC_BLEND_MEMBERS).
async function computeMemberPctMatrix(
  ctx: any,
  resourceType: "sheet" | "course",
  resources: any[],
  memberUserIds: string[],
): Promise<number[][]> {
  return Promise.all(
    resources.map(async (res) => {
      if (resourceType === "sheet") {
        const sheet = await ctx.db.query("dsaSheets").withIndex("by_slug", (q: any) => q.eq("slug", res.resourceSlug)).unique().catch(() => null);
        const total = sheet ? countSheetQuestions(sheet) : 0;
        return Promise.all(
          memberUserIds.map(async (uid) => {
            const row = await ctx.db
              .query("sheet_progress")
              .withIndex("by_user_sheet", (q: any) => q.eq("userId", uid).eq("sheetSlug", res.resourceSlug))
              .unique()
              .catch(() => null);
            const solved = row?.totalSolved ?? 0;
            return total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
          }),
        );
      } else {
        const course = await ctx.db.query("courses").withIndex("by_slug", (q: any) => q.eq("slug", res.resourceSlug)).unique().catch(() => null);
        const total = course ? countCourseLessons(course) : 0;
        return Promise.all(
          memberUserIds.map(async (uid) => {
            const rows = await ctx.db
              .query("lesson_progress")
              .withIndex("by_user_course", (q: any) => q.eq("userId", uid).eq("courseSlug", res.resourceSlug))
              .collect();
            return total > 0 ? Math.min(100, Math.round((rows.length / total) * 100)) : 0;
          }),
        );
      }
    }),
  );
}

export const getBlendDetail = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const identity = await ctx.auth.getUserIdentity();

    const blend = await ctx.db.query("blends").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!blend) return null;

    const membership = identity
      ? await ctx.db
          .query("blend_members")
          .withIndex("by_blend_user", (q) => q.eq("blendId", blend._id).eq("userId", identity.subject))
          .unique()
          .catch(() => null)
      : null;

    // Public blends are viewable by anyone so non-members can preview
    // before requesting to join; private blends require membership.
    if (blend.visibility === "private" && !membership) return null;

    const members = await ctx.db.query("blend_members").withIndex("by_blend", (q) => q.eq("blendId", blend._id)).collect();
    const resources = await ctx.db.query("blend_resources").withIndex("by_blend", (q) => q.eq("blendId", blend._id)).collect();

    const memberUserIds = members.map((m) => m.userId);
    // matrix[resourceIndex][memberIndex] = that member's % on that resource
    const matrix = resources.length > 0
      ? await computeMemberPctMatrix(ctx, blend.resourceType, resources, memberUserIds)
      : [];

    const memberProgress = members.map((m, memberIdx) => {
      const pcts = matrix.map((resourceRow) => resourceRow[memberIdx]);
      // Individual % = average of their % across every tracked resource —
      // this is the same "% of that resource's total size" logic used per
      // resource, just averaged when a blend tracks more than one.
      const avgPct = pcts.length > 0 ? Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length) : 0;
      const completedCount = pcts.filter((p) => p >= 100).length;
      return {
        userId: m.userId,
        userName: m.userName,
        role: m.role,
        joinedAt: m.joinedAt,
        pct: avgPct,
        detail: resources.length === 0
          ? "No resources tracked yet"
          : `${completedCount}/${resources.length} completed`,
      };
    }).sort((a, b) => b.pct - a.pct || b.joinedAt - a.joinedAt);

    // Group average = mean of members' individual %, matching the same
    // "average of individual percentages" logic requested for both sheet
    // and course blends.
    const groupAvgPct = memberProgress.length > 0
      ? Math.round(memberProgress.reduce((s, m) => s + m.pct, 0) / memberProgress.length)
      : 0;

    const feed = [...members]
      .sort((a, b) => b.joinedAt - a.joinedAt)
      .slice(0, 10)
      .map((m) => ({ type: "joined" as const, userName: m.userName, at: m.joinedAt }));

    const isOwner = identity ? blend.ownerUserId === identity.subject : false;

    let myJoinRequestStatus: "pending" | "approved" | "rejected" | null = null;
    if (identity && !membership && blend.visibility === "public") {
      const req = await ctx.db
        .query("blend_join_requests")
        .withIndex("by_blend_user", (q) => q.eq("blendId", blend._id).eq("userId", identity.subject))
        .unique()
        .catch(() => null);
      myJoinRequestStatus = req?.status ?? null;
    }

    const pendingRequests = isOwner
      ? await ctx.db
          .query("blend_join_requests")
          .withIndex("by_blend_status", (q) => q.eq("blendId", blend._id).eq("status", "pending"))
          .collect()
      : [];

    return {
      blend,
      isMember: !!membership,
      isOwner,
      members: memberProgress,
      resources,
      groupAvgPct,
      feed,
      myJoinRequestStatus,
      pendingRequests,
    };
  },
});