import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";
import NewsForm from "@/components/admin/NewsForm";

export const dynamic = "force-dynamic";

export default async function AdminNewsEdit({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;

  const isNew = id === "new";
  const news = isNew ? null : await prisma.news.findUnique({ where: { id }, include: { translations: true } });
  if (!isNew && !news) notFound();

  return (
    <AdminShell email={session.user.email ?? ""}>
      <h1 className="text-2xl font-bold">{isNew ? "New article" : "Edit article"}</h1>
      <p className="mt-1 text-sm text-ink-soft">Fill title and body in all three languages to publish.</p>
      <div className="mt-6">
        <NewsForm news={news ?? undefined} />
      </div>
    </AdminShell>
  );
}
