import { describe, it, expect } from "vitest";
import { slugify } from "../../src/lib/slug";

describe("slugify", () => {
  it("handles Uzbek apostrophe letters", () => {
    expect(slugify("Saidg'ani G'ulomov")).toBe("saidgani-gulomov");
  });
  it("handles plain names", () => {
    expect(slugify("Valiev Xojiakbar")).toBe("valiev-xojiakbar");
  });
  it("strips punctuation and collapses dashes", () => {
    expect(slugify("Yangi   sayt — ishga tushdi!")).toBe("yangi-sayt-ishga-tushdi");
  });
});
