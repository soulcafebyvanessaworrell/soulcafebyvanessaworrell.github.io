// Runs Lighthouse CI against the built site. URLs and the server-ready pattern
// derive from src/lib/constants.ts and the locale table so the preview port,
// base path, and locale prefixes live in one place; every other lhci setting
// stays in lighthouserc.json (CLI flags merge over it). PAGES lists the
// default-locale paths to audit; the home of the first right-to-left locale is
// added so a regression in mirrored layout or font loading shows up too. The
// packages page is there as the densest layout.
import { LOCALE_TABLE, localePrefix } from "../src/i18n/locales";
import { PREVIEW_PORT, SITE_BASE } from "../src/lib/constants";

const host = `localhost:${PREVIEW_PORT}`;
const origin = `http://${host}${SITE_BASE}`;
const rtl = LOCALE_TABLE.find((row) => row.dir === "rtl");
if (!rtl) throw new Error("the locale table has no right-to-left row to audit");
const PAGES = ["", "packages/"];
const urls = [...PAGES.map((page) => `${origin}${page}`), `${origin}${localePrefix(rtl.code)}`];
const lhci = Bun.spawn(
  [
    "bunx",
    "lhci",
    "autorun",
    `--collect.startServerReadyPattern=${host}`,
    ...urls.map((url) => `--collect.url=${url}`),
  ],
  {
    stdio: ["inherit", "inherit", "inherit"],
    // lhci starts `bun run preview` itself (lighthouserc.json); handing the
    // resolved port down keeps that server on the port the URLs above name.
    env: { ...process.env, PREVIEW_PORT: String(PREVIEW_PORT) },
  },
);
process.exit(await lhci.exited);
