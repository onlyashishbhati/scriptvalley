import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./_helper";

function sanitizeString(s: unknown): string {
  if (typeof s !== "string") return "";
  return s.trim();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function isValidPhone(phone: string) {
  if (!phone) return true;
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^[+0-9]{7,15}$/.test(cleaned);
}

function isReasonableName(name: string) {
  const len = name.trim().length;
  return len >= 2 && len <= 120;
}

// Username must be 3–20 chars, only lowercase letters, digits, underscores, hyphens.
// No leading/trailing hyphens or underscores.
function isValidUsername(username: string): boolean {
  return /^[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]$/.test(username);
}

// ─── Existing mutations / queries ─────────────────────────────────────────────

// Called by the Clerk webhook on user.created and by UserSyncProvider on sign in.
// The webhook calls this via ctx.runMutation from an httpAction, which carries
// no Clerk identity — so we only enforce the identity check when one IS present
// (i.e. a live client call), to prevent a signed-in user from overwriting
// another user's profile row while still allowing the webhook's system call.
export const syncUser = mutation({
  args: {
    userId: v.string(),
    email:  v.optional(v.string()),
    name:   v.optional(v.string()),
    role:   v.optional(v.string()),
  },
  handler: async (ctx, { userId, email, name, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity && identity.subject !== userId) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    const now = new Date().toISOString();

    if (!existing) {
      await ctx.db.insert("users", {
        userId,
        email:     email ?? "",
        name:      name  ?? "",
        role:      role  ?? "user",
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const patch: Record<string, string> = {};
      if (email && email !== existing.email) patch.email = email;
      if (name  && name  !== existing.name)  patch.name  = name;
      if (role  && role  !== existing.role)  patch.role  = role;
      if (Object.keys(patch).length > 0) {
        patch.updatedAt = now;
        await ctx.db.patch(existing._id, patch);
      }
    }

    return { ok: true };
  },
});

// Fetch a single user by their Clerk userId.
// Restricted to the owning user — this row includes phone/email/banned/flagged
// fields that shouldn't be readable by arbitrary callers.
export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const uid = sanitizeString(userId);
    if (!uid) return null;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== uid) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", uid))
      .unique();
  },
});

// Update the editable fields on a user's profile (name, email, phone, college, location).
export const updateBasicInfo = mutation({
  args: {
    userId:      v.string(),
    name:        v.string(),
    email:       v.string(),
    phoneNumber: v.optional(v.string()),
    collegeName: v.optional(v.string()),
    state:       v.optional(v.string()),
    country:     v.optional(v.string()),
    idToken:     v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId      = sanitizeString(args.userId);
    const name        = sanitizeString(args.name);
    const email       = sanitizeString(args.email);
    const phoneNumber = sanitizeString(args.phoneNumber ?? "");
    const collegeName = sanitizeString(args.collegeName ?? "");
    const state       = sanitizeString(args.state       ?? "");
    const country     = sanitizeString(args.country     ?? "");

    if (!userId)                    throw new Error("Missing userId");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== userId) throw new Error("Unauthorized");

    if (!isReasonableName(name))    throw new Error("Invalid name");
    if (!isValidEmail(email))       throw new Error("Invalid email");
    if (!isValidPhone(phoneNumber)) throw new Error("Invalid phone number");

    const now = new Date().toISOString();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        email,
        phoneNumber: phoneNumber || undefined,
        collegeName: collegeName || undefined,
        state:       state       || undefined,
        country:     country     || undefined,
        updatedAt:   now,
      });
      return await ctx.db.get(existing._id);
    }

    return await ctx.db.insert("users", {
      userId,
      name,
      email,
      phoneNumber: phoneNumber || undefined,
      collegeName: collegeName || undefined,
      state:       state       || undefined,
      country:     country     || undefined,
      createdAt:   now,
      updatedAt:   now,
    });
  },
});

// Full-text search over name + email — used in the admin user search.
// This exposes name/email for every user matching the query, so it must be
// admin-gated (it previously had no authorization check at all).
export const searchUsers = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    await requireAdmin(ctx.db, ctx.auth);

    const lower = q.toLowerCase();
    const users = await ctx.db.query("users").collect();
    return users
      .filter(
        (u) =>
          u.name?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower)
      )
      .map((u) => ({ userId: u.userId, name: u.name, email: u.email }));
  },
});

