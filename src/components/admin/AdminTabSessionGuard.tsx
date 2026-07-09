"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import type { AdminLocale } from "@/i18n/admin";

export const ADMIN_TAB_SESSION_KEY = "sqa-admin-tab-session";

export default function AdminTabSessionGuard({ locale }: { locale: AdminLocale }) {
  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_TAB_SESSION_KEY) === "active") return;

    void signOut({
      callbackUrl: `/admin/login?lang=${locale}`,
      redirect: true,
    });
  }, [locale]);

  return null;
}
