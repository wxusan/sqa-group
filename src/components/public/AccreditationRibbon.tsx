import { useTranslations } from "next-intl";

/**
 * Signature element: certificate-edge strip with a guilloche pattern
 * (the security-paper language of SQA's own accreditation certificates),
 * carrying the real O'ZAK registry data.
 */
export default function AccreditationRibbon() {
  const t = useTranslations("home");

  const items = [
    {
      label: t("ribbonCertBody"),
      number: "O'ZAK.MS.0052",
      standard: "O'z DSt ISO/IEC 17065:2015",
      valid: "11.01.2027",
    },
    {
      label: t("ribbonLab"),
      number: "O'ZAK.SL.0162",
      standard: "O'z DSt ISO/IEC 17025:2019",
      valid: "10.01.2027",
    },
  ];

  return (
    <section aria-label="Accreditation" className="guilloche text-white">
      <div className="mx-auto grid max-w-[1200px] gap-x-8 gap-y-4 px-4 py-5 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.number} className="flex items-center gap-4">
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true" className="shrink-0">
              <circle cx="17" cy="17" r="16" stroke="currentColor" strokeOpacity="0.5" />
              <circle cx="17" cy="17" r="12" stroke="currentColor" strokeOpacity="0.8" strokeDasharray="2 3" />
              <path d="M11.5 17.5l3.5 3.5 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">{item.label}</p>
              <p className="text-sm font-bold sm:truncate">
                {item.number}
                <span className="mx-2 text-white/40">·</span>
                <span className="font-medium text-white/85">{item.standard}</span>
              </p>
              <p className="text-[11px] text-white/60">
                {t("ribbonValid")}: {item.valid}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
