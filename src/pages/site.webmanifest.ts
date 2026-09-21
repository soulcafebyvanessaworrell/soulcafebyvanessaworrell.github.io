import type { APIRoute } from "astro";
import { DEFAULT_LOCALE, htmlLang, localeMeta } from "../i18n/locales";
import { SITE_BASE, SITE_TITLE } from "../lib/constants";

// Built from SITE_BASE, so start_url, scope, and icon paths flip with the
// domain at build time; no hand edits at a custom-domain cutover.
export const GET: APIRoute = () => {
  const manifest = {
    name: SITE_TITLE,
    short_name: "The Soul Cafe",
    lang: htmlLang(DEFAULT_LOCALE),
    dir: localeMeta(DEFAULT_LOCALE).dir,
    description: "A warm, non-judgmental psychotherapy space to explore, heal, and grow.",
    start_url: SITE_BASE,
    scope: SITE_BASE,
    display: "standalone",
    theme_color: "#a9efe3",
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
