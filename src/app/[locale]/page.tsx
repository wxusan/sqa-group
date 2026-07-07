import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import AccreditationRibbon from "@/components/public/AccreditationRibbon";
import PartnerMarquee from "@/components/public/PartnerMarquee";
import SectionHeading from "@/components/public/SectionHeading";
import StaffCard from "@/components/public/StaffCard";
import NewsCard from "@/components/public/NewsCard";
import Reveal from "@/components/public/Reveal";

export const revalidate = 120;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tt = await getTranslations("team");
  const tc = await getTranslations("common");

  const [staff, news, partners] = await Promise.all([
    prisma.staff.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 4,
      include: { translations: { where: { locale } } },
    }),
    prisma.news.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { translations: { where: { locale } } },
    }),
    prisma.partner.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      include: { translations: { where: { locale } } },
    }),
  ]);

  const deptLabel = (d: string) =>
    d === "laboratory" ? tt("deptLaboratory") : d === "management" ? tt("deptManagement") : tt("deptCertification");

  const dateFmt = new Intl.DateTimeFormat(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* HERO — thesis + logo */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, #2003bd 0%, transparent 70%)" }}
        />
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <p className="eyebrow mb-3">{t("heroEyebrow")}</p>
            <h1 className="text-3xl font-black leading-[1.12] tracking-tight text-ink sm:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">{t("heroText")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/certification-body"
                className="rounded-card bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
              >
                {t("heroCtaCert")}
              </Link>
              <Link
                href="/laboratories"
                className="rounded-card border border-line bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
              >
                {t("heroCtaLab")}
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120} className="hidden justify-center lg:flex">
            <Image
              src="/images/logo/logo-black.jpg"
              alt="SQA Group"
              width={300}
              height={300}
              priority
              className="rounded-card"
            />
          </Reveal>
        </div>
      </section>

      {/* SIGNATURE: accreditation ribbon */}
      <AccreditationRibbon />

      {/* SERVICES: certification body + two laboratories */}
      <section className="mx-auto max-w-[1200px] px-4 py-16">
        <Reveal>
          <SectionHeading eyebrow={t("servicesSubtitle")} title={t("servicesTitle")} />
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { href: "/certification-body", title: t("certBodyCardTitle"), text: t("certBodyCardText"), badge: "ISO/IEC 17065" },
            { href: "/laboratories", title: t("lab1CardTitle"), text: t("lab1CardText"), badge: "ISO/IEC 17025" },
            { href: "/laboratories", title: t("lab2CardTitle"), text: t("lab2CardText"), badge: "SQA Group" },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <Link href={c.href} className="card card-hover group block h-full p-6">
                <span className="inline-block rounded-[6px] bg-band px-2.5 py-1 text-[11px] font-bold tracking-wide text-primary">
                  {c.badge}
                </span>
                <h3 className="mt-4 text-lg font-bold text-ink group-hover:text-primary">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.text}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary">{tc("readMore")} →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CERTIFICATES: 3 accreditation visuals */}
      <section className="bg-band">
        <div className="mx-auto max-w-[1200px] px-4 py-16">
          <Reveal>
            <SectionHeading eyebrow={t("certificatesSubtitle")} title={t("certificatesTitle")} />
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { src: "/images/certificates/certification-body.jpeg", caption: "O'ZAK.MS.0052" },
              { src: "/images/certificates/testing-laboratory.jpeg", caption: "O'ZAK.SL.0162" },
              { src: "/images/logo/logo-black.jpg", caption: "SQA Group" },
            ].map((c, i) => (
              <Reveal key={c.caption} delay={i * 80}>
                <figure className="card overflow-hidden">
                  <div className="relative aspect-[3/4] bg-white">
                    <Image src={c.src} alt={c.caption} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain p-3" />
                  </div>
                  <figcaption className="border-t border-line px-4 py-2.5 text-center text-xs font-bold tracking-wide text-ink-soft">
                    {c.caption}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM PREVIEW */}
      {staff.length > 0 && (
        <section className="mx-auto max-w-[1200px] px-4 py-16">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow={t("teamSubtitle")} title={t("teamTitle")} />
              <Link href="/team" className="text-sm font-semibold text-primary hover:underline">
                {tc("viewAll")} →
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {staff.map((s, i) => {
              const tr = s.translations[0];
              if (!tr) return null;
              return (
                <Reveal key={s.id} delay={i * 70}>
                  <StaffCard
                    slug={s.slug}
                    name={tr.name}
                    position={tr.position}
                    photoUrl={s.photoUrl}
                    department={deptLabel(s.department)}
                  />
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* LATEST NEWS */}
      {news.length > 0 && (
        <section className="bg-band">
          <div className="mx-auto max-w-[1200px] px-4 py-16">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionHeading eyebrow={t("newsSubtitle")} title={t("newsTitle")} />
                <Link href="/news" className="text-sm font-semibold text-primary hover:underline">
                  {tc("viewAll")} →
                </Link>
              </div>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {news.map((n, i) => {
                const tr = n.translations[0];
                if (!tr) return null;
                return (
                  <Reveal key={n.id} delay={i * 80}>
                    <NewsCard
                      slug={n.slug}
                      title={tr.title}
                      summary={tr.summary}
                      imageUrl={n.imageUrl}
                      date={n.publishedAt ? dateFmt.format(n.publishedAt) : ""}
                      readMoreLabel={tc("readMore")}
                    />
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SPLIT: financing / schemes */}
      <section className="mx-auto grid max-w-[1200px] gap-5 px-4 py-16 md:grid-cols-2">
        {[
          { href: "/financing", title: t("financingTitle"), text: t("financingTeaser") },
          { href: "/schemes", title: t("schemesTitle"), text: t("schemesTeaser") },
        ].map((c, i) => (
          <Reveal key={c.href} delay={i * 80}>
            <Link href={c.href} className="card card-hover group block h-full border-l-4 border-l-primary p-7">
              <h3 className="text-lg font-bold text-ink group-hover:text-primary">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.text}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary">{tc("readMore")} →</span>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* SPLIT: accreditation scopes */}
      <section className="mx-auto grid max-w-[1200px] gap-5 px-4 pb-16 md:grid-cols-2">
        {[
          { href: "/accreditation/certification", title: t("accredCertTitle"), text: t("accredCertTeaser") },
          { href: "/accreditation/laboratories", title: t("accredLabTitle"), text: t("accredLabTeaser") },
        ].map((c, i) => (
          <Reveal key={c.href} delay={i * 80}>
            <Link href={c.href} className="card card-hover group block h-full border-l-4 border-l-primary-deep p-7">
              <h3 className="text-lg font-bold text-ink group-hover:text-primary">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.text}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-primary">{tc("readMore")} →</span>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* PARTNERS: dual-direction carousel */}
      {partners.length > 0 && (
        <section className="border-t border-line">
          <div className="mx-auto max-w-[1200px] px-4 py-16">
            <Reveal>
              <div className="text-center">
                <p className="eyebrow mb-2">{t("partnersSubtitle")}</p>
                <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{t("partnersTitle")}</h2>
              </div>
            </Reveal>
            <div className="mt-10">
              <PartnerMarquee
                partners={partners
                  .map((p) => ({
                    id: p.id,
                    name: p.translations[0]?.name ?? "",
                    logoUrl: p.logoUrl,
                    websiteUrl: p.websiteUrl,
                  }))
                  .filter((p) => p.name)}
              />
            </div>
          </div>
        </section>
      )}

      {/* APPLY: submit certification application via official government portals */}
      <section className="bg-primary">
        <div className="mx-auto max-w-[1200px] px-4 py-16">
          <Reveal>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t("applyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">{t("applyText")}</p>
            </div>
          </Reveal>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="https://singlewindow.uz/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-band"
            >
              {t("applySingleWindow")} ↗
            </a>
            <a
              href="https://tris.uz/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t("applyTris")} ↗
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
