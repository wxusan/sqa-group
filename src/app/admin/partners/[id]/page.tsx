import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import PartnerForm from "@/components/admin/PartnerForm";

export const dynamic = "force-dynamic";

export default async function AdminPartnerEdit({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;

  const isNew = id === "new";
  const partner = isNew ? null : await prisma.partner.findUnique({ where: { id }, include: { translations: true } });
  if (!isNew && !partner) notFound();

  return (
    <AdminShell email={session.user.email ?? ""}>
      <h1 className="text-2xl font-bold">{isNew ? "New partner" : "Edit partner"}</h1>
      <p className="mt-1 text-sm text-ink-soft">Name in all three languages is required to publish.</p>
      <div className="mt-6">
        <PartnerForm partner={partner ?? undefined} />
      </div>
    </AdminShell>
  );
}
