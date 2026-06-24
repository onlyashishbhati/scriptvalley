"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { type EditProfileTab } from "./_components/Sidebar";
import BasicInfoForm from "./_components/BasicInfoForm";
import SocialForm from "./_components/SocialForm";
import PlatformForm from "./_components/PlatformForm";
import PortfolioSettings from "./_components/PortfolioSettings";
import ShareSettings from "./_components/ShareSettings";
import { Menu, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

const TABS = [
  { label: "Basic Info", description: "Update your details to personalize your developer profile."    },
  { label: "Socials",    description: "Add links to your social media accounts for better networking." },
  { label: "Platform",   description: "Connect your coding platform to showcase your coding journey."  },
  { label: "Portfolio",  description: "Add a bio, skills, projects, and experience to your mini-portfolio." },
  { label: "Share",      description: "Set a username and control who can see your public profile."    },
] as const satisfies readonly { label: EditProfileTab; description: string }[];

type Tab = EditProfileTab;

const MOBILE_TABS: Tab[] = ["Basic Info", "Socials", "Platform", "Portfolio", "Share"];

function isValidTab(value: string | null): value is Tab {
  return !!value && TABS.some((t) => t.label === value);
}

function EditProfileContent() {
  const searchParams = useSearchParams();
  const router        = useRouter();
  const pathname       = usePathname();

  // Deep-link support: ?tab=Socials, ?tab=Share, etc. ProfileCompletion links
  // and the Share-tab "set a username" prompt both rely on this. This closes
  // out the "Edit-profile page searchParams tab deep-link support" item from
  // the still_pending_from_before list.
  const tabFromUrl = searchParams.get("tab");
  const [selectedTab, setSelectedTabState] = useState<Tab>(
    isValidTab(tabFromUrl) ? tabFromUrl : "Basic Info",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentTab = TABS.find((t) => t.label === selectedTab)!;

  // Keep the URL in sync when the tab changes via click — makes the current
  // tab shareable/bookmarkable and survives a refresh.
  function setSelectedTab(tab: Tab) {
    setSelectedTabState(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // If the URL's ?tab= changes externally (e.g. back/forward nav, or a link
  // from elsewhere in the app like ProfileCompletion), follow it.
  useEffect(() => {
    if (isValidTab(tabFromUrl) && tabFromUrl !== selectedTab) {
      setSelectedTabState(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] w-full pt-16 pb-10">

      {/* Mobile sticky topbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] sticky top-16 z-30">
        <p className="text-sm font-medium text-[var(--text-primary)]">{currentTab.label}</p>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile tab strip — now 5 tabs, made horizontally scrollable since
         they no longer fit on one row with equal flex-1 widths. */}
      <div className="md:hidden flex items-center gap-px px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] overflow-x-auto">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`shrink-0 px-2.5 py-1.5 rounded-md text-xs transition-colors duration-100 ${
              selectedTab === tab
                ? "bg-[var(--bg-active)] text-[var(--text-primary)]"
                : "text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="fixed top-0 left-0 z-50 h-full w-72 bg-[var(--bg-base)] border-r border-[var(--border-subtle)] flex flex-col overflow-hidden md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-0.5">Account</p>
                  <span className="text-sm font-medium text-[var(--text-primary)]">Edit Profile</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Sidebar
                selectedTab={selectedTab}
                setSelectedTab={(tab) => { setSelectedTab(tab); setDrawerOpen(false); }}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row min-h-[80vh]">

          {/* Desktop sidebar */}
          <div className="hidden md:block">
            <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0 px-4 py-8 md:px-8 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                <div className="mb-8">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-1">Account</p>
                  <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">{currentTab.label}</h1>
                  <p className="text-sm text-[var(--text-faint)]">{currentTab.description}</p>
                </div>
                <div className="border-t border-[var(--border-subtle)] mb-8" />

                {selectedTab === "Basic Info" && <BasicInfoForm />}
                {selectedTab === "Socials"    && <SocialForm />}
                {selectedTab === "Platform"   && <PlatformForm />}
                {selectedTab === "Portfolio"  && <PortfolioSettings />}
                {selectedTab === "Share"      && <ShareSettings />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}