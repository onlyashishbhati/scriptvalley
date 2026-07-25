"use client";

import { useUser } from "@clerk/nextjs";
import { FloatingDock } from "@/components/Dock";
import {
  Home,
  FileSpreadsheet,
  SquareLibrary,
  SquareChevronRight,
  FilePenLine,
  Star,
  Presentation,
  Users2,
} from "lucide-react";
import UserDropdown from "./UserDropdown";

export function DockWrapper() {
  const { isSignedIn } = useUser();

  if (!isSignedIn) return null;

  const links = [
    {
      title: "Home",
      icon: <Home className="h-full w-full" />,
      href: "/dev-profile",
    },
    {
      title: "Courses",
      icon: <Presentation className="h-full w-full" />,
      href: "/courses",
    },
    {
      title: "Sheets",
      icon: <FileSpreadsheet className="h-full w-full" />,
      href: "/dsa-sheet",
    },
    {
      title: "Blend",
      icon: <Users2 className="h-full w-full" />,
      href: "/blend",
    },
    {
      title: "Notes",
      icon: <FilePenLine className="h-full w-full" />,
      href: "/notes",
    },
    {
      title: "Starred",
      icon: <Star className="h-full w-full" />,
      href: "/starred",
    },
    {
      title: "Playground",
      icon: <SquareChevronRight className="h-full w-full" />,
      href: "/playground",
    },
    {
      title: "Profile",
      icon: (
        <div className="h-4 w-4 flex items-center justify-center">
          <UserDropdown />
        </div>
      ),
      href: "",
    },
  ];

  return (
    <FloatingDock
      items={links}
      mobileClassName="fixed bottom-4 right-4 z-50"
      desktopClassName="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    />
  );
}