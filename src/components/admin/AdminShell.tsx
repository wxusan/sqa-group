import Image from "next/image";
import Link from "next/link";
import { logoutAction } from "@/lib/actions";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/news", label: "News" },
  { href: "/admin/partners", label: "Partners" },
  { href: "/admin/media", label: "Media" },
];

export default function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <Image src="/images/logo/logo-black.jpg" alt="" width={30} height={30} className="rounded-[5px]" />
              <span className="text-sm font-bold">SQA Admin</span>
            </Link>
            <nav className="flex gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-[6px] px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:bg-band hover:text-primary"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <a href="/uz" target="_blank" className="text-xs font-medium text-ink-soft hover:text-primary">
              View site ↗
            </a>
            <span className="hidden text-xs text-ink-soft sm:block">{email}</span>
            <form action={logoutAction}>
              <button className="rounded-card border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-primary hover:text-primary">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1100px] px-4 py-8">{children}</main>
    </div>
  );
}
