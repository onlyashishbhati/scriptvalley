"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Mail } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const COLS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Compiler",    href: "/playground"  },
      { label: "DSA Sheets",  href: "/dsa-sheet"   },
      { label: "Snippets",    href: "/snippets"     },
      { label: "Dev Profile", href: "/dev-profile"  },
      { label: "Notes",       href: "/notes"        },
      { label: "Contests",    href: "/contests"     },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Sorting Visualizer",     href: "/sorting-visualizer"       },
      { label: "Pathfinding Visualizer", href: "/path-finder-visualizer"   },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs"                    },
      { label: "FAQ",           href: "/docs?section=faq"        },
      { label: "Contact us",    href: "/docs?section=contact"    },
      { label: "Report a bug",  href: "/docs?section=feedback"   },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/docs?section=terms"   },
      { label: "Privacy Policy",   href: "/docs?section=privacy" },
    ],
  },
];

function LinkCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] px-1 mb-1">
        {title}
      </p>
      {links.map(({ label, href }) => (
        <Link
          key={label}
          href={href}
          className="flex items-center gap-1.5 px-1 py-1 rounded-md text-xs text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)] transition-colors duration-100 w-fit"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className="bg-[var(--bg-base)] border-t border-[var(--border-subtle)]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-[1fr_repeat(4,auto)] gap-x-12 gap-y-10">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <Image
                src={isDark ? "/dark-logo.png" : "/light-logo.png"}
                alt="Script Valley"
                width={86}
                height={86}
              />
            </Link>

            <p className="text-xs text-[var(--text-disabled)] leading-relaxed max-w-[220px]">
              A free, unified platform for developers — code, track, share, and
              grow without switching tabs.
            </p>

            <div className="flex items-center gap-1.5 mt-1">
              {[
                { icon: Github,  href: "https://github.com",            label: "GitHub"  },
                { icon: Twitter, href: "https://twitter.com",           label: "Twitter" },
                { icon: Mail,    href: "mailto:hello@scriptvalley.com", label: "Email"   },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="p-1.5 rounded-md text-[var(--text-disabled)] hover:text-[var(--text-muted)] hover:bg-[var(--bg-hover)] border border-transparent hover:border-[var(--border-subtle)] transition-colors duration-100"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <LinkCol key={col.title} {...col} />
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border-medium)]" />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-[10px] text-[var(--text-disabled)]">
          © {new Date().getFullYear()} Script Valley. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {[
            { label: "Terms",   href: "/docs?section=terms"   },
            { label: "Privacy", href: "/docs?section=privacy" },
            { label: "FAQ",     href: "/docs?section=faq"     },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[10px] text-[var(--text-disabled)] hover:text-[var(--text-faint)] transition-colors duration-100"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}