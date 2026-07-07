"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-card bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright disabled:opacity-60"
    >
      {pending ? "Saving..." : children}
    </button>
  );
}
