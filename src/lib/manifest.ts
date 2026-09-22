// The web app manifest. Everything path-shaped derives from the base path
// handed in, so start_url, scope, and the icon paths flip with the domain at
// build time and a custom-domain cutover needs no hand edit. The prose is the
// default locale's, like the rest of the manifest.
import { DEFAULT_LOCALE, htmlLang, localeMeta } from "../i18n/locales";
import { pages } from "../i18n/ui";
import { BRAND, SITE_TITLE, THEME_COLOR } from "./constants";

export function webManifest(base: string) {
  return {
    name: SITE_TITLE,
    short_name: BRAND,
    lang: htmlLang(DEFAULT_LOCALE),
    dir: localeMeta(DEFAULT_LOCALE).dir,
    description: pages(DEFAULT_LOCALE).home.meta.description,
    start_url: base,
    scope: base,
    display: "standalone",
    theme_color: THEME_COLOR,
    background_color: "#ffffff",
    icons: [
      { src: `${base}icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${base}icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${base}icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
