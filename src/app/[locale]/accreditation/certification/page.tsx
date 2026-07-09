import Image from "next/image";
import { guardPage } from "@/lib/pageSettings";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/public/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accreditation" });
  return { title: t("certTitle") };
}

export default async function AccredCertPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await guardPage("accreditation-certification");
  const t = await getTranslations("accreditation");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <p className="eyebrow mb-2">O&apos;ZAKK.MS.0052 · O&apos;z DSt ISO/IEC 17065:2015</p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("certTitle")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("certIntro")}</p>
      </Reveal>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="leading-relaxed text-ink-soft">{t("certText")}</p>
          <div className="card mt-6 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide">{t("verifyTitle")}</h2>
            <p className="mt-2 text-sm text-ink-soft">{t("verifyText")}</p>
            <a href="https://akkred.uz" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
              akkred.uz →
            </a>
            <p className="mt-4 text-xs text-ink-soft">{t("validUntil")}: 11.01.2027</p>
          </div>
          <a
            href="/documents/sqa-certification-body-certificate.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-card bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
          >
            {t("downloadCert")}
          </a>
        </Reveal>
        <Reveal delay={100}>
          <a href="/documents/sqa-certification-body-certificate.pdf" target="_blank" rel="noopener noreferrer" className="card card-hover block overflow-hidden">
            <figure>
              <Image src="/images/certificates/certification-body-2025.jpeg" alt="O'ZAKK.MS.0052" width={500} height={690} className="w-full object-contain" />
            </figure>
          </a>
        </Reveal>
      </div>
    </div>
  );
}
