import { describe, expect, it } from "vitest";
import { fill, formatPrice, hasLocale, switchLocalePath, tx } from "@/lib/i18n";
import { enabledSocialProviders } from "@/lib/social";

describe("i18n helpers", () => {
  it("falls back to Thai when English is missing", () => {
    expect(tx({ th: "สวัสดี" }, "en")).toBe("สวัสดี");
    expect(tx({ th: "สวัสดี", en: "Hello" }, "en")).toBe("Hello");
    expect(tx(null, "th")).toBe("");
  });

  it("switches the locale segment of a path", () => {
    expect(switchLocalePath("/th/apps/landie", "en")).toBe("/en/apps/landie");
    expect(switchLocalePath("/en", "th")).toBe("/th");
    expect(switchLocalePath("/apps", "th")).toBe("/th/apps");
  });

  it("knows the supported locales only", () => {
    expect(hasLocale("th")).toBe(true);
    expect(hasLocale("fr")).toBe(false);
    expect(hasLocale(undefined)).toBe(false);
  });

  it("formats minor-unit prices", () => {
    expect(formatPrice(19900, "THB")).toBe("฿199");
    expect(formatPrice(19950, "THB")).toBe("฿199.50");
  });

  it("fills placeholders", () => {
    expect(fill("เลขที่ {number}", { number: "PC-000001" })).toBe("เลขที่ PC-000001");
  });
});

describe("social providers", () => {
  it("shows only the providers listed in the env", () => {
    expect(enabledSocialProviders("google, LINE").map((p) => p.id)).toEqual(["google", "line"]);
    expect(enabledSocialProviders("")).toEqual([]);
  });
});
