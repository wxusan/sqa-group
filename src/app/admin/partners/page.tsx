import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import LocaleBadges from "@/components/admin/LocaleBadges";
import { deletePartner } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminPartnersList() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const partners = await prisma.partner.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <AdminShell email={session.user.email ?? ""}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Partners</h1>
        <Link href="/admin/partners/new" className="rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-bright">
          + Add partner
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink-soft">Published partner logos appear in the homepage carousel.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => {
          const name = p.translations.find((t) => t.locale === "uz")?.name ?? p.translations[0]?.name ?? "—";
          return (
            <div key={p.id} className="card bg-white p-5">
              <div className="flex h-20 items-center justify-center rounded-card bg-band p-3">
                <Image src={p.logoUrl} alt={name} width={140} height={64} className="max-h-14 w-auto object-contain" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="font-semibold">{name}</span>
                <LocaleBadges translations={p.translations} requiredFields={["name"]} />
              </div>
              <div className="mt-1 text-xs text-ink-soft">
                {p.websiteUrl ?? "No website"} · order {p.order}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${p.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
                <div className="flex gap-2">
                  <Link href={`/admin/partners/${p.id}`} className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">Edit</Link>
                  <form action={deletePartner}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="rounded-card border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
        {partners.length === 0 && <p className="text-ink-soft">No partners yet. Add the first one.</p>}
      </div>
    </AdminShell>
  );
}
