// Locale registry + typed accessors. One dictionary file per locale, all
// statically imported so the build fails (not the page) when one is missing.
// Adding a locale = one row in locales.ts, one file here, one line below; the
// Record type pins registry parity with the table; i18n.test.ts walks this map.

import { dict as as_ } from "./as";
import { dict as bn } from "./bn";
import { dict as de } from "./de";
import { dict as doi } from "./doi";
import { en, type LocaleDict, type UiKey } from "./en";
import { dict as es } from "./es";
import { dict as fr } from "./fr";
import { dict as gu } from "./gu";
import { dict as hi } from "./hi";
import { dict as it } from "./it";
import { dict as kn } from "./kn";
import { dict as kok } from "./kok";
import { dict as ks } from "./ks";
import type { SiteLocale } from "./locales";
import { dict as mai } from "./mai";
import { dict as ml } from "./ml";
import { dict as mr } from "./mr";
import { dict as ne } from "./ne";
import { dict as nl } from "./nl";
import { dict as or_ } from "./or";
import { dict as pa } from "./pa";
import { dict as pl } from "./pl";
import { dict as ro } from "./ro";
import { dict as ru } from "./ru";
import { dict as sat } from "./sat";
import { dict as sd } from "./sd";
import { dict as ta } from "./ta";
import { dict as te } from "./te";
import { dict as uk } from "./uk";
import { dict as ur } from "./ur";

export type { LocaleDict, UiKey } from "./en";

export const dictionaries: Record<SiteLocale, LocaleDict> = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
  gu,
  ur,
  kn,
  or: or_,
  ml,
  pa,
  as: as_,
  mai,
  sat,
  ks,
  ne,
  sd,
  doi,
  kok,
  ru,
  de,
  fr,
  it,
  es,
  pl,
  uk,
  ro,
  nl,
};

/** A `{name}` placeholder in a dictionary string; the name is the capture. */
export const PLACEHOLDER = /\{([a-z]+)\}/g;

/** Splices values into a dictionary string's placeholders. Every locale
 *  carries each placeholder exactly as often as English does (i18n.test.ts),
 *  so a value is never left unspliced in one language. */
export function fill(text: string, values: Record<string, string>): string {
  return text.replace(PLACEHOLDER, (token, name: string) => values[name] ?? token);
}

/** A shared-chrome string. */
export function t(locale: SiteLocale, key: UiKey): string {
  return dictionaries[locale].ui[key];
}

/** Every page's meta and prose for a locale. */
export function pages(locale: SiteLocale): LocaleDict["pages"] {
  return dictionaries[locale].pages;
}

/** The contact form's labels and hints. */
export function form(locale: SiteLocale): LocaleDict["form"] {
  return dictionaries[locale].form;
}

/** The blog index and post chrome. */
export function blogUi(locale: SiteLocale): LocaleDict["blog"] {
  return dictionaries[locale].blog;
}
