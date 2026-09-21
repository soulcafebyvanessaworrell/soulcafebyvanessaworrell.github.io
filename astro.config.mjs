import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import { DEFAULT_LOCALE, LOCALE_TABLE, LOCALES } from "./src/i18n/locales.ts";
import { DEV_PORT, PREVIEW_PORT, SITE_BASE, SITE_ORIGIN } from "./src/lib/constants.ts";

// The deploy passes ASTRO_SITE and ASTRO_BASE to every build, and the non-root tiers (latest/,
// vX.Y.Z/) add ASTRO_STAGING=1 (noindex + no sitemap). Local dev, tests, and Lighthouse
// use the defaults in constants.ts. SITE_BASE has already normalized ASTRO_BASE (leading/trailing
// slash), so consume it directly rather than re-reading the raw env.
const staging = Boolean(process.env.ASTRO_STAGING);
const base = SITE_BASE;

export default defineConfig({
  // Served from SITE_ORIGIN + base (see src/lib/constants.ts, the single
  // source of site identity).
  site: SITE_ORIGIN,
  base,
  outDir: "dist",
  // Keep authored whitespace: the default HTML compression eats the space
  // between text and an adjacent inline link.
  compressHTML: false,
  // Each route builds to <route>/index.html so URLs end in a clean slash.
  build: {
    format: "directory",
  },
  // The default locale stays at the unprefixed URLs; every other locale gets
  // its code as the first segment, all from the one page tree under
  // src/pages/[...locale]/. No `fallback`: every localized page is built.
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    // Sitemap is meaningless (and undesirable) for the noindex non-root tiers,
    // so drop the integration entirely there.
    ...(staging
      ? []
      : [
          sitemap({
            i18n: {
              defaultLocale: DEFAULT_LOCALE,
              locales: Object.fromEntries(LOCALE_TABLE.map((row) => [row.code, row.htmlLang])),
            },
            // The contact thank-you page and the 404 are not content pages.
            filter: (page) => !page.includes("/contact/thanks/") && !page.includes("/404"),
          }),
        ]),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      // Astro's top-level `server` schema strips unknown keys, so strictPort
      // has to live here. Fail fast instead of drifting to the next port.
      strictPort: true,
    },
  },
  server: ({ command }) => ({
    // Preview gets its own port so it (and the Playwright suite that spawns
    // it) never collides with a running dev server.
    port: command === "preview" ? PREVIEW_PORT : DEV_PORT,
  }),
});
