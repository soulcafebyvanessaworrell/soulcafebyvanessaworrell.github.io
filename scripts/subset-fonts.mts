// Regenerates the subset web fonts in src/assets/fonts. Run it after a
// translation, a blog post, a locale row, or a component literal changes,
// then commit what it wrote:
//
//   bun scripts/subset-fonts.mts
//
// Needs python3 with the fontTools and brotli modules. For each face in FACES
// it gathers every code point the site can render in that face (dictionary
// leaves, blog posts, picker endonyms, Intl-formatted prices and dates, the
// literal characters in the components), cuts the fontsource files down to
// those glyphs with every layout feature intact (Nastaliq and Naskh shape
// through GSUB/GPOS; Devanagari conjuncts too), and writes: the woff2 files,
// subsets.css (the @font-face rules fonts.css imports), coverage.json (what
// each file contains, for fonts.test.ts), and each face's licence. The run is
// idempotent and removes files it no longer produces.
//
// The fontsource packages stay installed as the source of every subset; only
// their CSS imports leave fonts.css.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { LOCALE_TABLE, type LocaleMeta, type Script, type SiteLocale } from "../src/i18n/locales";
import { dictionaries } from "../src/i18n/ui";
import {
  CONSULTATION_MINUTES,
  CURRENCIES,
  DISCOUNT_AGES,
  formatNumber,
  formatPrice,
  hoursAndMinutes,
  OFFERS,
  PACKAGE_FREE_SESSIONS,
  PACKAGE_PAID_SESSIONS,
  PRICING,
} from "../src/lib/pricing";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const FONTS_DIR = join(ROOT, "src/assets/fonts");
export const COVERAGE_FILE = join(FONTS_DIR, "coverage.json");
export const SUBSETS_CSS = join(FONTS_DIR, "subsets.css");
const SRC_DIR = join(ROOT, "src");
const BLOG_DIR = join(SRC_DIR, "content/blog");
const NODE_MODULES = join(ROOT, "node_modules");

export interface Face {
  /** Output file stem and licence name. */
  readonly id: string;
  /** CSS family. Kept as fontsource names it so the stacks in styles.css need no change. */
  readonly family: string;
  readonly pkg: string;
  readonly weights: readonly number[];
  /** Locales whose dictionaries and posts render in the face: every table row with one of these scripts. */
  readonly textScripts: readonly Script[];
  /** Scripts whose picker endonyms may render in this face on its own pages (the picker uses the body stack). */
  readonly labelScripts: readonly Script[];
  /** Included whenever the source font has them, on top of the text census. */
  readonly always: string;
  /** Drop TrueType instructions. Only Windows reads them, and only at text sizes. */
  readonly noHinting?: boolean;
  /** A new family cut from one part of a package the site keeps importing in
   *  full for other text: exactly these code points, declared as the
   *  unicode-range, and the package's own import stays in fonts.css. */
  readonly borrow?: { readonly subset: string; readonly unicodeRange: string };
}

/* Printable ASCII, no-break space, the typographic quotes and ellipsis, the
   rupee sign, and the joiners and direction marks. The Arabic faces render the
   spaces and punctuation between their words (see the stack comment in
   styles.css), so the whole ASCII block rides along rather than only the
   characters a translation happens to use today. */
const COMMON = "U+0020-007E,U+00A0,U+2018-2019,U+201C-201D,U+2026,U+20B9,U+200C-200F";
/* Intl formats prices and dates with Arabic-Indic (sd) or Extended
   Arabic-Indic (ur, ks) digits and separators; a translator may also type the
   Arabic comma, semicolon, question mark, and the Urdu full stop. */
const ARABIC_EXTRAS = "U+060C,U+061B,U+061F,U+0660-066C,U+06D4,U+06F0-06F9";
/* Intl formats mr and ne with Devanagari digits; the dandas end Hindi lines. */
const DEVANAGARI_EXTRAS = "U+0964-096F";

