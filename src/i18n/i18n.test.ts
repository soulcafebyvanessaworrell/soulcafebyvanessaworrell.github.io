// Runtime backstop for dictionary parity. `satisfies LocaleDict` catches a
// missing or extra key at compile time; these tests catch what the type system
// cannot see (empty strings, dashes, lost placeholders) and name the offending
// leaf paths on failure. Every registered locale is iterated, so a locale
// added later is covered without touching this file.

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import {
  CONSULTATION_MINUTES,
  DEFAULT_CURRENCY,
  formatNumberParts,
  formatPrice,
  joinDigits,
  PRICING,
} from "../lib/pricing";
import { BRAND_NAMES, DEFAULT_LOCALE, LOCALES, localeMeta } from "./locales";
import { dictionaries, fill, type LocaleDict, PLACEHOLDER } from "./ui";

interface Leaf {
  path: string;
  value: unknown;
}

/** Every leaf of a nested dictionary as "a.b.0.c" paths, sorted. */
function leaves(node: unknown, prefix = ""): Leaf[] {
  if (typeof node !== "object" || node === null) return [{ path: prefix, value: node }];
  return Object.entries(node)
    .flatMap(([key, value]) => leaves(value, prefix ? `${prefix}.${key}` : key))
    .sort((a, b) => a.path.localeCompare(b.path));
}

/** The translatable part of a dictionary: everything but the status block. */
function prose(locale: (typeof LOCALES)[number]): Omit<LocaleDict, "translation"> {
  const { translation: _status, ...rest } = dictionaries[locale];
  return rest;
}

const referencePaths = leaves(prose(DEFAULT_LOCALE)).map((leaf) => leaf.path);

// Typecheck already rejects a wrong shape; this names the offending leaf paths
// in the test output, so a translator sees which key drifted without reading
// tsc's error against a 300-line object type.
describe("every locale has exactly the English leaf set", () => {
  for (const locale of LOCALES) {
    test(`${locale} matches '${DEFAULT_LOCALE}'`, () => {
      const paths = leaves(prose(locale)).map((leaf) => leaf.path);
      const missing = referencePaths.filter((p) => !paths.includes(p));
      const extra = paths.filter((p) => !referencePaths.includes(p));
      expect({ locale, missing, extra }).toEqual({ locale, missing: [], extra: [] });
    });
  }
});

// Without this, an empty string would type-check as a valid translation and
// ship a blank heading or button.
describe("every leaf is a non-empty string", () => {
  for (const locale of LOCALES) {
    test(`${locale} has no empty or non-string leaves`, () => {
      const bad = leaves(prose(locale))
        .filter((leaf) => typeof leaf.value !== "string" || leaf.value.trim() === "")
        .map((leaf) => leaf.path);
      expect(bad).toEqual([]);
    });
  }
});

/** How often each `{name}` token occurs in a string. */
function placeholderCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const [token] of text.matchAll(PLACEHOLDER)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

// The pages splice numbers, dates, and helpline links into `{name}` tokens
// (fill() in ui.ts, Footer.astro's crisis_note split). A translation that
// dropped a token would ship without its price or date, one that typed the
// number by hand would drift from pricing.ts, and one that invented a token
// would print it literally. Same tokens, same count, in every leaf.
describe("every leaf carries exactly the English placeholders", () => {
  const reference = new Map(
    leaves(prose(DEFAULT_LOCALE)).map((leaf) => [leaf.path, placeholderCounts(String(leaf.value))]),
  );
  for (const locale of LOCALES) {
    test(`${locale} placeholders match '${DEFAULT_LOCALE}' leaf by leaf`, () => {
      const drift = leaves(prose(locale))
        .filter((leaf) => {
          const expected = reference.get(leaf.path) ?? new Map<string, number>();
          const actual = placeholderCounts(String(leaf.value));
          const tokens = new Set([...expected.keys(), ...actual.keys()]);
          return [...tokens].some(
            (token) => (expected.get(token) ?? 0) !== (actual.get(token) ?? 0),
          );
        })
        .map((leaf) => leaf.path);
      expect(drift).toEqual([]);
    });
  }
});

// Footer.astro splits crisis_note on {short} then {full} to inject the tel:
// links in that order; the parity test above pins their presence, this pins
// the order a translation might swap.
describe("crisis_note keeps {short} before {full}", () => {
  for (const locale of LOCALES) {
    test(`${locale}`, () => {
      const note = dictionaries[locale].ui.crisis_note;
      expect(note.indexOf("{short}")).toBeLessThan(note.indexOf("{full}"));
    });
  }
});

