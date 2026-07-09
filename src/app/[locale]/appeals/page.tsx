import { getTranslations, setRequestLocale } from "next-intl/server";
import { guardPage } from "@/lib/pageSettings";
import Reveal from "@/components/public/Reveal";
import ComplaintForm from "@/components/public/ComplaintForm";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "appeals" });
  return { title: t("title") };
}

export default async function AppealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await guardPage("appeals");
  const t = await getTranslations("appeals");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("intro")}</p>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <section>
            <h2 className="text-xl font-bold">{t("processTitle")}</h2>
            <div className="article-body mt-4">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
            </div>
            <div className="card mt-6 border-l-4 border-l-primary p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide">{t("sendTitle")}</h3>
              <p className="mt-2 text-sm text-ink-soft">{t("sendText")}</p>
              <a href="mailto:info@sqa.uz" className="mt-2 inline-block font-semibold text-primary hover:underline">
                info@sqa.uz
              </a>
            </div>
          </section>
        </Reveal>

        <Reveal delay={90}>
          <section className="card p-6 sm:p-7">
            <h2 className="text-xl font-bold">{t("formTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("formIntro")}</p>
            <div className="mt-5">
              <ComplaintForm />
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
