import { locales } from "@/i18n/routing";
import { adminMessages, type AdminLocale } from "@/i18n/admin";

/** Shows per-locale completeness for an item's translations. */
export default function LocaleBadges({
  translations,
  requiredFields,
  locale,
}: {
  translations: { locale: string; [k: string]: unknown }[];
  requiredFields: string[];
  locale: AdminLocale;
}) {
  const t = adminMessages[locale];

  return (
    <span className="inline-flex gap-1">
      {locales.map((l) => {
        const tr = translations.find((t) => t.locale === l);
        const complete =
          tr && requiredFields.every((f) => typeof tr[f] === "string" && (tr[f] as string).trim().length > 0);
        return (
          <span
            key={l}
            title={complete ? `${l}: ${t.common.complete}` : `${l}: ${t.common.incomplete}`}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
              complete ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {l}
          </span>
        );
      })}
    </span>
  );
}
