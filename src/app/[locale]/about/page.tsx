import Image from "next/image";
import { guardPage } from "@/lib/pageSettings";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/public/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await guardPage("about");
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("intro")}</p>
      </Reveal>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="article-body max-w-3xl">
          {(["p1", "p2", "p3", "p4", "p5"] as const).map((k) => (
            <p key={k}>{t(k)}</p>
          ))}
        </Reveal>
        <Reveal delay={100}>
          <div className="card p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">{t("factsTitle")}</h2>
            <dl className="mt-4 space-y-4">
              {([
                ["fact1Label", "fact1Value"],
                ["fact2Label", "fact2Value"],
                ["fact3Label", "fact3Value"],
              ] as const).map(([l, v]) => (
                <div key={l} className="border-l-2 border-primary pl-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t(l)}</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink">{t(v)}</dd>
                </div>
              ))}
            </dl>
            <Image src="/images/office/office.jpg" alt="" width={400} height={260} className="mt-6 w-full rounded-card border border-line object-cover" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
