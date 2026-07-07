"use client";

import { useState } from "react";

export default function CopyTemplateButton({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — user can select manually
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-card bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
