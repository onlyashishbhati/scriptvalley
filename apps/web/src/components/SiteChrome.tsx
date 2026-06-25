"use client";

import { usePathname } from "next/navigation";
import { DockWrapper } from "./DockWrapper";
import Footer from "./Footer";
import Navbar from "./Navbar";
import AnnouncementBanner from "../app/dev-profile/_components/AnnouncementBanner";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
      {/* <Footer /> */}
    </>
  );
}