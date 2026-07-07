"use client";

import { useState } from "react";

export default function CopyTemplate({
  text,
  copyLabel,
  copiedLabel,
}: {
  text: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (e.g. http) — select text manually instead
    }
  }

  return (
    <button
      onClick={copy}
      className={`rounded-card px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
        copied ? "bg-green-600" : "bg-primary hover:bg-primary-bright"
      }`}
    >
      {copied ? `✓ ${copiedLabel}` : copyLabel}
    </button>
  );
}
