import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { deleteLead, setLeadStatus } from "@/lib/leads";
import { adminHref, adminMessages, getAdminLocale } from "@/i18n/admin";

export const dynamic = "force-dynamic";

type LeadItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  serviceType: string;
  message: string;
  status: string;
  locale: string;
  createdAt: Date;
};

type LeadDelegate = {
  findMany(args: {
    orderBy: { createdAt: "desc" };
    where?: { status: string };
  }): Promise<LeadItem[]>;
  count(args?: { where?: { status?: string } }): Promise<number>;
};

function getLeadDelegate(): LeadDelegate | null {
  return (prisma as typeof prisma & { lead?: LeadDelegate }).lead ?? null;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; lang?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const params = await searchParams;
  const { status } = params;
  const locale = getAdminLocale(params);
  const t = adminMessages[locale];

  const lead = getLeadDelegate();
  let leads: LeadItem[] = [];
  let newCount = 0;
  let setupError = false;

  if (lead) {
    try {
      [leads, newCount] = await Promise.all([
        lead.findMany({
          orderBy: { createdAt: "desc" },
          where: status === "new" || status === "processed" ? { status } : undefined,
        }),
        lead.count({ where: { status: "new" } }),
      ]);
    } catch (error) {
      console.warn("Lead table is not available yet. Run Prisma migrate/generate to enable applications inbox.", error);
      setupError = true;
    }
  } else {
    setupError = true;
  }

  return (
    <AdminShell email={session.user.email ?? ""} locale={locale}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          {t.leads.title}{" "}
          {newCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2.5 py-0.5 text-sm font-bold text-white">{newCount} {t.common.new}</span>
          )}
        </h1>
        <div className="flex gap-2 text-sm">
          {[
            ["", t.common.all],
            ["new", t.common.new],
            ["processed", t.common.processed],
          ].map(([value, label]) => (
            <a
              key={label}
              href={adminHref("/admin/leads", locale, { status: value })}
              className={`rounded-card border px-3 py-1.5 font-medium ${
                (status ?? "") === value ? "border-primary text-primary" : "border-line text-ink-soft hover:text-primary"
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-ink-soft">{t.leads.intro}</p>

      {setupError && (
        <div className="mt-6 rounded-card border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Applications storage is not ready in this running dev server yet. Run <code className="font-mono">npx prisma generate</code>, apply the new migration, and restart <code className="font-mono">next dev</code>.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className={`card bg-white p-5 ${lead.status === "new" ? "border-l-4 border-l-primary" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">
                  {lead.name}
                  {lead.company && <span className="ml-2 font-medium text-ink-soft">· {lead.company}</span>}
                </p>
                <p className="mt-0.5 text-sm">
                  <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="font-semibold text-primary hover:underline">{lead.phone}</a>
                  {lead.email && (
                    <>
                      {" · "}
                      <a href={`mailto:${lead.email}`} className="font-semibold text-primary hover:underline">{lead.email}</a>
                    </>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-band px-2 py-1 text-xs font-bold text-primary">{t.leads.services[lead.serviceType as keyof typeof t.leads.services] ?? lead.serviceType}</span>
                <span className="rounded bg-band px-2 py-1 text-xs font-semibold uppercase text-ink-soft">{lead.locale}</span>
                <span className={`rounded px-2 py-1 text-xs font-bold uppercase ${lead.status === "new" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                  {lead.status === "new" ? t.common.new : t.common.processed}
                </span>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap rounded-card bg-band p-4 text-sm leading-relaxed">{lead.message}</p>
            <div className="mt-3 flex items-center justify-between">
              <time className="text-xs text-ink-soft">{lead.createdAt.toLocaleString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB")}</time>
              <div className="flex gap-2">
                <form action={setLeadStatus}>
                  <input type="hidden" name="id" value={lead.id} />
                  <input type="hidden" name="status" value={lead.status === "new" ? "processed" : "new"} />
                  <button className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">
                    {lead.status === "new" ? t.leads.markProcessed : t.leads.markNew}
                  </button>
                </form>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={lead.id} />
                  <button className="rounded-card border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">{t.common.delete}</button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && <p className="py-8 text-center text-ink-soft">{t.leads.noItems}</p>}
      </div>
    </AdminShell>
  );
}