// ─── Mini-Portfolio mutations / queries ───────────────────────────────────────

/**
 * setUsername
 * Lets the authenticated user claim a vanity handle for /u/[username].
 * Rules:
 *   - 3–20 chars, lowercase letters / digits / underscores / hyphens
 *   - Cannot start or end with _ or -
 *   - Must be globally unique (checked via by_username index)
 * Passing an empty string clears the username.
 */
export const setUsername = mutation({
  args: {
    userId:   v.string(),
    username: v.string(),
  },
  handler: async (ctx, { userId, username }) => {
    const uid  = sanitizeString(userId);
    const slug = sanitizeString(username).toLowerCase();

    if (!uid) throw new Error("Missing userId");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== uid) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", uid))
      .unique();
    if (!user) throw new Error("User not found");

    // Clearing the username is always allowed.
    if (slug === "") {
      await ctx.db.patch(user._id, { username: undefined });
      return { ok: true, username: null };
    }

    if (!isValidUsername(slug)) {
      throw new Error(
        "Username must be 3–20 characters and contain only lowercase letters, " +
        "numbers, hyphens, or underscores, and cannot start or end with – or _."
      );
    }

    // Uniqueness check — use the index so this is O(1).
    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", slug))
      .unique();

    if (taken && taken._id !== user._id) {
      throw new Error(`The username "${slug}" is already taken.`);
    }

    await ctx.db.patch(user._id, { username: slug, updatedAt: new Date().toISOString() });
    return { ok: true, username: slug };
  },
});

/**
 * checkUsernameAvailability
 * Lightweight read-only check used by the Share settings UI to show
 * a green/red indicator while the user types.
 */
export const checkUsernameAvailability = query({
  args: { username: v.string(), currentUserId: v.string() },
  handler: async (ctx, { username, currentUserId }) => {
    const slug = sanitizeString(username).toLowerCase();

    if (!slug) return { available: false, reason: "empty" };
    if (!isValidUsername(slug)) return { available: false, reason: "invalid_format" };

    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", slug))
      .unique();

    if (!taken) return { available: true };
    // It's fine if the only match is the current user themselves.
    if (taken.userId === currentUserId) return { available: true };

    return { available: false, reason: "taken" };
  },
});

/**
 * setProfileVisibility
 * Toggles a user's profile between public and private.
 * Default (field absent) is treated as private everywhere.
 */
export const setProfileVisibility = mutation({
  args: {
    userId:     v.string(),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  handler: async (ctx, { userId, visibility }) => {
    const uid = sanitizeString(userId);
    if (!uid) throw new Error("Missing userId");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== uid) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", uid))
      .unique();
    if (!user) throw new Error("User not found");

    // A user must have a username before they can go public.
    if (visibility === "public" && !user.username) {
      throw new Error("Set a username before making your profile public.");
    }

    await ctx.db.patch(user._id, {
      profileVisibility: visibility,
      updatedAt: new Date().toISOString(),
    });

    return { ok: true, visibility };
  },
});

/**
 * getPublicProfile
 * Server-side query for /u/[username]. Returns null (→ 404) when:
 *   - username doesn't exist
 *   - profileVisibility is not explicitly "public"
 *
 * NEVER returns email, phone, banned, flagged, or role fields.
 * All badge computation is deferred to computeBadges (badgeEngine.ts).
 */
