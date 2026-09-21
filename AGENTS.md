# The Soul Cafe: developer and agent guide

A multilingual Astro and Tailwind v4 site for a psychotherapy practice, deployed to GitHub Pages under a base path (`SITE_BASE` in `src/lib/constants.ts`). It ships in 29 locales. English lives unprefixed at the root, every other locale under `/<code>/`, and URL slugs stay English everywhere (`/hi/about/`, `/de/blog/welcome/`).

This file is the contract for anyone, human or agent, building pages on top of the foundation. See `README.md` for the owner-facing overview and the deploy flow.

## Golden rules

1. Every internal link goes through `localizePath(path, locale)` from `src/i18n/locales.ts`, which applies the GitHub Pages base path and the locale prefix. Never hardcode a leading `/` (such as `href="/about/"`): it breaks under the base path and on the latest/ and version tiers. `path` is locale-relative, with a trailing slash and no leading slash: `""`, `"about/"`, `"contact/"`.
2. All prose lives in `src/i18n/<code>.ts`, never in page files; icons, URLs, and classes stay in the page files. Read prose through `src/i18n/ui.ts`: `t(locale, key)` for shared chrome, `pages(locale).<page>` for page prose, `form(locale)` for the contact form, `blogUi(locale)` for blog chrome. `src/i18n/en.ts` is canonical and defines `LocaleDict`, and every other dictionary declares `satisfies LocaleDict`, so a wrong key is a compile error.
3. Wrap every page in `Base.astro`, which supplies the `<head>` (SEO, hreflang alternates, JSON-LD, icons, fonts), the header, the footer with the crisis note, the WhatsApp float, and view transitions, and sets `<html lang dir data-script>` from the locale table. Pages render only their `<main>` content into the default slot.
4. Pass `active` to highlight the current nav section. The values match `NAV_ITEMS[].id` in `src/lib/nav.ts`: `about`, `packages`, `blog`, `merch`, `learning`, `supper-club`.
5. Use logical utilities only, and isolate Latin and digit runs with `dir="ltr"`; three locales render right-to-left and the layout must flip with them. The pairs, the one exception, and the isolation rule are in "RTL rules".
6. No em or en dashes in any visible string. A unit test enforces it across every dictionary and every blog post. Use a comma, a colon, or a full stop instead.
7. Mind contrast. On periwinkle and coral bands, body text stays ink (dark), never white. White is only for large script headings.
8. There is no dark mode. One bright palette.

## Locale mechanics

`LOCALE_TABLE` in `src/i18n/locales.ts` is the single source for every language; the `LocaleMeta` doc comments there define each field. `SiteLocale`, `LOCALES`, and `DEFAULT_LOCALE` derive from it; `localeMeta()`, `localePrefix()`, and `htmlLang()` read a row. No locale code is written as a literal anywhere else.

Every page lives once, under `src/pages/[...locale]/`, and exports `getStaticPaths = localeStaticPaths` from `src/i18n/routes.ts`. That emits one path per locale: the default locale gets `params.locale` undefined, so it matches the top level, and every other locale gets its code as the first segment. Pages read `locale` from `Astro.props`, not from the URL.

A page that pairs a label tuple with icons calls `zipLabels()` from `src/lib/zipLabels.ts`, which type-checks that the two tuples have the same length.

`Base.astro` and the chrome derive the locale from the URL instead, through `splitLocale(url)`, which returns `{ locale, path }`; `localeFromUrl(url)` and `pagePathFromUrl(url)` are its two halves. The first segment counts as a locale only when the table says so, so a page slug can never be mistaken for a language.

A page that exists in only some locales (a blog post without a translation) passes `available` (the locales it exists in) and `fallbackPath` (where the language picker sends the others, locale-relative) to `Base`. The hreflang alternates then omit the missing locales, and the picker links them to the fallback instead of a 404. `src/pages/[...locale]/blog/[slug].astro` shows the pattern: `groupBySlug()` from `src/lib/blog.ts` collects the locales that carry each slug.

To add a locale:

1. Add one row to `LOCALE_TABLE`.
2. Create `src/i18n/<code>.ts` with exactly this shape, copying the object from `en.ts` and setting `translation.source` (`"stub"` while it still carries English; CI rejects a stub, see the tests note below). Only `en.ts` exports `en`; every other file exports `dict`.

   ```ts
   import type { LocaleDict } from "./en";

   export const dict = { ... } satisfies LocaleDict;
   ```

