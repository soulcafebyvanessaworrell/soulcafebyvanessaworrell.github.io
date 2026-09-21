// Runtime backstop for dictionary parity. `satisfies LocaleDict` catches a
// missing or extra key at compile time; these tests catch what the type system
// cannot see (empty strings, dashes, lost placeholders) and name the offending
// leaf paths on failure. Every registered locale is iterated, so a locale
// added later is covered without touching this file.

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { DEFAULT_LOCALE, LOCALES } from "./locales";
import { dictionaries, type LocaleDict } from "./ui";

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

// Footer.astro splits crisis_note on these placeholders to inject the tel:
// links; a translation that drops or reorders one would silently break that.
describe("crisis_note keeps its helpline placeholders", () => {
  for (const locale of LOCALES) {
    test(`${locale} has {short} then {full}, each once`, () => {
      const note = dictionaries[locale].ui.crisis_note;
      const shortAt = note.indexOf("{short}");
      const fullAt = note.indexOf("{full}");
      expect(shortAt).toBeGreaterThan(-1);
      expect(fullAt).toBeGreaterThan(shortAt);
      expect(note.indexOf("{short}", shortAt + 1)).toBe(-1);
      expect(note.indexOf("{full}", fullAt + 1)).toBe(-1);
    });
  }
});

// The brand voice bans em and en dashes in visible text. Prose is authored in
// many files by many hands, so the check runs over every dictionary and every
// blog post body rather than trusting each author.
const DASHES = /[\u2013\u2014]/;

describe("no em or en dash in any visible string", () => {
  for (const locale of LOCALES) {
    test(`${locale} dictionary`, () => {
      const bad = leaves(prose(locale))
        .filter((leaf) => typeof leaf.value === "string" && DASHES.test(leaf.value))
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
        .filter(({ line }) => DASHES.test(line))
        .map(({ number }) => number);
      expect(lines).toEqual([]);
    });
  }
});

/** Locales whose dictionary is still the English stub. The assertion below runs
 *  under I18N_REQUIRE_TRANSLATED=1, which CI sets; a local run without it skips
 *  the check so a translation can be drafted in steps. */
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
