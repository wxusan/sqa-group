import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import StaffForm from "@/components/admin/StaffForm";
import { adminMessages, getAdminLocale } from "@/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminStaffEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  const locale = getAdminLocale(await searchParams);
  const t = adminMessages[locale];

  const isNew = id === "new";
  const staff = isNew
    ? null
    : await prisma.staff.findUnique({ where: { id }, include: { translations: true } });
  if (!isNew && !staff) notFound();

  return (
    <AdminShell email={session.user.email ?? ""} locale={locale}>
      <h1 className="text-2xl font-bold">{isNew ? t.staff.newTitle : t.staff.editTitle}</h1>
      <p className="mt-1 text-sm text-ink-soft">{t.staff.editIntro}</p>
      <div className="mt-6">
        <StaffForm staff={staff ?? undefined} locale={locale} />
      </div>
    </AdminShell>
  );
}
