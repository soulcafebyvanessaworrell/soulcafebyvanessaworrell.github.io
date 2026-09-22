// A translation that adds a character the subset fonts lack would render it in
// a fallback face, or as a missing-glyph box where the device has none, and no
// build step would say so: the subsets in src/assets/fonts carry only what the
// site's text used when scripts/subset-fonts.mts last ran. These tests read
// that run's coverage.json against every text source each face renders today,
// and pin the files to sizes a regression to the full fonts would break.
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  COVERAGE_FILE,
  type Coverage,
  codePointsOf,
  expandUnicodeRange,
  FACES,
  FONTS_DIR,
  inRanges,
  parseUnicodeRange,
  renderCss,
  SUBSETS_CSS,
  type TextKind,
  type TextSource,
  textSources,
} from "../../scripts/subset-fonts.mts";
import { LOCALE_TABLE } from "../i18n/locales";

const REMEDY =
  "run `bun scripts/subset-fonts.mts` (python3 fontTools + brotli) and commit src/assets/fonts";

const coverage = JSON.parse(readFileSync(COVERAGE_FILE, "utf8")) as Coverage;
const fontsCss = readFileSync(join(FONTS_DIR, "../../styles/fonts.css"), "utf8");
const BLOG_DIR = join(FONTS_DIR, "../../content/blog");

/* About 1.5 times the size each file had when the ceiling was set, so the
   full fontsource file (Nastaliq 159 KB, Naskh 53 KB) fails. The
   Latin ceilings sit at 11,000 rather than 1.5 times because the full
   fontsource Latin 400 files (11,876 and 11,500 bytes) must fail too. */
const CEILING_BYTES: Record<string, number> = {
  "noto-nastaliq-urdu/arabic": 145_000,
  "noto-nastaliq-urdu/latin": 11_000,
  "noto-naskh-arabic/arabic": 24_000,
  "noto-naskh-arabic/latin": 11_000,
};

const hex = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;

describe("every character the site renders in a subset face is in its files", () => {
  for (const face of FACES) {
    test(face.id, () => {
      const recorded = coverage.faces[face.id];
      if (!recorded) throw new Error(`coverage.json has no entry for ${face.id}: ${REMEDY}`);
      const parts = Object.values(recorded.parts);
      const claimed = parts.map((part) => parseUnicodeRange(part.unicodeRange));
      const covered = new Set<number>();
      for (const part of parts) for (const cp of expandUnicodeRange(part.covered)) covered.add(cp);
      const absent = expandUnicodeRange(recorded.absentInSource);

      const always = {
        kind: "always",
        where: "always-included set",
        text: String.fromCodePoint(...expandUnicodeRange(face.always)),
      } as const;
      const texts = textSources(face);
      const sources: (TextSource | typeof always)[] = [always, ...texts];
      const missing: string[] = [];
      for (const source of sources)
        for (const cp of codePointsOf(source.text)) {
          if (!claimed.some((ranges) => inRanges(ranges, cp))) continue;
          if (!covered.has(cp) && !absent.has(cp))
            missing.push(
              `${"locale" in source ? source.locale : "site"} ${source.where}: ${hex(cp)} ${String.fromCodePoint(cp)}`,
            );
        }
      if (missing.length > 0)
        throw new Error(`${face.id} lacks glyphs for:\n  ${missing.join("\n  ")}\n${REMEDY}`);

      // The census is shared with the generator, so an emptied walk would pass
      // both silently: a face that serves locales must have read the component
      // literals, each served locale's dictionary, Intl output, and blog posts
      // where the locale has any, and each label locale's endonym.
      const posts = readdirSync(BLOG_DIR);
      const kindsOf = (locale?: string) =>
        new Set(texts.filter((source) => source.locale === locale).map((source) => source.kind));
      if (face.textScripts.length > 0) expect([...kindsOf(undefined)]).toEqual(["component"]);
      for (const row of LOCALE_TABLE) {
        const expected: TextKind[] = [];
        if (face.labelScripts.includes(row.script)) expected.push("label");
        if (face.textScripts.includes(row.script)) {
          expected.push("Intl", "i18n");
          if (posts.some((name) => name.endsWith(`-${row.code}.md`))) expected.push("content");
        }
        const kinds = kindsOf(row.code);
        const unread = expected.filter((kind) => !kinds.has(kind));
        expect({ locale: row.code, unread }).toEqual({ locale: row.code, unread: [] });
      }
    });
  }
});

describe("the subset files exist and stay small", () => {
  for (const [id, face] of Object.entries(coverage.faces)) {
    test(id, () => {
      const rows = Object.entries(face.parts).flatMap(([subset, part]) =>
        Object.values(part.files).map((file) => ({
          file,
          bytes: statSync(join(FONTS_DIR, file)).size,
          ceiling: CEILING_BYTES[`${id}/${subset}`] ?? 0,
        })),
      );
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.filter((row) => row.bytes > row.ceiling)).toEqual([]);
    });
  }
});

// fonts.css is hand-written and subsets.css generated; a fontsource import
// re-added for a subset face would declare the same family twice and the
// browser would take the full file again, with every test above still green.
// A borrowed face's package stays imported for the text it serves in full.
test("fonts.css takes the subset faces from subsets.css and from nowhere else", () => {
  expect(fontsCss).toContain('@import "../assets/fonts/subsets.css";');
  const reimported = FACES.filter((face) => !face.borrow && fontsCss.includes(`"${face.pkg}/`));
  expect(reimported.map((face) => face.pkg)).toEqual([]);
  expect(readFileSync(SUBSETS_CSS, "utf8")).toBe(renderCss(coverage));
});
