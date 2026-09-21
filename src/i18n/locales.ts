// The locale table is the single source of truth for every language the site
// ships in. Everything else (URL prefixes, <html lang dir>, the language
// picker, the sitemap, the fonts a page needs) derives from a row here, so
// adding a language is one row plus one dictionary file. No locale code is
// written as a literal anywhere in src/ outside this table.

export type Script =
  | "latin"
  | "devanagari"
  | "bengali"
  | "telugu"
  | "tamil"
  | "gujarati"
  | "nastaliq"
  | "naskh"
  | "kannada"
  | "oriya"
  | "malayalam"
  | "gurmukhi"
  | "olchiki"
  | "cyrillic";

export type Region = "india" | "europe";

export interface LocaleMeta {
  /** URL segment and dictionary key. */
  readonly code: string;
  /** <html lang> and hreflang value (may carry a script subtag). */
  readonly htmlLang: string;
  /** Endonym, deliberately untranslated so every reader recognizes their own
   *  language whatever language the page is in. */
  readonly label: string;
  /** Writing direction, set on <html dir>. */
  readonly dir: "ltr" | "rtl";
  /** BCP 47 tag handed to Intl.DateTimeFormat for blog dates; locales.test.ts
   *  checks the runtime's ICU resolves it. */
  readonly dateLocale: string;
  /** Selects the font stack and type rules (the [data-script] blocks in styles.css). */
  readonly script: Script;
  /** Which heading the language picker lists it under. */
  readonly region: Region;
}

export const LOCALE_TABLE = [
  {
    code: "en",
    htmlLang: "en",
    label: "English",
    dir: "ltr",
    dateLocale: "en-GB",
    script: "latin",
    region: "india",
  },
  {
    code: "hi",
    htmlLang: "hi",
    label: "हिन्दी",
    dir: "ltr",
    dateLocale: "hi-IN",
    script: "devanagari",
    region: "india",
  },
  {
    code: "bn",
    htmlLang: "bn",
    label: "বাংলা",
    dir: "ltr",
    dateLocale: "bn-IN",
    script: "bengali",
    region: "india",
  },
  {
    code: "mr",
    htmlLang: "mr",
    label: "मराठी",
    dir: "ltr",
    dateLocale: "mr-IN",
    script: "devanagari",
    region: "india",
  },
  {
    code: "te",
    htmlLang: "te",
    label: "తెలుగు",
    dir: "ltr",
    dateLocale: "te-IN",
    script: "telugu",
    region: "india",
  },
  {
    code: "ta",
    htmlLang: "ta",
    label: "தமிழ்",
    dir: "ltr",
    dateLocale: "ta-IN",
    script: "tamil",
    region: "india",
  },
  {
    code: "gu",
    htmlLang: "gu",
    label: "ગુજરાતી",
    dir: "ltr",
    dateLocale: "gu-IN",
    script: "gujarati",
    region: "india",
  },
  {
    code: "ur",
    htmlLang: "ur",
    label: "اردو",
    dir: "rtl",
    dateLocale: "ur-IN",
    script: "nastaliq",
    region: "india",
  },
  {
    code: "kn",
    htmlLang: "kn",
    label: "ಕನ್ನಡ",
    dir: "ltr",
    dateLocale: "kn-IN",
    script: "kannada",
    region: "india",
  },
  {
    code: "or",
    htmlLang: "or",
    label: "ଓଡ଼ିଆ",
    dir: "ltr",
    dateLocale: "or-IN",
    script: "oriya",
    region: "india",
  },
  {
    code: "ml",
    htmlLang: "ml",
    label: "മലയാളം",
    dir: "ltr",
    dateLocale: "ml-IN",
    script: "malayalam",
    region: "india",
  },
  {
    code: "pa",
    htmlLang: "pa",
    label: "ਪੰਜਾਬੀ",
    dir: "ltr",
    dateLocale: "pa-IN",
    script: "gurmukhi",
    region: "india",
  },
  {
    code: "as",
    htmlLang: "as",
    label: "অসমীয়া",
    dir: "ltr",
    dateLocale: "as-IN",
    script: "bengali",
    region: "india",
  },
  {
    code: "mai",
    htmlLang: "mai",
    label: "मैथिली",
    dir: "ltr",
    dateLocale: "mai-IN",
    script: "devanagari",
    region: "india",
  },
  {
    code: "sat",
    htmlLang: "sat-Olck",
    label: "ᱥᱟᱱᱛᱟᱲᱤ",
    dir: "ltr",
    dateLocale: "sat-Olck-IN",
    script: "olchiki",
    region: "india",
  },
  {
    code: "ks",
    htmlLang: "ks-Arab",
    label: "کٲشُر",
    dir: "rtl",
    dateLocale: "ks-Arab-IN",
    script: "naskh",
    region: "india",
  },
  {
    code: "ne",
    htmlLang: "ne",
    label: "नेपाली",
    dir: "ltr",
    dateLocale: "ne-NP",
    script: "devanagari",
    region: "india",
  },
  {
    code: "sd",
    htmlLang: "sd-Arab",
    label: "سنڌي",
    dir: "rtl",
    dateLocale: "sd-Arab-IN",
    script: "naskh",
    region: "india",
  },
  {
    code: "doi",
    htmlLang: "doi",
    label: "डोगरी",
    dir: "ltr",
    dateLocale: "doi-IN",
    script: "devanagari",
    region: "india",
  },
  {
    code: "kok",
    htmlLang: "kok",
    label: "कोंकणी",
    dir: "ltr",
    dateLocale: "kok-IN",
    script: "devanagari",
    region: "india",
  },
  {
    code: "ru",
    htmlLang: "ru",
    label: "Русский",
    dir: "ltr",
    dateLocale: "ru-RU",
    script: "cyrillic",
    region: "europe",
  },
  {
    code: "de",
    htmlLang: "de",
    label: "Deutsch",
    dir: "ltr",
    dateLocale: "de-DE",
    script: "latin",
    region: "europe",
  },
  {
    code: "fr",
    htmlLang: "fr",
    label: "Français",
    dir: "ltr",
    dateLocale: "fr-FR",
    script: "latin",
    region: "europe",
  },
  {
    code: "it",
    htmlLang: "it",
    label: "Italiano",
    dir: "ltr",
    dateLocale: "it-IT",
    script: "latin",
    region: "europe",
  },
  {
    code: "es",
    htmlLang: "es",
    label: "Español",
    dir: "ltr",
    dateLocale: "es-ES",
    script: "latin",
    region: "europe",
  },
  {
    code: "pl",
    htmlLang: "pl",
    label: "Polski",
    dir: "ltr",
    dateLocale: "pl-PL",
    script: "latin",
    region: "europe",
  },
  {
    code: "uk",
    htmlLang: "uk",
    label: "Українська",
    dir: "ltr",
    dateLocale: "uk-UA",
    script: "cyrillic",
    region: "europe",
  },
  {
    code: "ro",
    htmlLang: "ro",
    label: "Română",
    dir: "ltr",
    dateLocale: "ro-RO",
    script: "latin",
    region: "europe",
  },
  {
    code: "nl",
    htmlLang: "nl",
    label: "Nederlands",
    dir: "ltr",
    dateLocale: "nl-NL",
    script: "latin",
    region: "europe",
  },
] as const satisfies readonly LocaleMeta[];