export const FACES: readonly Face[] = [
  {
    id: "noto-nastaliq-urdu",
    family: "Noto Nastaliq Urdu",
    pkg: "@fontsource/noto-nastaliq-urdu",
    weights: [400, 700],
    textScripts: ["nastaliq"],
    labelScripts: ["nastaliq", "naskh"],
    always: `${COMMON},${ARABIC_EXTRAS}`,
  },
  {
    // Naskh follows Nastaliq in both Urdu stacks, so it also carries the Urdu
    // text: a letter Nastaliq lacks falls to Naskh, as it did with the full fonts.
    id: "noto-naskh-arabic",
    family: "Noto Naskh Arabic",
    pkg: "@fontsource/noto-naskh-arabic",
    weights: [400, 700],
    textScripts: ["naskh", "nastaliq"],
    labelScripts: ["nastaliq", "naskh"],
    always: `${COMMON},${ARABIC_EXTRAS}`,
  },
  {
    // The Devanagari display face. Only 700 ships: .script, .pill, and every
    // font-script element set font-weight 700, so a browser never asks for 400.
    // Its conjunct ligatures keep nearly every glyph reachable, so the bytes
    // that go are the hinting instructions, three fifths of the file, which
    // no heading size needs.
    id: "kalam",
    family: "Kalam",
    pkg: "@fontsource/kalam",
    weights: [700],
    textScripts: ["devanagari"],
    labelScripts: [],
    always: `${COMMON},${DEVANAGARI_EXTRAS}`,
    noHinting: true,
  },
  {
    // One glyph borrowed from Noto Sans Devanagari; styles.css says why.
    id: "rupee-sign",
    family: "Rupee Sign",
    pkg: "@fontsource/noto-sans-devanagari",
    weights: [400, 700],
    textScripts: [],
    labelScripts: [],
    always: "U+20B9",
    borrow: { subset: "devanagari", unicodeRange: "U+20B9" },
  },
];

export type Ranges = readonly (readonly [number, number])[];

/** "U+0600-06FF,U+200C" as inclusive [lo, hi] pairs. */
export function parseUnicodeRange(range: string): Ranges {
  if (range === "") return [];
  return range.split(",").map((item) => {
    const match = /^U\+([0-9A-F]+)(?:-([0-9A-F]+))?$/i.exec(item.trim());
    if (!match?.[1]) throw new Error(`bad unicode-range item: ${JSON.stringify(item)}`);
    const lo = Number.parseInt(match[1], 16);
    return [lo, match[2] ? Number.parseInt(match[2], 16) : lo];
  });
}

export function inRanges(ranges: Ranges, codePoint: number): boolean {
  return ranges.some(([lo, hi]) => codePoint >= lo && codePoint <= hi);
}

/** Every code point a unicode-range string names. */
export function expandUnicodeRange(range: string): Set<number> {
  const out = new Set<number>();
  for (const [lo, hi] of parseUnicodeRange(range)) for (let cp = lo; cp <= hi; cp++) out.add(cp);
  return out;
}

/** Sorted code points as a unicode-range string with runs collapsed. */
export function formatUnicodeRange(codePoints: Iterable<number>): string {
  const sorted = [...new Set(codePoints)].sort((a, b) => a - b);
  const items: string[] = [];
  const hex = (n: number) => n.toString(16).toUpperCase().padStart(4, "0");
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === (sorted[j] as number) + 1) j++;
    const lo = sorted[i] as number;
    const hi = sorted[j] as number;
    items.push(lo === hi ? `U+${hex(lo)}` : `U+${hex(lo)}-${hex(hi)}`);
    i = j + 1;
  }
  return items.join(",");
}

/** The code points of a text that a font can be asked to draw: controls (newlines, tabs) never reach a glyph. */
export function codePointsOf(text: string): Set<number> {
  const out = new Set<number>();
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp >= 0x20) out.add(cp);
  }
  return out;
}

export type TextKind = "component" | "label" | "i18n" | "content" | "Intl";

