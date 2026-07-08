import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import { PAGES } from "@/lib/pages";
import { setPageEnabled } from "@/lib/actions";

export const dynamic = "force-dynamic";

const GROUPS = [
  { id: "main", title: "Main menu" },
  { id: "more", title: "Accreditation dropdown" },
] as const;

export default async function AdminPagesList() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const rows = await prisma.pageSetting.findMany();
  const disabled = new Set(rows.filter((r) => !r.enabled).map((r) => r.key));

  return (
    <AdminShell email={session.user.email ?? ""}>
      <h1 className="text-2xl font-bold">Pages</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-soft">
        Turn any public page on or off at any time. A page that is <strong>off</strong> disappears from the
        site menu and returns a 404 to visitors. Turning it back on restores it instantly.
      </p>

      {GROUPS.map((g) => (
        <section key={g.id} className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">{g.title}</h2>
          <div className="mt-2 divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
            {PAGES.filter((p) => p.group === g.id).map((p) => {
              const enabled = !disabled.has(p.key);
              return (
                <div key={p.key} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <div className="font-semibold">{p.label}</div>
                    <div className="truncate text-xs text-ink-soft">{p.href}</div>
                  </div>
                  <form action={setPageEnabled}>
                    <input type="hidden" name="key" value={p.key} />
                    <input type="hidden" name="enabled" value={enabled ? "false" : "true"} />
                    <button
                      type="submit"
                      title={enabled ? "Click to turn OFF" : "Click to turn ON"}
                      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                        enabled
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${enabled ? "bg-green-600" : "bg-red-500"}`} />
                      {enabled ? "On" : "Off"}
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </AdminShell>
  );
}
