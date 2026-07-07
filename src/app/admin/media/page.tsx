import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { listLocalUploads } from "@/lib/storage";
import { deleteMedia } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const files = await listLocalUploads();
  const usingCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

  return (
    <AdminShell email={session.user.email ?? ""}>
      <h1 className="text-2xl font-bold">Media library</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {usingCloudinary
          ? "Cloudinary is configured — new uploads go to Cloudinary. Files below are local leftovers."
          : "Images uploaded through staff, news and partner forms are stored in /public/uploads."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {files.map((f) => (
          <div key={f.name} className="card bg-white p-3">
            <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-card bg-band">
              <Image src={f.url} alt={f.name} fill sizes="200px" className="object-contain p-2" />
            </div>
            <p className="mt-2 truncate text-xs font-medium" title={f.name}>{f.name}</p>
            <p className="text-[11px] text-ink-soft">{(f.size / 1024).toFixed(0)} KB</p>
            <form action={deleteMedia} className="mt-2">
              <input type="hidden" name="name" value={f.name} />
              <button className="w-full rounded-card border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </form>
          </div>
        ))}
        {files.length === 0 && <p className="col-span-full text-ink-soft">No uploaded files yet.</p>}
      </div>
    </AdminShell>
  );
}
