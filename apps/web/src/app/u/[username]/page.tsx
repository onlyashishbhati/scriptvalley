import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../packages/convex/convex/_generated/api";
import SidebarProfile from "./_components/SidebarProfile";

interface PageProps {
  params: Promise<{ username: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const profile = await fetchQuery(api.users.getPublicProfile, { username });

  if (!profile) {
    return { title: "Profile not found · ScriptValley" };
  }

  const title = `${profile.name} (@${profile.username}) · ScriptValley`;
  const description = profile.collegeName
    ? `${profile.name} from ${profile.collegeName} on ScriptValley`
    : `${profile.name}'s developer profile on ScriptValley`;

  return {
    title,
    description,
    openGraph: { title, description, images: [`/api/og/${profile.username}`], type: "profile" },
    twitter: { card: "summary_large_image", title, description, images: [`/api/og/${profile.username}`] },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;

  const profile = await fetchQuery(api.users.getPublicProfile, { username });
  if (!profile) notFound();

  const portfolio = await fetchQuery(api.portfolio.getPublicPortfolio, {
    userId: profile.userId,
  });

  let avatarUrl: string | null = null;
  try {
    const clerkRes = await fetch(`https://api.clerk.com/v1/users/${profile.userId}`, {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    if (clerkRes.ok) {
      const clerkUser = await clerkRes.json();
      avatarUrl = clerkUser.image_url ?? null;
    }
  } catch {
    avatarUrl = null;
  }

  const normalizedProfile = {
    ...profile,
    username: profile.username ?? null,
  };

  return <SidebarProfile profile={normalizedProfile} portfolio={portfolio} avatarUrl={avatarUrl} />;
}