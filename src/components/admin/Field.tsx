export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <input
        {...rest}
        className="w-full rounded-card border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <textarea
        {...rest}
        className="w-full rounded-card border border-line bg-white px-3 py-2 text-sm leading-relaxed text-ink outline-none transition-colors focus:border-primary"
      />
    </label>
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const { label, children, ...rest } = props;
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-soft">{label}</span>
      <select
        {...rest}
        className="w-full rounded-card border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-primary"
      >
        {children}
      </select>
    </label>
  );
}
