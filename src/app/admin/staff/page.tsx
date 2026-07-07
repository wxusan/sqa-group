import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import LocaleBadges from "@/components/admin/LocaleBadges";
import { deleteStaff } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminStaffList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { q } = await searchParams;

  const staff = await prisma.staff.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
    where: q
      ? { translations: { some: { name: { contains: q, mode: "insensitive" } } } }
      : undefined,
  });

  return (
    <AdminShell email={session.user.email ?? ""}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Staff</h1>
        <Link href="/admin/staff/new" className="rounded-card bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-bright">
          + Add staff member
        </Link>
      </div>

      <form className="mt-4">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name..."
          className="w-full max-w-xs rounded-card border border-line bg-white px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </form>

      <div className="card mt-4 overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Translations</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => {
              const name = s.translations.find((t) => t.locale === "uz")?.name ?? s.translations[0]?.name ?? s.slug;
              return (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {s.photoUrl ? (
                        <Image src={s.photoUrl} alt="" width={36} height={36} className="h-9 w-9 rounded-card object-cover object-top" />
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-card bg-band text-sm font-bold text-primary">{name.charAt(0)}</span>
                      )}
                      <span className="font-semibold">{name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-soft">{s.department}</td>
                  <td className="px-4 py-3">
                    <LocaleBadges translations={s.translations} requiredFields={["name", "position"]} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${s.published ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{s.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/uz/team/${s.slug}`} target="_blank" className="text-xs font-semibold text-ink-soft hover:text-primary">Preview</a>
                      <Link href={`/admin/staff/${s.id}`} className="rounded-card border border-line px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">Edit</Link>
                      <form action={deleteStaff}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="rounded-card border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {staff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-soft">No staff members yet. Add the first one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
