import { getTranslations, setRequestLocale } from "next-intl/server";
import { guardPage } from "@/lib/pageSettings";
import { Link } from "@/i18n/navigation";
import Reveal from "@/components/public/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "schemes" });
  return { title: t("title") };
}

export default async function SchemesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await guardPage("schemes");
  const t = await getTranslations("schemes");
  const tn = await getTranslations("nav");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("intro")}</p>
        <p className="mt-3 max-w-3xl leading-relaxed text-ink-soft">{t("p1")}</p>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {([
          ["scheme1Title", "scheme1Text"],
          ["scheme2Title", "scheme2Text"],
          ["scheme3Title", "scheme3Text"],
        ] as const).map(([title, text], i) => (
          <Reveal key={title} delay={i * 80}>
            <div className="card h-full p-6">
              <h2 className="text-lg font-bold">{t(title)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t(text)}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="guilloche mt-10 max-w-4xl rounded-card p-7 text-white">
          <h2 className="text-lg font-bold">{t("noteTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">{t("noteText")}</p>
          <Link href="/contacts" className="mt-4 inline-block rounded-card bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-band">
            {tn("contacts")} →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
