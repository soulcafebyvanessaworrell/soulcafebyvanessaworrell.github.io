# The Soul Cafe: agent and developer guide

A multilingual Astro and Tailwind v4 static site for a psychotherapy practice, deployed to GitHub Pages under a base path. 29 locales: English unprefixed at the root, every other locale under `/<code>/`, English URL slugs everywhere. The code is the source of truth; this file holds only the rules that the code cannot enforce.

## Rules

1. Every internal link goes through `localizePath(path, locale)` from `src/i18n/locales.ts`. Never hardcode a leading `/`: it breaks under the base path and on the `latest/` and version tiers.
2. All prose lives in `src/i18n/<code>.ts`, read through `src/i18n/ui.ts`; page files hold layout, icons, URLs, and classes only.
3. Wrap every page in `src/layouts/Base.astro`; a page in a nav section passes `active` (a `NAV_ITEMS[].id` from `src/lib/nav.ts`). Copy `src/pages/[...locale]/about.astro` for the pattern.
4. Logical utilities only (`start-*`, `end-*`, `ms-*`, `ps-*`, `text-start`), never physical ones. Three locales are right-to-left. The WhatsApp float, and the padding that clears it on the packages page, are the deliberate exceptions.
5. Wrap Latin and digit runs (phone numbers, emails, URLs, handles, the copyright line, "M.A.") in `dir="ltr"` wherever they appear. Directional icons, hover translates, and decorative offsets get an `rtl:` mirror.
6. No em or en dashes in any visible string; a unit test enforces it.
7. Body text on periwinkle and coral bands stays ink. White is only for large script headings. There is no dark mode.
8. Import brand images from `src/lib/assets.ts`; icons come from astro-icon's lucide set, brand marks from simple-icons.
9. Before a commit, run the gates CI runs (`.github/workflows/ci.yml`).

## Locales

To add a locale: add one row to `LOCALE_TABLE` in `src/i18n/locales.ts`, copy `en.ts` to `src/i18n/<code>.ts` (`export const dict = {...} satisfies LocaleDict`, `translation.source: "stub"` while it carries English), and register it in `ui.ts`. Typecheck names anything else missing. A new script also needs its fontsource package, `@import` lines in `src/styles/fonts.css`, a `[data-script]` block in `src/styles.css`, and its family in the shared `--font-noto` stack there.

CI runs `bun test` with `I18N_REQUIRE_TRANSLATED=1`, so a stub dictionary fails the build: a locale lands translated.

On every default-locale page load, `Base.astro` redirects to the language the picker stored in `localStorage`, else to the browser's language. Localized pages never redirect.

## Translation contract

A translation replaces exactly one file, `src/i18n/<code>.ts`, and optionally adds `src/content/blog/welcome-<code>.md`. It touches nothing else.

- Keep the object shape: key for key, array length for array length.
- Keep verbatim: every `{placeholder}`, `WhatsApp`, `M.A.` (followed by U+200E mid-sentence in a right-to-left dictionary). Tele-MANAS may be transliterated; its numbers come from `src/lib/constants.ts`, not the dictionary.
- Brand names (`The Soul Cafe`, `The Soul Food Supper Club`) stay in English or are transliterated to sound the same in the local script, never translated by meaning; English stays where the script cannot carry the sound. A transliteration is recorded in the `brand` field of the locale's `LOCALE_TABLE` row.
- Set `translation.source` to `"ai"` or `"human"` and `translation.reviewed` accordingly.
- No em or en dashes. Then `bun run typecheck && bun test` must pass.
