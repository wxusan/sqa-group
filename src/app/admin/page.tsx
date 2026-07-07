import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const [staffTotal, staffPublished, newsTotal, newsPublished, partnersTotal, partnersPublished] =
    await Promise.all([
      prisma.staff.count(),
      prisma.staff.count({ where: { published: true } }),
      prisma.news.count(),
      prisma.news.count({ where: { status: "published" } }),
      prisma.partner.count(),
      prisma.partner.count({ where: { published: true } }),
    ]);

  const cards = [
    { href: "/admin/staff", label: "Staff", total: staffTotal, published: staffPublished },
    { href: "/admin/news", label: "News", total: newsTotal, published: newsPublished },
    { href: "/admin/partners", label: "Partners", total: partnersTotal, published: partnersPublished },
  ];

  return (
    <AdminShell email={session.user.email ?? ""}>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Items publish only when Uzbek, Russian and English translations are complete.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card card-hover bg-white p-6">
            <p className="text-sm font-semibold text-ink-soft">{c.label}</p>
            <p className="mt-2 text-3xl font-black text-ink">{c.total}</p>
            <p className="mt-1 text-xs text-ink-soft">
              <span className="font-semibold text-green-700">{c.published} published</span>
              {" · "}
              {c.total - c.published} draft
            </p>
          </Link>
        ))}
      </div>
      <div className="card mt-6 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/admin/staff/new" className="rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-bright">+ Staff member</Link>
          <Link href="/admin/news/new" className="rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-bright">+ News article</Link>
          <Link href="/admin/partners/new" className="rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-bright">+ Partner</Link>
        </div>
      </div>
    </AdminShell>
  );
}
