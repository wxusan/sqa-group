import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Reveal from "@/components/public/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacts" });
  return { title: t("title") };
}

export default async function ContactsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contacts");

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14">
      <Reveal>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{t("intro")}</p>
      </Reveal>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <Reveal>
            <div className="card p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{t("addressTitle")}</h2>
              <p className="mt-2 font-medium leading-relaxed">{t("address")}</p>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="card p-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{t("phoneTitle")}</h2>
                <a href="tel:+998951958040" className="mt-2 block text-lg font-bold text-primary hover:underline">
                  +998 95 195 80 40
                </a>
              </div>
              <div className="card p-6">
                <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{t("emailTitle")}</h2>
                <a href="mailto:info@sqa.uz" className="mt-2 block text-lg font-bold text-primary hover:underline">
                  info@sqa.uz
                </a>
                <a href="mailto:director@sqa.uz" className="mt-1 block text-sm font-medium text-ink-soft hover:text-primary">
                  director@sqa.uz · {t("directorEmailLabel")}
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="card p-6">
              <h2 className="text-sm font-bold uppercase tracking-wide text-ink-soft">{t("hoursTitle")}</h2>
              <p className="mt-2 font-medium">{t("hours")}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <a
            href="https://maps.google.com/?q=Tashkent+Chilanzar+Kamolon+Zarkand+street+11"
            target="_blank"
            rel="noopener noreferrer"
            className="card block overflow-hidden"
          >
            <Image src="/images/office/office.jpg" alt={t("addressTitle")} width={640} height={480} className="h-full max-h-[420px] w-full object-cover transition-transform duration-300 hover:scale-[1.02]" />
          </a>
        </Reveal>
      </div>
    </div>
  );
}
