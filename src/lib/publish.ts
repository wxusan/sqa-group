import { locales } from "@/i18n/routing";

type Translation = Record<string, unknown> & { locale?: unknown };

/**
 * Publishing rule: an item may only be published when uz, ru and en
 * translations exist and every required field is non-empty.
 * Returns the list of missing locale/field pairs (empty = OK to publish).
 */
export function missingTranslations(
  translations: Translation[],
  requiredFields: string[]
): string[] {
  const problems: string[] = [];
  for (const locale of locales) {
    const t = translations.find((tr) => tr.locale === locale);
    if (!t) {
      problems.push(`${locale}: missing translation`);
      continue;
    }
    for (const field of requiredFields) {
      const v = t[field];
      if (typeof v !== "string" || v.trim().length === 0) {
        problems.push(`${locale}: ${field} is empty`);
      }
    }
  }
  return problems;
}
