// getStaticPaths helper for the `src/pages/[...locale]/**` routes. One page
// file per route serves every locale; pages read `locale` from Astro.props.
import { DEFAULT_LOCALE, LOCALES, type SiteLocale } from "./locales";

export interface LocalePath {
  params: { locale: string | undefined };
  props: { locale: SiteLocale };
}

/** The `[...locale]` param for a locale: undefined for the default locale, so
 *  the rest param matches the top level, otherwise the code itself. */
export function localeParam(locale: SiteLocale): string | undefined {
  return locale === DEFAULT_LOCALE ? undefined : locale;
}

export function localeStaticPaths(): LocalePath[] {
  return LOCALES.map((locale) => ({ params: { locale: localeParam(locale) }, props: { locale } }));
}