3. Register it in `ui.ts`: `import { dict as xx } from "./xx";` plus one `xx,` line in `dictionaries`. A code that is a JavaScript reserved word takes a trailing-underscore alias and an explicit entry, as `as_` and `or_` do.
4. Add the language's row to the "Translation review" table in `README.md`, and update the locale count where it is written out (`README.md`, this file).
5. Only for a new script: add a fontsource package to `package.json`, two `@import` lines (400 and 700) to `src/styles/fonts.css`, a `[data-script="..."]` block to `src/styles.css`, the family in the shared `--font-noto` stack there (so the endonym renders in every locale's picker), and the new value to the `Script` type in `locales.ts`.

Nothing else changes. `astro.config.mjs`, the sitemap, the language picker, the 404 page, and the tests all read the table.

Two unit test files (run by `bun test`) hold the locales together: `src/i18n/i18n.test.ts` walks every dictionary and `src/i18n/locales.test.ts` checks the table. Each test's first line says what would drift without it. CI runs `bun test` with `I18N_REQUIRE_TRANSLATED=1`, so a `"stub"` dictionary fails the build: a new locale lands translated, or the same change unsets that variable in `.github/workflows/ci.yml` for the interim.

## Design tokens (`src/styles.css`)

Colors, as Tailwind `bg-*` and `text-*` classes: `mint`, `mint-deep`, `periwinkle`, `periwinkle-deep`, `coral`, `coral-bright`, `cream`, `cream-deep`, `ink`, `soft`, `paper`. Section bands use `.band-white`, `.band-mint`, `.band-periwinkle`, and `.band-coral`, each pairing a pale surface with one deep same-hue tone (`on-mint`, `on-periwinkle`, `on-coral`) for headings, feature labels, and icons.

Fonts: `font-script` (display) and `font-sans` (body) are per-script stacks selected by the `[data-script]` attribute `Base.astro` sets on `<html>`; the stacks are listed under "Fonts and scripts".

Utilities: `.script` (script heading), `.pill` with `.pill-indigo` / `.pill-coral` / `.pill-coral-outline` / `.pill-cream`, `.card` and `.card-hover`, `.field` (form inputs), `.tap` (a touch target of at least 44px), and `.on-dark` (a light focus ring on dark fills).

## Fonts and scripts

`src/styles/fonts.css` imports every face the site can render, once, from `Base.astro`. Fontsource's CSS carries `unicode-range` on each `@font-face`, so a browser downloads only the files whose ranges the page's text uses: a German page never fetches Tamil.

The per-script rules in `src/styles.css` key off `[data-script]`. Every `--font-sans` stack leads with Rupee Sign (a one-glyph ₹ face), then PT Sans and the script's Noto face, then the shared Noto list.

`--font-script` puts the script's own face first, with two exceptions. Devanagari leads with the ten-glyph Latin Digits face (PT Sans digits), so "15" in a pill does not read as "IS" in Kalam. Kannada leads with PT Sans, because Noto Sans Kannada's own Latin bold paints thin; Cyrillic has no display face and keeps PT Sans.

The Arabic scripts put their face before PT Sans to keep Nastaliq word spacing. There, only isolated `dir="ltr"` Latin runs (the signature's "M.A." among them) render in PT Sans; the verbatim brand words ("The Soul Cafe", "WhatsApp") and untranslated stub text take the script face.

| Script | Body stack (`font-sans`) | Display face (`.script`) | Type rules |
|---|---|---|---|
| Latin | Rupee Sign, PT Sans, shared Noto list | Dancing Script | Default sizes, line-height 1.1 |
| Devanagari | Rupee Sign, PT Sans, Noto Sans Devanagari, shared Noto list | Latin Digits (PT Sans, U+0030-0039), then Kalam (handwriting) | Sizes stepped down, line-height 1.25 |
| Kannada | Rupee Sign, PT Sans, Noto Sans Kannada, shared Noto list | PT Sans, then Noto Sans Kannada at 700 | Sizes stepped down, line-height 1.25 |
| Every other Indic script, Ol Chiki | Rupee Sign, PT Sans, its own Noto face, shared Noto list | Its body face at weight 700 | Sizes stepped down, line-height 1.25 |
| Cyrillic (Russian, Ukrainian) | Rupee Sign, PT Sans, shared Noto list (the default) | PT Sans at 700 | Sizes stepped down, line-height 1.25 |
| Naskh (Kashmiri, Sindhi) | Rupee Sign, Noto Naskh Arabic, PT Sans, shared Noto list; `[dir="ltr"]` runs: Rupee Sign, PT Sans, shared Noto list | Noto Naskh Arabic at 700 | Sizes stepped down, line-height 1.25 |
| Nastaliq (Urdu) | Rupee Sign, Noto Nastaliq Urdu, PT Sans, shared Noto list; `[dir="ltr"]` runs as Naskh | Noto Nastaliq Urdu at 700 | Also body line-height 1.9 and `.script` 1.7, since the face hangs deep below the baseline |

## RTL rules (logical utilities only)

Three locales (`ur`, `ks`, `sd`) set `dir="rtl"`, and the layout flips with them. Use only logical utilities: `text-start`/`text-end`, `start-*`/`end-*`, `ms-*`/`me-*`, `ps-*`/`pe-*`, `justify-self-start`/`justify-self-end`. Never the physical ones (`text-left`, `left-*`, `ml-*`, `pl-*`, and their right-hand twins).

The one exception is `WhatsAppFloat.astro`, which is physically bottom-right on purpose (`right-3`, `md:right-4`) in every language, because that is where visitors expect it. The packages page's `pr-16 sm:pr-0` on the currency fieldset and the price rows exists only to clear that float on phones, and is the sole place physical padding follows it.

Phone numbers, emails, URLs, social handles, and the copyright line with its year carry `dir="ltr"` wherever they appear, on a wrapping `<span>` or on the link itself (Footer, ContactForm, ComingSoon, and the privacy page do this). Without it the bidi algorithm reorders "+91 7009597939" around its weak characters in a right-to-left page. Any new Latin or digit run follows the same rule.

A dictionary string carries no markup, so a Latin run that ends in a full stop mid-sentence (the founder's "M.A." in the booking prose) is followed by a left-to-right mark, U+200E, in the right-to-left dictionaries. Without it the bidi algorithm moves that last stop in front of the run.

Arrows and icons that imply a direction get `rtl:-scale-x-100` so they point the right way, and any hover translate they carry gets a mirrored `rtl:` twin (the blog index's read arrow: `group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5`). The home hero photo's mint offset plate has an `rtl:` mirror (`translate-x-3 rtl:-translate-x-3`). Any new decorative offset needs the same.

## Translation contract

A translation agent replaces exactly one file, `src/i18n/<code>.ts`, and optionally adds `src/content/blog/welcome-<code>.md`. It touches nothing else. The rules:

- Keep the file shape the registry imports, exactly:

  ```ts
  import type { LocaleDict } from "./en";

  export const dict = { ... } satisfies LocaleDict;
  ```

  Only `en.ts` exports `en`; `ui.ts` imports every other file as `import { dict as xx } from "./xx"` (reserved-word codes use a trailing-underscore alias such as `as_`).
- Keep the object shape. Same keys, same nesting, same array lengths: one paragraph per array item, so `bioOpening` with two English paragraphs has two translated paragraphs.
- Set `translation.source` to `"ai"` for a machine draft or `"human"` for owner-written or reviewed prose, and set `translation.reviewed` accordingly. Leave `"stub"` only while the file still carries English.
- Keep these verbatim: `{short}`, `{full}`, `The Soul Cafe`, `WhatsApp`, `M.A.` (in a right-to-left dictionary, followed by U+200E when it sits mid-sentence, see "RTL rules"). The helpline name Tele-MANAS may be transliterated; its numbers come from `src/lib/constants.ts`, not the dictionary.
- Use no em or en dashes.
- Then run `bun run typecheck && bun test`. Both must pass before the file is done.

## Component API contract

All components live in `src/components/`. `locale` is `SiteLocale`, a code from `LOCALE_TABLE`. `class` is always an optional passthrough for extra classes.

| Component | Props | Purpose |
|---|---|---|
| `Base.astro` (layout) | `title: string`, `description: string`, `active?: string`, `noindex?: boolean`, `available?: readonly SiteLocale[]`, `fallbackPath?: string`, `hideWhatsApp?: boolean` | Page shell: head/SEO/hreflang/JSON-LD, header, footer, WhatsApp float, view transitions; sets `<html lang dir data-script>`. `available` and `fallbackPath` handle pages missing in some locales. The float is auto-hidden on `contact/` and `book/`. Content goes in the default slot; a `head` slot takes per-page head extras. |
| `Header.astro` | `active?: string`, `locale`, `available?`, `fallbackPath?` | Mint band: brand row (logo, tagline, language picker, cart), then an action bar with the home icon, Book pill, six nav pills, and Contact pill. No hamburger; the same pieces stack on mobile. Rendered by `Base`. |
| `NavPills.astro` | `active?: string`, `locale`, `size?: "default" \| "compact"`, `class?` | The six cream section pills (script face), with `aria-current` on the active one. |
| `Footer.astro` | `locale` | Contact column, socials column, then a bottom row with the copyright line, the privacy page link, and the crisis note (Tele-MANAS), whose `{short}` and `{full}` placeholders are spliced into `tel:` links. Rendered by `Base`. |
| `VersionNav.astro` | `locale` | Text-only version list for the non-root deploy tiers (latest/, stable/, vX.Y.Z/), read from `SITE_VERSIONS` at build time; the root tier and a local build render nothing. Rendered by `Footer`. |
| `LanguagePicker.astro` | `locale`, `available?`, `fallbackPath?`, `align?: "start" \| "end"`, `class?` | A no-JS `<details>` disclosure. The summary shows a globe and the current endonym from `sm` up, and only the uppercase code below `sm`; the panel hangs from the `align` edge (the edge the picker sits at, default `end`) and lists every locale by region, each in its own script, no flags. Locales not in `available` link to `fallbackPath`. |
| `PillButton.astro` | `href: string`, `variant?: "indigo" \| "coral" \| "coral-outline" \| "cream"`, `external?: boolean`, `class?`, plus any extra attributes | Rounded pill link, script face. Slot is the label. Use `external` for off-site links (booking, socials). |
| `ScriptHeading.astro` | `level?: 1 \| 2 \| 3`, `class?` | Script-face display heading, fluid clamp sizing, balanced wrap. Slot is the text. |
| `SectionBand.astro` | `color: "white" \| "periwinkle" \| "mint" \| "coral"`, `heading?: string`, `id?: string`, `class?` | Full-bleed color band with a centered max-width container. Optional centered heading. Slot is the body. |
| `FeatureGrid.astro` | `class?` | A centered flex-wrap cluster with a fixed item basis, so a partial last row centers. Slot holds `FeatureItem`s. |
| `FeatureItem.astro` | `label: string`, `icon: string`, `iconClass?: string` | An icon (full astro-icon name, such as `"lucide:heart-handshake"`) over a label. |
| `CloudChip.astro` | `class?` | White cloud-shaped chip for the approaches band. Slot is the label. |
| `Signature.astro` | `locale`, `align?: "start" \| "center"`, `class?` | Founder signature SVG, "M.A.", and role. `start` follows the writing direction. |
| `BookingCard.astro` | `title: string`, `description: string`, `url: string`, `ctaLabel: string`, `embedUrl?: string`, `embedTitle?: string`, `titleLevel?: 2 \| 3`, `locale`, `class?` | Booking card with a primary pill that opens Google Calendar. `embedUrl` adds a lazy iframe under an "or book right here" disclosure; never pass a `calendar.app.google` short link there. |
| `ContactForm.astro` | `locale`, `class?` | The contact form, posting to FormSubmit with a honeypot and a localized thank-you redirect. Labels from `form(locale)`. |
| `ComingSoon.astro` | `color: "periwinkle" \| "coral"`, `locale` | A "Coming soon" band with an Instagram link and a Contact pill, so it is never a dead end. |
| `WhatsAppFloat.astro` | `locale` | Fixed bottom-right WhatsApp button. Rendered by `Base`. |

### Icons

Generic icons come from astro-icon's lucide set (`<Icon name="lucide:heart-handshake" />`); brand marks come from simple-icons (`simple-icons:instagram`, and so on). Import `Icon` from `astro-icon/components`. Pass `aria-hidden="true"` on decorative icons, or a label on meaningful ones.

### Images

Import brand images from `src/lib/assets.ts`. `logo`, `founder`, and `blogHero` are `ImageMetadata` for `<Image>`; `signature` and `teacupDoodle` are URL strings for `<img>`. Do not import from `src/assets/` directly.

## A page, minimally

```astro
---
import PillButton from "../../components/PillButton.astro";
import SectionBand from "../../components/SectionBand.astro";
import { localizePath } from "../../i18n/locales";
import { localeStaticPaths } from "../../i18n/routes";
import { pages, t } from "../../i18n/ui";
import Base from "../../layouts/Base.astro";

export const getStaticPaths = localeStaticPaths;

const { locale } = Astro.props;
const copy = pages(locale).about;
---

<Base title={copy.meta.title} description={copy.meta.description} active="about">
  <SectionBand color="periwinkle" heading={copy.workHeading}>
    <p class="text-ink">{copy.closingLine}</p>
    <PillButton href={localizePath("book/", locale)} variant="indigo">
      {t(locale, "book_session")}
    </PillButton>
  </SectionBand>
</Base>
```

The file lives at `src/pages/[...locale]/about.astro` and serves every locale. Its prose is the `about` block of every dictionary; adding a string means adding the key to `en.ts` and then to every other `src/i18n/<code>.ts`, and the typecheck names each file that lacks it.
