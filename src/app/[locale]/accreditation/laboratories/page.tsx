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
        <p className="eyebrow mb-2">O&apos;ZAKK.SL.0162 · O&apos;z DSt ISO/IEC 17025:2019</p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("labTitle")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("labIntro")}</p>
      </Reveal>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="leading-relaxed text-ink-soft">{t("labText")}</p>
          <div className="card mt-6 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide">{t("verifyTitle")}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t("verifyText")}</p>
            <a href="https://akkred.uz" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              akkred.uz →
            </a>
            <p className="mt-4 text-xs text-ink-soft">{t("validUntil")}: 10.01.2027</p>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="grid gap-5 sm:grid-cols-2">
            <CertificateCard
              img="/images/certificates/testing-laboratory.jpeg"
              caption="O'ZAKK.SL.0162"
              href="/documents/sqa-laboratory-certificate.pdf"
              downloadLabel={t("downloadCert")}
            />
            <CertificateCard
              img="/images/certificates/s-lab-certificate.jpeg"
              caption="O'ZAKK.SL.0437"
              href="/documents/sqa-s-lab-certificate.pdf"
              downloadLabel={t("downloadCert")}
            />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
