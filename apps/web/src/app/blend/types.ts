import { FileSpreadsheet, GraduationCap, type LucideIcon } from "lucide-react";

export type BlendResourceType = "sheet" | "course";
export type BlendVisibility = "private" | "public";
export type JoinRequestStatus = "pending" | "approved" | "rejected";

export interface Blend {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerUserId: string;
  visibility: BlendVisibility;
  resourceType: BlendResourceType;
  inviteCode: string;
  memberCount: number;
  createdAt: number;
  resourceCount?: number;
}

export interface BlendResource {
  _id: string;
  blendId: string;
  resourceSlug: string;
  resourceName: string;
  addedByUserId: string;
  addedAt: number;
}

export interface BlendMemberProgress {
  userId: string;
  userName: string;
  role: "owner" | "member";
  joinedAt: number;
  pct: number;
  detail: string;
}

export interface BlendJoinRequest {
  _id: string;
  userId: string;
  userName: string;
  status: JoinRequestStatus;
  requestedAt: number;
}

export interface BlendDetail {
  blend: Blend;
  isMember: boolean;
  isOwner: boolean;
  members: BlendMemberProgress[];
  resources: BlendResource[];
  groupAvgPct: number;
  feed: { type: "joined"; userName: string; at: number }[];
  myJoinRequestStatus: JoinRequestStatus | null;
  pendingRequests: BlendJoinRequest[];
}

// No emojis — icons only, matching the rest of the site.
export const RESOURCE_TYPE_META: Record<BlendResourceType, { label: string; itemLabel: string; icon: LucideIcon }> = {
  sheet: { label: "DSA Sheet", itemLabel: "sheet", icon: FileSpreadsheet },
  course: { label: "Course", itemLabel: "course", icon: GraduationCap },
};