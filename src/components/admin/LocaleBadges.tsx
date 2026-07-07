import { locales } from "@/i18n/routing";

/** Shows per-locale completeness for an item's translations. */
export default function LocaleBadges({
  translations,
  requiredFields,
}: {
  translations: { locale: string; [k: string]: unknown }[];
  requiredFields: string[];
}) {
  return (
    <span className="inline-flex gap-1">
      {locales.map((l) => {
        const tr = translations.find((t) => t.locale === l);
        const complete =
          tr && requiredFields.every((f) => typeof tr[f] === "string" && (tr[f] as string).trim().length > 0);
        return (
          <span
            key={l}
            title={complete ? `${l}: complete` : `${l}: incomplete`}
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