export type SiteLocale = (typeof LOCALE_TABLE)[number]["code"];

export const LOCALES: readonly SiteLocale[] = LOCALE_TABLE.map((row) => row.code);
export const DEFAULT_LOCALE: SiteLocale = LOCALE_TABLE[0].code;

const BY_CODE = new Map<string, LocaleMeta>(LOCALE_TABLE.map((row) => [row.code, row]));

export function isLocale(value: string | undefined): value is SiteLocale {
  return value !== undefined && BY_CODE.has(value);
}

/** The table row for a locale. */
export function localeMeta(locale: SiteLocale): LocaleMeta {
  return BY_CODE.get(locale) as LocaleMeta;
}

/** URL prefix inside the base path: "" for the default locale, "<code>/" otherwise. */
export function localePrefix(locale: SiteLocale): string {
  return locale === DEFAULT_LOCALE ? "" : `${locale}/`;
}

export function htmlLang(locale: SiteLocale): string {
  return localeMeta(locale).htmlLang;
}

/** Splits a base-prefixed pathname into its locale and locale-relative page
 *  path ("" for home, "about/" for /about/, always trailing-slashed). The first
 *  segment counts as a locale only when the table lists it. */
export function splitLocale(url: URL): { locale: SiteLocale; path: string } {
  const base = import.meta.env.BASE_URL;
  let path = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : url.pathname;
  path = path.replace(/^\//, "");
  const [first = "", ...rest] = path.split("/");
  let locale: SiteLocale = DEFAULT_LOCALE;
  if (isLocale(first)) {
    locale = first;
    path = rest.join("/");
  }
  if (path && !path.endsWith("/")) path += "/";
  return { locale, path };
}

/** Which locale a base-prefixed pathname belongs to. */
export function localeFromUrl(url: URL): SiteLocale {
  return splitLocale(url).locale;
}

/** The locale-relative page path for a base-prefixed pathname. */
export function pagePathFromUrl(url: URL): string {
  return splitLocale(url).path;
}

/**
 * Base-absolute URL of a page path inside a locale's tree, with no
 * relative-depth math. `path` is locale-relative ("", "about/", "contact/").
 */
export function localizePath(path: string, locale: SiteLocale): string {
  const clean = path.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${localePrefix(locale)}${clean}`;
}

/** hreflang alternates for a locale-relative page path. By default every locale
 *  is emitted (all pages are paired) plus an x-default pointing at the default
 *  locale. A page that exists in only some locales (an untranslated blog post)
 *  passes `available` so the missing locales' alternates are omitted; emitting
 *  a URL that 404s would be invalid hreflang. x-default points at the default
 *  locale when it is available, otherwise at the first available locale.
 *  Absolute, for the <head>. */
export function alternateUrls(
  path: string,
  site: URL | undefined,
  available: readonly SiteLocale[] = LOCALES,
): { hreflang: string; href: string }[] {
  if (!site || available.length === 0) return [];
  const alts = available.map((locale) => ({
    hreflang: htmlLang(locale),
    href: new URL(localizePath(path, locale), site).href,
  }));
  const xDefault = available.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : (available[0] as SiteLocale);
  alts.push({ hreflang: "x-default", href: new URL(localizePath(path, xDefault), site).href });
  return alts;
}
