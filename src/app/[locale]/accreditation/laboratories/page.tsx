import { getTranslations, setRequestLocale } from "next-intl/server";
import { guardPage } from "@/lib/pageSettings";
import Reveal from "@/components/public/Reveal";
import { CertificateCard } from "@/components/public/DocDownload";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accreditation" });
  return { title: t("labTitle") };
}

export default async function AccredLabPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await guardPage("accreditation-laboratories");
  const t = await getTranslations("accreditation");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <p className="eyebrow mb-2">
          O&apos;ZAKK.SL.0162 · O&apos;ZAKK.SL.0437 · O&apos;z DSt ISO/IEC 17025:2019
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("labTitle")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("labIntro")}</p>
      </Reveal>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="leading-relaxed text-ink-soft">{t("labText")}</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <section className="card border-l-4 border-l-primary p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">O&apos;ZAKK.SL.0162</p>
              <h2 className="mt-2 text-base font-bold text-ink">{t("labOneTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("labOneText")}</p>
              <p className="mt-4 text-xs text-ink-soft">{t("validUntil")}: 10.01.2027</p>
            </section>
            <section className="card border-l-4 border-l-primary p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">O&apos;ZAKK.SL.0437</p>
              <h2 className="mt-2 text-base font-bold text-ink">{t("labTwoTitle")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{t("labTwoText")}</p>
              <p className="mt-4 text-xs text-ink-soft">{t("validUntil")}: 11.05.2031</p>
            </section>
          </div>
          <div className="card mt-6 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide">{t("verifyTitle")}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t("verifyText")}</p>
            <a href="https://akkred.uz" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              akkred.uz →
            </a>
          </div>
        </Reveal>
        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            <CertificateCard
              img="/images/certificates/testing-laboratory-2025.jpeg"
              caption="O'ZAKK.SL.0162"
              href="/documents/sqa-laboratory-certificate.pdf"
              downloadLabel={t("downloadCert")}
            />
            <CertificateCard
              img="/images/certificates/s-lab-2026.jpeg"
              caption="O'ZAKK.SL.0437"
              href="/documents/sqa-s-lab-certificate.pdf"
              downloadLabel={t("downloadCert")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
