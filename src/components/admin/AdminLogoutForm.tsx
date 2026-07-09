"use client";

import { logoutAction } from "@/lib/actions";
import type { AdminLocale } from "@/i18n/admin";
import { ADMIN_TAB_SESSION_KEY } from "./AdminTabSessionGuard";

export default function AdminLogoutForm({
  locale,
  label,
}: {
  locale: AdminLocale;
  label: string;
}) {
  return (
    <form
      action={logoutAction}
      onSubmit={() => {
        sessionStorage.removeItem(ADMIN_TAB_SESSION_KEY);
      }}
    >
      <input type="hidden" name="adminLang" value={locale} />
      <button className="rounded-card border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary">
        {label}
      </button>
    </form>
  );
}
