import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdminLocale } from "@/i18n/admin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = getAdminLocale(await searchParams);
  return <AdminLoginForm locale={locale} />;
}
