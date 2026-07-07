import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import StaffForm from "@/components/admin/StaffForm";

export const dynamic = "force-dynamic";

export default async function AdminStaffEdit({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;

  const isNew = id === "new";
  const staff = isNew
    ? null
    : await prisma.staff.findUnique({ where: { id }, include: { translations: true } });
  if (!isNew && !staff) notFound();

  return (
    <AdminShell email={session.user.email ?? ""}>
      <h1 className="text-2xl font-bold">{isNew ? "New staff member" : "Edit staff member"}</h1>
      <p className="mt-1 text-sm text-ink-soft">Fill all three languages to publish.</p>
      <div className="mt-6">
        <StaffForm staff={staff ?? undefined} />
      </div>
    </AdminShell>
  );
}
