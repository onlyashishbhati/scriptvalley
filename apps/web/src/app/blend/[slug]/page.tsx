"use client";

import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import BlendDetailSkeleton from "./_components/BlendDetailSkeleton";
import BlendHero from "./_components/BlendHero";
import BlendMemberList from "./_components/BlendMemberList";
import BlendActivityFeed from "./_components/BlendActivityFeed";
import BlendResourcesPanel from "./_components/BlendResourcesPanel";
import BlendJoinRequestsPanel from "./_components/BlendJoinRequestsPanel";
import BlendManagePanel from "./_components/BlendManagePanel";
import type { BlendDetail } from "../types";
import { Users2 } from "lucide-react";

function BlendDetailContent() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();

  const detail = useQuery(api.blends.getBlendDetail, { slug }) as BlendDetail | null | undefined;

  if (detail === undefined) return <BlendDetailSkeleton />;

  if (detail === null) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <Users2 className="w-8 h-8 text-[var(--text-disabled)] mx-auto" />
          <p className="text-sm text-[var(--text-faint)]">
            This blend doesn&apos;t exist, or it&apos;s private and you&apos;re not a member.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12 mt-8 mb-16 space-y-8">
        <BlendHero detail={detail} currentUserId={user?.id} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="space-y-6">
            <BlendMemberList detail={detail} currentUserId={user?.id} />
            <BlendResourcesPanel detail={detail} />
          </div>
          <div className="space-y-6">
            <BlendActivityFeed feed={detail.feed} />
            {detail.isOwner && detail.blend.visibility === "public" && (
              <BlendJoinRequestsPanel detail={detail} />
            )}
            {detail.isOwner && <BlendManagePanel detail={detail} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlendDetailPage() {
  return (
    <ProtectedRoute>
      <BlendDetailContent />
    </ProtectedRoute>
  );
}