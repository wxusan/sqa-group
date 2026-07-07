import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/public/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "certificationBody" });
  return { title: t("title") };
}

export default async function CertificationBodyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("certificationBody");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <p className="eyebrow mb-2">O&#39;ZAK.MS.0052 · O&#39;z DSt ISO/IEC 17065:2015</p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("intro")}</p>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <Reveal>
            <section className="card p-7">
              <h2 className="text-xl font-bold">{t("scopeTitle")}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{t("scopeText")}</p>
            </section>
          </Reveal>
          <Reveal>
            <section className="card border-l-4 border-l-primary p-7">
              <h2 className="text-xl font-bold">{t("impartialityTitle")}</h2>
              <p className="mt-3 leading-relaxed text-ink-soft">{t("impartialityText")}</p>
            </section>
          </Reveal>
          <Reveal>
            <section>
              <h2 className="text-xl font-bold">{t("processTitle")}</h2>
              <ol className="mt-5 space-y-3">
                {(["step1", "step2", "step3", "step4", "step5"] as const).map((k, i) => (
                  <li key={k} className="flex items-start gap-4 rounded-card border border-line bg-white p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-1 text-sm font-medium text-ink">{t(k)}</span>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>
        </div>
        <Reveal delay={100}>
          <figure className="card sticky top-24 overflow-hidden">
            <Image src="/images/certificates/certification-body.jpeg" alt="O'ZAK.MS.0052" width={500} height={690} className="w-full object-contain" />
          </figure>
        </Reveal>
      </div>
    </div>
  );
}
