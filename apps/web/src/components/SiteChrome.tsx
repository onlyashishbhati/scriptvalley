"use client";

/**
 * SiteChrome.tsx
 *
 * Wraps the navbar, announcement banner, dock, and footer, and hides all of
 * them on /u/[username] public profile routes — the portfolio should feel
 * like a standalone page, not a page-within-ScriptValley.
 *
 * WHY A CLIENT WRAPPER, NOT A ROUTE GROUP:
 *   The alternative is restructuring app/ into route groups, e.g.
 *   app/(site)/... for everything that keeps the navbar and
 *   app/(portfolio)/u/[username]/... for the route that doesn't. That's the
 *   "more correct" Next.js pattern, but it means moving every existing route
 *   folder into a new (site)/ group — high blast radius on a layout.tsx that
 *   already wires together ClerkProvider, ConvexClientProvider,
 *   AuthModalProvider, UserSyncProvider, and the toast/analytics setup. A
 *   pathname check is a much smaller, safer change for the same outcome.
 *
 * If you later DO want to move to route groups (e.g. because you're adding
 * more chrome-free routes beyond /u/[username]), this component can be
 * deleted and the layout split normally — nothing else depends on it.
 *
 * Usage in app/layout.tsx, replacing the unconditional
 * <Navbar /><AnnouncementBanner />{children}<DockWrapper /><Footer />:
 *
 *   <SiteChrome>{children}</SiteChrome>
 */

import { usePathname } from "next/navigation";
import { DockWrapper } from "./DockWrapper";
import Footer from "./Footer";
import Navbar from "./Navbar";
import AnnouncementBanner from "../app/dev-profile/_components/AnnouncementBanner";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Matches /u/anything — the public portfolio route. Adjust this pattern
  // if you add more standalone (chrome-free) routes later.
  const hideChrome = pathname?.startsWith("/u/");

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <AnnouncementBanner />
      {children}
      <DockWrapper />
      <Footer />
    </>
  );
}