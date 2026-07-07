export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-card border border-line bg-white px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none";
