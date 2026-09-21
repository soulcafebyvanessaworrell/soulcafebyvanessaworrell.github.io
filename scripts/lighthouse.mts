// Runs Lighthouse CI against the built site. URLs derive from
// src/lib/constants.ts and the locale table so the preview port, base path,
// and locale prefixes live in one place; every other lhci setting stays in
// lighthouserc.json. Two pages are audited: the default-locale home and the
// home of the first right-to-left locale, so a regression in mirrored layout
// or font loading shows up here.
import { LOCALE_TABLE, localePrefix } from "../src/i18n/locales";
import { PREVIEW_PORT, SITE_BASE } from "../src/lib/constants";

const origin = `http://localhost:${PREVIEW_PORT}${SITE_BASE}`;
const rtl = LOCALE_TABLE.find((row) => row.dir === "rtl");
if (!rtl) throw new Error("the locale table has no right-to-left row to audit");
const urls = [origin, `${origin}${localePrefix(rtl.code)}`];
const lhci = Bun.spawn(["bunx", "lhci", "autorun", ...urls.map((url) => `--collect.url=${url}`)], {
  stdio: ["inherit", "inherit", "inherit"],
});
process.exit(await lhci.exited);
