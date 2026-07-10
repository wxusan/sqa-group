"use client";

import { useActionState } from "react";
import { deleteMedia } from "@/lib/actions";
import { adminMessages, type AdminLocale } from "@/i18n/admin";

export default function MediaDeleteForm({ locale, url }: { locale: AdminLocale; url: string }) {
  const [state, action, pending] = useActionState(deleteMedia, undefined);
  const t = adminMessages[locale];

  return (
    <form action={action} className="mt-2">
      <input type="hidden" name="adminLang" value={locale} />
      <input type="hidden" name="url" value={url} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-card border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? t.common.saving : t.common.delete}
      </button>
      {state?.error && <p className="mt-1 text-[11px] leading-snug text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-1 text-[11px] leading-snug text-green-700">{state.success}</p>}
    </form>
  );
}
