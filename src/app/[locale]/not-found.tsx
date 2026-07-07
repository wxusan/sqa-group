import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("common");
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-28 text-center">
      <p className="text-7xl font-black text-primary/20">404</p>
      <h1 className="mt-4 text-2xl font-bold">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-ink-soft">{t("notFoundText")}</p>
      <Link href="/" className="mt-6 rounded-card bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright">
        {t("goHome")}
      </Link>
    </div>
  );
}
