/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _helper from "../_helper.js";
import type * as adminFeatures from "../adminFeatures.js";
import type * as admins from "../admins.js";
import type * as badgeEngine from "../badgeEngine.js";
import type * as blends from "../blends.js";
import type * as codeExecutions from "../codeExecutions.js";
import type * as constants from "../constants.js";
import type * as courses from "../courses.js";
import type * as experiences from "../experiences.js";
import type * as http from "../http.js";
import type * as instructors from "../instructors.js";
import type * as notes from "../notes.js";
import type * as notifications from "../notifications.js";
import type * as pins from "../pins.js";
import type * as platforms from "../platforms.js";
import type * as portfolio from "../portfolio.js";
import type * as potd from "../potd.js";
import type * as progress from "../progress.js";
import type * as roles from "../roles.js";
import type * as sheets from "../sheets.js";
import type * as snippets from "../snippets.js";
import type * as socials from "../socials.js";
import type * as starred from "../starred.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  _helper: typeof _helper;
  adminFeatures: typeof adminFeatures;
  admins: typeof admins;
  badgeEngine: typeof badgeEngine;
  blends: typeof blends;
  codeExecutions: typeof codeExecutions;
  constants: typeof constants;
  courses: typeof courses;
  experiences: typeof experiences;
  http: typeof http;
  instructors: typeof instructors;
  notes: typeof notes;
  notifications: typeof notifications;
  pins: typeof pins;
  platforms: typeof platforms;
  portfolio: typeof portfolio;
  potd: typeof potd;
  progress: typeof progress;
  roles: typeof roles;
  sheets: typeof sheets;
  snippets: typeof snippets;
  socials: typeof socials;
  starred: typeof starred;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
