import type { APIRoute } from "astro";
import { DEFAULT_LOCALE, htmlLang, localeMeta } from "../i18n/locales";
import { pages } from "../i18n/ui";
import { BRAND, SITE_BASE, SITE_TITLE, THEME_COLOR } from "../lib/constants";

// Built from SITE_BASE, so start_url, scope, and icon paths flip with the
// domain at build time; no hand edits at a custom-domain cutover. The prose is
// the default locale's, like the rest of the manifest.
export const GET: APIRoute = () => {
  const manifest = {
    name: SITE_TITLE,
    short_name: BRAND,
    lang: htmlLang(DEFAULT_LOCALE),
    dir: localeMeta(DEFAULT_LOCALE).dir,
    description: pages(DEFAULT_LOCALE).home.meta.description,
    start_url: SITE_BASE,
    scope: SITE_BASE,
    display: "standalone",
    theme_color: THEME_COLOR,
    background_color: "#ffffff",
    icons: [
      { src: `${SITE_BASE}icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${SITE_BASE}icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${SITE_BASE}icon-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  });
};