// The brand names are never translated by meaning: a leaf carries the English
// string or the same-sound transliteration the locale table records for that
// locale, and nothing else. Without this, a translator could render "The Soul
// Cafe" as the local words for soul and cafe and the site would name a
// different business in that language.
describe("brand names stay English or take the recorded transliteration", () => {
  const enLeaves = leaves(prose(DEFAULT_LOCALE));
  for (const brand of BRAND_NAMES) {
    const paths = enLeaves.filter((leaf) => String(leaf.value).includes(brand)).map((l) => l.path);
    test(`'${brand}' appears in at least one English leaf`, () => {
      expect(paths.length).toBeGreaterThan(0);
    });
    for (const locale of LOCALES) {
      test(`${locale} keeps '${brand}' in ${paths.length} leaves`, () => {
        const accepted = [brand, localeMeta(locale).brand?.[brand]].filter(
          (name): name is string => name !== undefined,
        );
        const byPath = new Map(
          leaves(prose(locale)).map((leaf) => [leaf.path, String(leaf.value)]),
        );
        const drift = paths.filter(
          (path) => !accepted.some((name) => (byPath.get(path) ?? "").includes(name)),
        );
        expect(drift).toEqual([]);
      });
    }
  }

  // A recorded transliteration nothing uses is a stale row: the dictionary was
  // reworded to English and the table still claims the spelling.
  for (const locale of LOCALES) {
    const recorded = Object.entries(localeMeta(locale).brand ?? {});
    for (const [brand, spelling] of recorded) {
      test(`${locale} uses its recorded spelling of '${brand}'`, () => {
        const used = leaves(prose(locale)).some((leaf) => String(leaf.value).includes(spelling));
        expect(used).toBe(true);
      });
    }
  }
});

// The brand voice bans em and en dashes in visible text, and writes an
// ellipsis as three full stops, never the U+2026 character, so every locale
// trails off the same way. Prose is authored in many files by many hands, so
// the check runs over every dictionary and every blog post body rather than
// trusting each author.
const BANNED_PUNCTUATION = /[\u2013\u2014\u2026]/;

describe("no em dash, en dash, or ellipsis character in any visible string", () => {
  for (const locale of LOCALES) {
    test(`${locale} dictionary`, () => {
      const bad = leaves(prose(locale))
        .filter((leaf) => typeof leaf.value === "string" && BANNED_PUNCTUATION.test(leaf.value))
        .map((leaf) => leaf.path);
      expect(bad).toEqual([]);
    });
  }

  // Same file rule as the content loader's glob: any depth, `.md`, and no
  // leading underscore (`_template.md` is never a post).
  const blogDir = join(import.meta.dir, "..", "content", "blog");
  const posts = readdirSync(blogDir, { recursive: true, encoding: "utf8" }).filter(
    (name) => name.endsWith(".md") && !basename(name).startsWith("_"),
  );
  test("at least one blog post is checked", () => {
    expect(posts.length).toBeGreaterThan(0);
  });
  for (const file of posts) {
    test(`blog post ${file}`, () => {
      const text = readFileSync(join(blogDir, file), "utf8");
      const lines = text
        .split("\n")
        .map((line, index) => ({ line, number: index + 1 }))
        .filter(({ line }) => BANNED_PUNCTUATION.test(line))
        .map(({ number }) => number);
      expect(lines).toEqual([]);
    });
  }
});

// Without this, a meta description would drift past the point where search
// engines truncate it, and a result snippet would end mid-sentence. The cap is
// on the rendered string: book.astro and packages.astro fill `{minutes}` and
// `{price}` the same way before the text reaches the head, and a locale whose
// digits are not Western repeats each number in brackets, so the filled text is
// longer than the template. The blog index's description is measured with the
// pages' since it reaches a head the same way.
const META_DESCRIPTION_MAX = 155;

describe("every rendered meta description fits a search snippet", () => {
  for (const locale of LOCALES) {
    test(`${locale} descriptions are at most ${META_DESCRIPTION_MAX} characters`, () => {
      const meta = localeMeta(locale);
      const values = {
        minutes: joinDigits(formatNumberParts(CONSULTATION_MINUTES, meta)),
        price: formatPrice(PRICING.individual.single[DEFAULT_CURRENCY], DEFAULT_CURRENCY, meta),
      };
      const { pages, blog } = dictionaries[locale];
      const descriptions: [string, string][] = [
        ...Object.entries(pages).map(([page, copy]): [string, string] => [
          page,
          copy.meta.description,
        ]),
        ["blog", blog.metaDescription],
      ];
      const long = descriptions
        .map(([page, text]) => ({ page, length: [...fill(text, values)].length }))
        .filter(({ length }) => length > META_DESCRIPTION_MAX);
      expect(long).toEqual([]);
    });
  }
});

/** Locales whose dictionary is still the English stub. The assertion below runs
 *  under I18N_REQUIRE_TRANSLATED=1, which CI and the pre-commit hook set; a bare
 *  `bun test` without it skips the check so a translation can be drafted in
 *  steps. */
export function stubLocales(): string[] {
  return LOCALES.filter((locale) => dictionaries[locale].translation.source === "stub");
}

// Without this, a forgotten stub would ship English under a non-English URL
// with a matching hreflang, which is worse than no page.
describe("no stub dictionary remains", () => {
  const enabled = process.env.I18N_REQUIRE_TRANSLATED === "1";
  test.if(enabled)("every locale has a real translation", () => {
    expect(stubLocales()).toEqual([]);
  });
});