export const getPublicProfile = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const slug = sanitizeString(username).toLowerCase();
    if (!slug) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", slug))
      .unique();

    // Not found or profile is private — both return null (identical 404 response
    // so we don't leak whether a username exists).
    if (!user || user.profileVisibility !== "public") return null;

    // Fetch socials and platforms in parallel — safe to expose since the user
    // chose to make their profile public.
    const [socials, platforms, streakData, sheetProgress] = await Promise.all([
      ctx.db
        .query("socials")
        .withIndex("by_user_id", (q: any) => q.eq("userId", user.userId))
        .unique(),
      ctx.db
        .query("platforms")
        .withIndex("by_user_id", (q: any) => q.eq("userId", user.userId))
        .unique(),
      // Streak summary — just the counts, not the full log list.
      ctx.db
        .query("potdLogs")
        .withIndex("by_user", (q: any) => q.eq("userId", user.userId))
        .order("desc")
        .collect()
        .then((logs: any[]) => {
          const totalSolved = logs.length;

          let currentStreak = 0;
          let cursor = new Date();
          cursor.setHours(0, 0, 0, 0);
          for (const log of logs) {
            const d = new Date(log.date);
            d.setHours(0, 0, 0, 0);
            const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000);
            if (diff > 1) break;
            if (diff === 0 || diff === 1) { currentStreak++; cursor = d; }
          }

          let longestStreak = 0;
          const sorted = [...logs].sort((a: any, b: any) => a.date.localeCompare(b.date));
          let run = sorted.length > 0 ? 1 : 0;
          for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1].date); prev.setHours(0, 0, 0, 0);
            const curr = new Date(sorted[i].date);     curr.setHours(0, 0, 0, 0);
            const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
            if (diff === 1)    { run++; longestStreak = Math.max(longestStreak, run); }
            else if (diff > 1) { run = 1; }
          }
          longestStreak = Math.max(longestStreak, run, currentStreak);

          return { currentStreak, longestStreak, totalSolved };
        }),
      // Sheet progress rows — used by computeBadges to detect 100% sheets.
      ctx.db
        .query("sheet_progress")
        .withIndex("by_user_sheet", (q: any) => q.eq("userId", user.userId))
        .collect(),
    ]);

    // Count followed sheets (used in badge engine later).
    const followedSheets = await ctx.db
      .query("user_sheet_follow")
      .withIndex("by_user", (q: any) => q.eq("userId", user.userId))
      .collect();

    // Count lesson completions per course (used by Course Completer badge).
    const lessonProgressRows = await ctx.db
      .query("lesson_progress")
      .withIndex("by_user_course", (q: any) => q.eq("userId", user.userId))
      .collect();

    // Count distinct courses the user has any progress in.
    const courseSlugsStarted = [...new Set((lessonProgressRows as any[]).map((l: any) => l.courseSlug))];

    // Safe public fields only — NO email, phone, banned, flagged, role.
    // userId IS included (Clerk subject id) — it's not sensitive on its own
    // and the public page needs it to: (a) fetch the Clerk avatar URL via
    // Clerk's public user API, and (b) call getPublicPortfolio(userId).
    return {
      userId:        user.userId,
      username:      user.username,
      name:          user.name,
      collegeName:   user.collegeName ?? null,
      state:         user.state       ?? null,
      country:       user.country     ?? null,

      socials: {
        linkedin:  socials?.linkedin  ?? null,
        twitter:   socials?.twitter   ?? null,
        portfolio: socials?.portfolio ?? null,
        resume:    socials?.resume    ?? null,
      },

      platforms: {
        githubUrl:   platforms?.githubUrl   ?? null,
        leetcodeUrl: platforms?.leetcodeUrl ?? null,
      },

      stats: {
        currentStreak:     streakData.currentStreak,
        longestStreak:     streakData.longestStreak,
        totalPotdSolved:   streakData.totalSolved,
        sheetsFollowed:    followedSheets.length,
        coursesInProgress: courseSlugsStarted.length,
      },

      // Raw data passed to computeBadges on the client / in badgeEngine.ts.
      // Sending it here avoids a second round-trip from the profile page.
      _badgeInputs: {
        currentStreak:     streakData.currentStreak,
        totalSolved:       streakData.totalSolved,
        sheetProgressRows: (sheetProgress as any[]).map((sp: any) => ({
          sheetSlug:      sp.sheetSlug,
          totalSolved:    sp.totalSolved,
          totalAttempted: sp.totalAttempted,
        })),
        followedSheetSlugs: (followedSheets as any[]).map((f: any) => f.sheetSlug),
        courseSlugsStarted,
        allSocialsLinked:
          !!(socials?.linkedin && socials?.twitter && socials?.portfolio && socials?.resume),
        githubLinked:   !!(platforms?.githubUrl),
        leetcodeLinked: !!(platforms?.leetcodeUrl),
        // Early Adopter is computed client-side from the user's Convex _id
        // creation timestamp — pass the raw _creationTime for that check.
        accountCreationTime: user._creationTime,
      },
    };
  },
});