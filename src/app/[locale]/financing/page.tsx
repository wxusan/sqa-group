import { getTranslations, setRequestLocale } from "next-intl/server";
import { guardPage } from "@/lib/pageSettings";
import Reveal from "@/components/public/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "financing" });
  return { title: t("title") };
}

export default async function FinancingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await guardPage("financing");
  const t = await getTranslations("financing");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("intro")}</p>
      </Reveal>
      <div className="mt-10 grid max-w-4xl gap-5">
        {(["p1", "p2", "p3"] as const).map((k, i) => (
          <Reveal key={k} delay={i * 70}>
            <div className="card border-l-4 border-l-primary p-6">
              <p className="leading-relaxed text-ink-soft">{t(k)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
