import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { PAGES } from "@/lib/pages";
import { setPageEnabled } from "@/lib/actions";
import { adminMessages, getAdminLocale } from "@/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminPages({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const locale = getAdminLocale(await searchParams);
  const t = adminMessages[locale];
  const publicNav = await getTranslations({ locale, namespace: "nav" });

  const rows = await prisma.pageSetting.findMany();
  const disabled = new Set(rows.filter((row) => !row.enabled).map((row) => row.key));

  return (
    <AdminShell email={session.user.email ?? ""} locale={locale}>
      <h1 className="text-2xl font-bold">{t.pages.title}</h1>
      <p className="mt-1 max-w-3xl text-sm text-ink-soft">{t.pages.intro}</p>

      <div className="mt-6 grid gap-3">
        {PAGES.map((page) => {
          const enabled = !disabled.has(page.key);
          return (
            <article key={page.key} className="card flex flex-wrap items-center justify-between gap-4 bg-white p-5">
              <div>
                <h2 className="font-bold">{publicNav(page.navKey)}</h2>
                <p className="mt-1 text-xs font-medium text-ink-soft">{page.href}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${enabled ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {enabled ? t.pages.enabled : t.pages.disabled}
                </span>
                <form action={setPageEnabled}>
                  <input type="hidden" name="adminLang" value={locale} />
                  <input type="hidden" name="key" value={page.key} />
                  <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
                  <button className={`rounded-card px-4 py-2 text-sm font-semibold transition-colors ${
                    enabled
                      ? "border border-red-200 text-red-600 hover:bg-red-50"
                      : "bg-primary text-white hover:bg-primary-bright"
                  }`}>
                    {enabled ? t.pages.hide : t.pages.show}
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </AdminShell>
  );
}
