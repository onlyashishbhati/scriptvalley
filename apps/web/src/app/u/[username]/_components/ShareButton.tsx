'use client';

import { useState } from 'react';

interface ShareButtonProps {
  username: string;
}

export default function ShareButton({ username }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://scriptvalley.com/u/${username}`;

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${username} on ScriptValley`,
          url,
        });
        return;
      } catch {
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked (e.g. insecure context) — no-op, button just
      // won't show the "Copied!" confirmation.
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-(--brand) text-white hover:opacity-90 transition-opacity"
    >
      {copied ? 'Copied!' : 'Share profile'}
    </button>
  );
}