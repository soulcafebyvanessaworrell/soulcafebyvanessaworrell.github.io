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

/** Splits a dictionary string at its placeholders into the text between them
 *  and, in place of each `{name}`, the value passed for it, kept as the value
 *  rather than spliced into the string. A page renders each value as markup
 *  (a digit pair as two spans) while the dictionary text around it stays a
 *  plain string, so no HTML is ever built from prose. A `{name}` with no
 *  value stays as its literal token; a locale carries each placeholder
 *  exactly as often as English does (i18n.test.ts), so a value is never left
 *  out in one language. Empty text between two placeholders is omitted. */
export function fillPieces<T>(text: string, values: Readonly<Record<string, T>>): (string | T)[] {
  const pieces: (string | T)[] = [];
  let cursor = 0;
  for (const match of text.matchAll(PLACEHOLDER)) {
    const [token, name] = match;
    const value = name === undefined ? undefined : values[name];
    if (value === undefined) continue;
    if (match.index > cursor) pieces.push(text.slice(cursor, match.index));
    pieces.push(value);
    cursor = match.index + token.length;
  }
  if (cursor < text.length) pieces.push(text.slice(cursor));
  return pieces;
}

/** Splices values into a dictionary string's placeholders. */
export function fill(text: string, values: Readonly<Record<string, string>>): string {
  return fillPieces(text, values).join("");
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
