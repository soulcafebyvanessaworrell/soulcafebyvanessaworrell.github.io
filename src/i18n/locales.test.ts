// Invariants of the locale table that nothing else would catch: the table is
// `as const`, so a typo in a code or a duplicated row type-checks fine and only
// shows up as a wrong URL or a missing page at build time.

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DEFAULT_LOCALE,
  LOCALE_TABLE,
  LOCALES,
  localePrefix,
  localizePath,
  type SiteLocale,
} from "./locales";

// Without this, two rows sharing a code would build the same URL twice and the
// later row would silently win in localeMeta().
test("locale codes are unique", () => {
  const codes = LOCALE_TABLE.map((row) => row.code);
  expect(new Set(codes).size).toBe(codes.length);
});

// Without this, nothing pins the convention that a locale code is a bare
// lowercase URL segment: "sd-Arab" or "Hi" would type-check and build a URL
// the docs and the 404 script's case-sensitive prefix match do not expect.
test("every non-default prefix is lowercase letters plus a trailing slash", () => {
  const bad = LOCALES.filter(
    (code) => code !== DEFAULT_LOCALE && !/^[a-z]+\/$/.test(localePrefix(code)),
  );
  expect(bad).toEqual([]);
});

// Without this, an unsupported dateLocale would make Intl fall back to the
// runtime default and every blog date in that language would print in English.
describe("Intl resolves every dateLocale", () => {
  for (const row of LOCALE_TABLE) {
    test(`${row.code} uses ${row.dateLocale}`, () => {
      expect(Intl.DateTimeFormat.supportedLocalesOf(row.dateLocale)).toEqual([row.dateLocale]);
    });
  }
});

// The table row, not ICU, decides which digits pricing.ts renders, and each
// row is meant to be the locale's own default. Without this, a row typed with
// another system would ship those digits unnoticed, and a CLDR update that
// changed a locale's default would leave the table quietly disagreeing with
// what every other Intl consumer on the page (the blog dates) shows.
describe("numberingSystem is what Intl resolves for the dateLocale", () => {
  for (const row of LOCALE_TABLE) {
    test(`${row.code} is ${row.numberingSystem}`, () => {
      const resolved = new Intl.NumberFormat(row.dateLocale).resolvedOptions().numberingSystem;
      expect(resolved).toBe(row.numberingSystem);
    });
  }
});

// Open Graph reads language_TERRITORY with an underscore; a row typed with a
// BCP 47 hyphen, a lowercase territory, or another row's language would pass
// the type and ship a tag crawlers ignore or file under the wrong language.
describe("ogLocale is language_TERRITORY for the row's own language", () => {
  for (const row of LOCALE_TABLE) {
    test(`${row.code} has ${row.ogLocale}`, () => {
      expect(row.ogLocale).toMatch(/^[a-z]{2,3}_[A-Z]{2}$/);
      expect(row.ogLocale.startsWith(`${row.code}_`)).toBe(true);
    });
  }
});

// Without this, a thirtieth locale row would leave README.md and AGENTS.md
// still saying 29. The table carries endonyms only, so the count is all the
// docs and the table share.
test("README.md and AGENTS.md state the locale count the table has", () => {
  const root = join(import.meta.dir, "..", "..");
  for (const [file, noun] of [
    ["README.md", "languages"],
    ["AGENTS.md", "locales"],
  ] as const) {
    const text = readFileSync(join(root, file), "utf8");
    expect(text).toContain(`${LOCALE_TABLE.length} ${noun}`);
  }
});

// The URL helpers read the base path from import.meta.env, which Bun serves
// from process.env; the Astro build inlines "/preview/" or the deploy's base.
describe("URLs under a base path", () => {
  const base = "/site/";
  let saved: string | undefined;
  beforeAll(() => {
    saved = process.env.BASE_URL;
    process.env.BASE_URL = base;
  });
  afterAll(() => {
    if (saved === undefined) delete process.env.BASE_URL;
    else process.env.BASE_URL = saved;
  });

  const prefixed = LOCALES.find((code) => code !== DEFAULT_LOCALE) as SiteLocale;

  // Without this, a rooted "/about/" could be handed to localizePath and the
  // locale-relative convention of AGENTS.md rule 1 would hold only where a
  // reader remembered it. Every call runs at build time, so the throw is what
  // fails the build.
  test("localizePath rejects a leading slash and joins base, prefix, and path", () => {
    expect(localizePath("about/", DEFAULT_LOCALE)).toBe("/site/about/");
    expect(localizePath("about/", prefixed)).toBe(`/site/${prefixed}/about/`);
    expect(localizePath("", prefixed)).toBe(`/site/${prefixed}/`);
    expect(() => localizePath("/about/", DEFAULT_LOCALE)).toThrow(/leading slash/);
    expect(() => localizePath("/", prefixed)).toThrow(/leading slash/);
  });
});
