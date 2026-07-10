import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import MediaDeleteForm from "@/components/admin/MediaDeleteForm";
import { getMediaProvider, listMedia } from "@/lib/storage";
import { adminMessages, getAdminLocale } from "@/i18n/admin";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const locale = getAdminLocale(await searchParams);
  const t = adminMessages[locale];

  const provider = getMediaProvider();
  const files = await listMedia();

  return (
    <AdminShell email={session.user.email ?? ""} locale={locale}>
      <h1 className="text-2xl font-bold">{t.media.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {provider === "blob" ? t.media.blob : t.media.local}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {files.map((f) => (
          <div key={f.url} className="card bg-white p-3">
            <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-card bg-band">
              <Image src={f.url} alt={f.name} fill sizes="200px" className="object-contain p-2" />
            </div>
            <p className="mt-2 truncate text-xs font-medium" title={f.name}>{f.name}</p>
            <p className="text-[11px] text-ink-soft">{(f.size / 1024).toFixed(0)} KB</p>
            <MediaDeleteForm locale={locale} url={f.url} />
          </div>
        ))}
        {files.length === 0 && <p className="col-span-full text-ink-soft">{t.media.noItems}</p>}
      </div>
    </AdminShell>
  );
}
