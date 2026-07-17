"use client";

import { useState, useEffect } from "react";
import { X, Clipboard, Check, ExternalLink } from "lucide-react";
import Image from "next/image";

type Props = { snippetId: string };

export default function ShareButton({ snippetId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(`${window.location.origin}/snippets/${snippetId}`);
    }
  }, [snippetId]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked — same fix as CopyButton.tsx: avoid an
      // unhandled promise rejection when writeText() fails.
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] uppercase tracking-widest
          text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]
          transition-colors duration-100"
      >
        <ExternalLink className="w-3 h-3" />
        Share
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-[var(--bg-base)] w-full max-w-sm rounded-xl p-5 border border-[var(--border-subtle)] shadow-2xl z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)]">Snippet</p>
                <h2 className="text-sm font-medium text-[var(--text-primary)]">Share</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between gap-2 mb-5">
              {[
                { href: `https://wa.me/?text=${encodeURIComponent(url)}`, icon: "/whatsapp.png", label: "WhatsApp" },
                { href: `mailto:?subject=Check this snippet&body=${encodeURIComponent(url)}`, icon: "/gmail.png", label: "Email" },
                { href: `https://www.reddit.com/submit?url=${encodeURIComponent(url)}`, icon: "/reddit.png", label: "Reddit" },
                { href: `https://discord.com/channels/@me`, icon: "/discord.png", label: "Discord" },
              ].map(({ href, icon, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  className="flex-1 flex items-center justify-center p-2.5 rounded-lg bg-[var(--bg-hover)] hover:bg-[var(--bg-active)] border border-[var(--border-subtle)] transition-colors duration-100"
                >
                  <Image src={icon} alt={label} width={22} height={22} className="object-contain" />
                </a>
              ))}
            </div>

            <p className="text-[10px] uppercase tracking-widest text-[var(--text-disabled)] mb-2">Link</p>
            <div className="flex items-center h-8 bg-[var(--bg-input)] rounded-md px-3 gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 bg-transparent text-xs text-[var(--text-muted)] outline-none truncate"
              />
              <button
                onClick={copyUrl}
                className="text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-colors duration-100 shrink-0"
              >
                {copied
                  ? <Check className="w-3.5 h-3.5 text-emerald-500/70" />
                  : <Clipboard className="w-3.5 h-3.5" />
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}