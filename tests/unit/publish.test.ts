import { describe, it, expect } from "vitest";
import { missingTranslations } from "../../src/lib/publish";

const full = [
  { locale: "uz", name: "Ism", position: "Lavozim" },
  { locale: "ru", name: "Имя", position: "Должность" },
  { locale: "en", name: "Name", position: "Position" },
];

describe("publishing rule", () => {
  it("allows publishing when all three locales are complete", () => {
    expect(missingTranslations(full, ["name", "position"])).toEqual([]);
  });

  it("blocks publishing when a locale is missing entirely", () => {
    const problems = missingTranslations(full.slice(0, 2), ["name", "position"]);
    expect(problems).toContain("en: missing translation");
  });

  it("blocks publishing when a required field is empty", () => {
    const broken = [...full.slice(0, 2), { locale: "en", name: "Name", position: "  " }];
    const problems = missingTranslations(broken, ["name", "position"]);
    expect(problems).toContain("en: position is empty");
  });

  it("reports every missing locale, not just the first", () => {
    const problems = missingTranslations([full[0]], ["name"]);
    expect(problems).toContain("ru: missing translation");
    expect(problems).toContain("en: missing translation");
  });
});