export interface TextSource {
  readonly kind: TextKind;
  /** Unset for text every locale shares (component literals). */
  readonly locale?: SiteLocale;
  /** Where the text lives, for the failure message. */
  readonly where: string;
  readonly text: string;
}

function stringLeaves(node: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof node === "string") out.push({ path, text: node });
  else if (typeof node === "object" && node !== null)
    for (const [key, value] of Object.entries(node)) stringLeaves(value, `${path}.${key}`, out);
}

/* The same Intl calls the pages make: prices, durations, and the other counts
   pricing.ts quotes on packages/, book/, and the home page, the long date on
   blog/ and blog/[slug], the month and year on privacy/. A leap year covers
   every month name and day number. */
function intlText(row: LocaleMeta): string {
  const { dateLocale } = row;
  const parts: string[] = [];
  for (const offer of OFFERS)
    for (const currency of CURRENCIES)
      parts.push(formatPrice(offer.price[currency], currency, row));
  const counts = [
    CONSULTATION_MINUTES,
    PACKAGE_PAID_SESSIONS,
    PACKAGE_FREE_SESSIONS,
    DISCOUNT_AGES.youth.from,
    DISCOUNT_AGES.youth.to,
    DISCOUNT_AGES.senior,
  ];
  for (const { minutes } of Object.values(PRICING)) {
    const split = hoursAndMinutes(minutes);
    counts.push(minutes, split.hours, split.minutes);
  }
  for (const n of counts) parts.push(formatNumber(n, row));
  const day = new Intl.DateTimeFormat(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const month = new Intl.DateTimeFormat(dateLocale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  for (let offset = 0; offset < 366; offset++) {
    const date = new Date(Date.UTC(2024, 0, 1 + offset));
    parts.push(day.format(date), month.format(date));
  }
  return parts.join(" ");
}

/* Page files hold no prose, but they do hold glyphs: the middle dot between a
   label and a phone number, a CSS content string. Whatever non-ASCII character
   a component carries renders in the page's own face on every locale.
   Comments are dropped first so an arrow in a design note stays out. */
function componentText(): string {
  const code = readdirSync(SRC_DIR, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".astro") || name === "styles.css")
    .map((name) => readFileSync(join(SRC_DIR, name), "utf8"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  return [...code].filter((ch) => (ch.codePointAt(0) as number) > 0x7f).join("");
}

/** Every piece of text the face can be asked to render. */
export function textSources(face: Face): TextSource[] {
  const sources: TextSource[] = [];
  if (face.textScripts.length > 0)
    sources.push({
      kind: "component",
      where: "src/**/*.astro and styles.css",
      text: componentText(),
    });
  const posts = readdirSync(BLOG_DIR);
  for (const row of LOCALE_TABLE) {
    const locale = row.code as SiteLocale;
    if (face.labelScripts.includes(row.script))
      sources.push({ kind: "label", locale, where: "locales.ts label", text: row.label });
    if (!face.textScripts.includes(row.script)) continue;
    const { translation: _status, ...prose } = dictionaries[locale];
    const leaves: { path: string; text: string }[] = [];
    stringLeaves(prose, locale, leaves);
    for (const leaf of leaves)
      sources.push({ kind: "i18n", locale, where: `i18n/${leaf.path}`, text: leaf.text });
    for (const file of posts.filter((name) => name.endsWith(`-${locale}.md`)))
      sources.push({
        kind: "content",
        locale,
        where: `content/blog/${file}`,
        text: readFileSync(join(BLOG_DIR, file), "utf8"),
      });
    sources.push({
      kind: "Intl",
      locale,
      where: `Intl ${row.dateLocale}`,
      text: intlText(row),
    });
  }
  return sources;
}

export interface PartCoverage {
  readonly unicodeRange: string;
  /** Weight to file name inside src/assets/fonts; empty when no text needs this part. */
  readonly files: Record<string, string>;
  /** Code points every weight's file carries. */
  readonly covered: string;
}

export interface FaceCoverage {
  readonly family: string;
  /** Requested code points no fontsource file of the face has; they fall through to the next face as before. */
  readonly absentInSource: string;
  /** Every fontsource part, in declaration order, which the cascade among overlapping ranges depends on. */
  readonly parts: Record<string, PartCoverage>;
}

export interface Coverage {
  readonly faces: Record<string, FaceCoverage>;
}

/** The @font-face rules for every subset file. */
export function renderCss(coverage: Coverage): string {
  const rules: string[] = [];
  for (const face of Object.values(coverage.faces))
    for (const part of Object.values(face.parts))
      for (const [weight, file] of Object.entries(part.files))
        rules.push(
          [
            "@font-face {",
            `  font-family: "${face.family}";`,
            "  font-style: normal;",
            `  font-weight: ${weight};`,
            "  font-display: swap;",
            `  src: url("./${file}") format("woff2");`,
            `  unicode-range: ${part.unicodeRange};`,
            "}",
          ].join("\n"),
        );
  return `/* Generated by scripts/subset-fonts.mts. Do not edit: run it instead. */\n\n${rules.join("\n\n")}\n`;
}

interface Part {
  readonly subset: string;
  readonly unicodeRange: string;
}

/** The subset parts fontsource ships for one weight, from its CSS, in declaration order. */
function fontsourceParts(face: Face, weight: number): Part[] {
  const css = readFileSync(join(NODE_MODULES, face.pkg, `${weight}.css`), "utf8");
  const name = face.pkg.split("/")[1] as string;
  const parts: Part[] = [];
  for (const block of css.matchAll(/\/\* (\S+) \*\/\s*@font-face\s*\{([^}]*)\}/g)) {
    const stem = block[1] as string;
    const subset = stem.slice(name.length + 1, -`-${weight}-normal`.length);
    const range = /unicode-range:\s*([^;]+);/.exec(block[2] as string)?.[1];
    if (!range) throw new Error(`${face.pkg}/${weight}.css: no unicode-range for ${stem}`);
    parts.push({ subset, unicodeRange: range.trim() });
  }
  if (parts.length === 0) throw new Error(`${face.pkg}/${weight}.css: no @font-face blocks`);
  return parts;
}

function sourcePath(face: Face, part: Part, weight: number): string {
  const name = face.pkg.split("/")[1] as string;
  return join(NODE_MODULES, face.pkg, "files", `${name}-${part.subset}-${weight}-normal.woff2`);
}

function run(cmd: string[]): string {
  const proc = Bun.spawnSync({ cmd, stdout: "pipe", stderr: "pipe" });
  if (proc.exitCode !== 0)
    throw new Error(`${cmd.slice(0, 3).join(" ")} failed:\n${proc.stderr.toString()}`);
  return proc.stdout.toString();
}

function subset(face: Face, source: string, out: string, codePoints: Iterable<number>): void {
  run([
    "python3",
    "-m",
    "fontTools.subset",
    source,
    `--output-file=${out}`,
    "--flavor=woff2",
    `--unicodes=${formatUnicodeRange(codePoints)}`,
    "--layout-features=*",
    "--name-IDs=*",
    "--notdef-outline",
    ...(face.noHinting ? ["--no-hinting"] : []),
  ]);
}

const PY_CMAP =
  "import sys, json\nfrom fontTools.ttLib import TTFont\nprint(json.dumps(sorted(TTFont(sys.argv[1]).getBestCmap() or {})))";

function cmapOf(file: string): Set<number> {
  return new Set(JSON.parse(run(["python3", "-c", PY_CMAP, file])) as number[]);
}

function intersection(sets: readonly Set<number>[]): Set<number> {
  const [first, ...rest] = sets;
  if (!first) return new Set();
  return new Set([...first].filter((cp) => rest.every((set) => set.has(cp))));
}

function requestedCodePoints(face: Face): Set<number> {
  const requested = expandUnicodeRange(face.always);
  for (const source of textSources(face))
    for (const cp of codePointsOf(source.text)) requested.add(cp);
  if (face.borrow) {
    const kept = parseUnicodeRange(face.borrow.unicodeRange);
    for (const cp of requested) if (!inRanges(kept, cp)) requested.delete(cp);
  }
  return requested;
}

function main(): void {
  mkdirSync(FONTS_DIR, { recursive: true });
  const produced = new Set<string>();
  const coverage: { faces: Record<string, FaceCoverage> } = { faces: {} };

  for (const face of FACES) {
    let parts = fontsourceParts(face, face.weights[0] as number);
    for (const weight of face.weights.slice(1))
      if (JSON.stringify(fontsourceParts(face, weight)) !== JSON.stringify(parts))
        throw new Error(`${face.pkg}: the subsets differ between weights`);
    if (face.borrow) {
      const part = parts.find((candidate) => candidate.subset === face.borrow?.subset);
      if (!part) throw new Error(`${face.pkg} has no ${face.borrow.subset} subset`);
      parts = [{ subset: part.subset, unicodeRange: face.borrow.unicodeRange }];
    }

    // Each code point goes to the part the browser consults first for it: the
    // last declared @font-face whose unicode-range matches, then earlier ones
    // when that file lacks the glyph.
    const consulted = parts.map((part) => ({
      part,
      ranges: parseUnicodeRange(part.unicodeRange),
      available: intersection(face.weights.map((weight) => cmapOf(sourcePath(face, part, weight)))),
      wanted: new Set<number>(),
    }));
    const absent: number[] = [];
    for (const cp of requestedCodePoints(face)) {
      const target = [...consulted]
        .reverse()
        .find((candidate) => inRanges(candidate.ranges, cp) && candidate.available.has(cp));
      if (target) target.wanted.add(cp);
      else if (consulted.some((candidate) => inRanges(candidate.ranges, cp))) absent.push(cp);
    }

    const partCoverage: Record<string, PartCoverage> = {};
    for (const { part, wanted } of consulted) {
      const files: Record<string, string> = {};
      for (const weight of face.weights) {
        if (wanted.size === 0) break;
        const file = face.borrow
          ? `${face.id}-${weight}.woff2`
          : `${face.id}-${weight}-${part.subset}.woff2`;
        subset(face, sourcePath(face, part, weight), join(FONTS_DIR, file), wanted);
        const written = cmapOf(join(FONTS_DIR, file));
        const lost = [...wanted].filter((cp) => !written.has(cp));
        if (lost.length > 0)
          throw new Error(`${file} lacks ${formatUnicodeRange(lost)} after subsetting`);
        produced.add(file);
        files[String(weight)] = file;
      }
      partCoverage[part.subset] = {
        unicodeRange: part.unicodeRange,
        files,
        covered: formatUnicodeRange(wanted),
      };
      const sizes = Object.values(files)
        .map((file) => `${file} ${readFileSync(join(FONTS_DIR, file)).byteLength} B`)
        .join(", ");
      console.log(
        `${face.id}/${part.subset}: ${wanted.size} code points${sizes ? ` (${sizes})` : ""}`,
      );
    }
    if (absent.length > 0)
      console.log(
        `${face.id}: not in the source font, left to the next face: ${formatUnicodeRange(absent)}`,
      );
    coverage.faces[face.id] = {
      family: face.family,
      absentInSource: formatUnicodeRange(absent),
      parts: partCoverage,
    };

    const licence = `${face.id}-LICENSE.txt`;
    writeFileSync(join(FONTS_DIR, licence), readFileSync(join(NODE_MODULES, face.pkg, "LICENSE")));
    produced.add(licence);
  }

  writeFileSync(SUBSETS_CSS, renderCss(coverage));
  writeFileSync(COVERAGE_FILE, `${JSON.stringify(coverage, null, 2)}\n`);
  run(["bunx", "biome", "format", "--write", COVERAGE_FILE]);
  produced.add("subsets.css").add("coverage.json");

  for (const name of readdirSync(FONTS_DIR))
    if (!produced.has(name)) {
      rmSync(join(FONTS_DIR, name));
      console.log(`removed stale ${name}`);
    }
}

if (import.meta.main) main();
