import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import LocaleBadges from "@/components/admin/LocaleBadges";
import { deleteNews } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminNewsList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { q } = await searchParams;

  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    include: { translations: true },
    where: q
      ? { translations: { some: { title: { contains: q, mode: "insensitive" } } } }
      : undefined,
  });

  return (
    <AdminShell email={session.user.email ?? ""}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">News</h1>
        <Link href="/admin/news/new" className="rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-bright">
          + Add article
        </Link>
      </div>

      <form className="mt-4">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by title..."
          className="w-full max-w-xs rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </form>

      <div className="card mt-4 overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Translations</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map((n) => {
              const title = n.translations.find((t) => t.locale === "uz")?.title ?? n.translations[0]?.title ?? n.slug;
              return (
                <tr key={n.id} className="border-b border-line last:border-0">
                  <td className="max-w-sm px-4 py-3 font-semibold">{title}</td>
                  <td className="px-4 py-3">
                    <LocaleBadges translations={n.translations} requiredFields={["title", "body"]} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${n.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {n.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {n.publishedAt ? new Date(n.publishedAt).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/uz/news/${n.slug}`} target="_blank" className="text-xs font-semibold text-ink-soft hover:text-primary">Preview</a>
                      <Link href={`/admin/news/${n.id}`} className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">Edit</Link>
                      <form action={deleteNews}>
                        <input type="hidden" name="id" value={n.id} />
                        <button className="rounded-card border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {news.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">No articles yet. Write the first one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
