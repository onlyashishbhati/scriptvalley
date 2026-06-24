"use client";

import { User, Share2, Code, FolderGit2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// This export was MISSING from the previous version of this file — that's
// the root cause of Portfolio/Share never appearing. edit-profile/page.tsx
// does:
//   import Sidebar, { type EditProfileTab } from "./_components/Sidebar";
// but this file only had an inline, unexported "Basic Info" | "Socials" |
// "Platform" union and a 3-item tabs array. The Portfolio/Share tabs simply
// did not exist here, regardless of anything else being wired up correctly
// elsewhere.
export type EditProfileTab = "Basic Info" | "Socials" | "Platform" | "Portfolio" | "Share";

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: EditProfileTab) => void;
}

const tabs: { label: EditProfileTab; icon: React.ElementType }[] = [
  { label: "Basic Info", icon: User       },
  { label: "Socials",    icon: Share2     },
  { label: "Platform",   icon: Code       },
  { label: "Portfolio",  icon: FolderGit2 },
  { label: "Share",      icon: Share2     },
];

export default function Sidebar({ selectedTab, setSelectedTab }: SidebarProps) {
  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-[var(--border-subtle)]">

      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">Account</p>
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Edit Profile</h2>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-2 space-y-px">
        {tabs.map(({ label, icon: Icon }) => {
          const active = selectedTab === label;
          return (
            <button
              key={label}
              onClick={() => setSelectedTab(label)}
              className={`relative group w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors duration-100 ${
                active
                  ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="editProfileNav"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#3A5EFF] rounded-r-full"
                />
              )}
              <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#3A5EFF]" : "text-[var(--text-faint)]"}`} />
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
        <Link
          href="/dev-profile"
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[var(--text-disabled)] hover:text-[var(--text-muted)] transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          Dev Profile
        </Link>
      </div>
    </aside>
  );
}