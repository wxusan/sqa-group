"use client";

import { useId, useState } from "react";

export default function FileUploadButton({
  name,
  accept,
  label,
  hint,
  buttonLabel,
  noFileLabel,
}: {
  name: string;
  accept: string;
  label: string;
  hint: string;
  buttonLabel: string;
  noFileLabel: string;
}) {
  const id = useId();
  const [fileName, setFileName] = useState("");

  return (
    <div>
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-dashed border-line bg-band/50 p-3">
        <label
          htmlFor={id}
          className="cursor-pointer rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
        >
          {buttonLabel}
        </label>
        <span className="min-w-0 truncate text-sm text-ink-soft">{fileName || noFileLabel}</span>
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => setFileName(event.currentTarget.files?.[0]?.name ?? "")}
        />
      </div>
      <p className="mt-1 text-xs text-ink-soft">{hint}</p>
    </div>
  );
}
