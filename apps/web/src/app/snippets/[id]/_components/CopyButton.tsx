"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  return (
    <button
      onClick={copyToClipboard}
      type="button"
      className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors duration-100"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-500/70" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
}

export default CopyButton;