# The Soul Cafe by Vanessa Worrell

A warm, pastel website for a psychotherapy practice. Built with [Astro](https://astro.build/) and Tailwind CSS v4, published in 29 languages, and deployed to GitHub Pages.

## Commands

```bash
bun install        # install dependencies
bun run dev        # dev server at http://localhost:4321
bun run build      # production build into dist/
bun run preview    # preview the built site
bun run typecheck  # astro check + tsc --noEmit
bun run lint       # biome check
bun run format     # biome check --write (autofix)
bun run test       # unit tests: locale table and dictionary parity checks
bun run test:e2e   # Playwright end-to-end tests
```

You need [Bun](https://bun.sh). The exact version is pinned in `packageManager` in `package.json`.

## Project shape

```
src/
  assets/        the owner's original brand images (logo, founder, blog hero, signature, teacup)
  components/    the design-system components (CLAUDE.md has the API table)
  content/       blog posts as Markdown, one file per post per language (see "Writing a blog post")
  i18n/          locales.ts (the locale table and path helpers), one dictionary per language (en.ts is canonical), ui.ts (registry), routes.ts, tests
  layouts/       Base.astro, which holds the head/SEO/JSON-LD and the header, footer (with the crisis note), and WhatsApp chrome
  lib/           constants.ts (site identity), assets.ts, nav.ts, blog.ts, heroImage.ts, zipLabels.ts
  pages/         routes, one file per page under pages/[...locale]/ serving every language; English at the root, others under /<code>/
  scripts/       site.ts (scroll reveals, WhatsApp float, language picker; runs on astro:page-load)
  styles.css     Tailwind v4 theme tokens, base rules, component classes, and per-script type rules
  styles/        fonts.css, which loads the font for every script
public/          favicons generated from the logo (robots.txt and site.webmanifest are build-time endpoints under src/pages/)
```

## Editing content

Site identity (phone, email, socials, booking links, crisis helpline) lives in one place, `src/lib/constants.ts`. Change it there and every page and the footer update.

Apart from the contact details above and the blog posts below, every sentence on the site lives one file per language in `src/i18n/`: `en.ts` for English, `hi.ts` for Hindi, and one file per other language code. Each file holds the shared chrome, the contact form, the blog chrome, and every page's prose.

`en.ts` is the reference; the other files must match its keys, and `bun run test` and `bun run typecheck` both fail if they drift.

The page files under `src/pages/[...locale]/` hold layout only. To change wording, edit the dictionary for that language, not the page.

The six nav sections are defined once, in `src/lib/nav.ts` (label key plus path). Add or reorder them there.

## Writing a blog post

Posts live as Markdown files in `src/content/blog/`, one file per post per language. You can add one from GitHub's website, with nothing installed.

1. Open `src/content/blog/_template.md` on GitHub and copy its contents.
2. Make a new file in the same folder. Name it after the post and the language code, for example `a-quiet-week-en.md` for English or `a-quiet-week-hi.md` for Hindi. The "Translation review" table below lists every code.
3. Paste in the template, fill the five lines at the top (title, description, pubDate, locale, draft), and write the post under the second `---`.
4. While `draft` is `true`, the post stays hidden. Set it to `false` when the post is ready.
5. Commit the file. Start the commit subject with `feat:`, for example `feat: publish a quiet week`. That prefix is what lets a new version be released; a plain subject like `Create a-quiet-week-en.md` will not release anything.
6. The post shows under `latest/` on the live site right away, so you can preview it there. To put it on the production root, merge the release pull request that opens automatically a short while after your commit. Production stays on the previous version until that pull request is merged.

English posts show at `/blog/`, Hindi posts at `/hi/blog/`, and every other language at `/<code>/blog/`, newest first. A post only shows in its own language, so each translation is its own file with the same name before the code. The file whose name starts with `_` is the template, and it never appears on the site.

When a post has no translation in a language, that language's entry in the picker leads to its blog index instead of a missing page.

## How the site is deployed

Every push to `main` publishes one GitHub Pages deployment that holds several copies of the site, called tiers. Nothing is carried over between deploys and there is no `gh-pages` branch: the deploy workflow checks out the full history and `scripts/pages-site.mts` rebuilds every tier from git, each with its own base path.

| Path | Built from | Indexed |
|---|---|---|
| `/` | the newest `vX.Y.Z` tag, or `main` until the first tag exists | yes |
| `/latest/` | `main`, always | no |
| `/stable/` | the newest `vX.Y.Z` tag; absent until one exists, never `main` | no |
| `/vX.Y.Z/` | one directory per kept tag, the five newest by version number | no |
| `/versions.json` | the list of the tiers above, with their labels and paths | n/a |

The root is production: it builds indexable with the sitemap on. `latest/` is the preview of what will ship next, so a merged change can be checked there before it is released.

`stable/` always serves the same tag as the root once a release exists; it is a fixed address for "the current release" that never names unreleased work. Only plain release tags count (`v1.2.3`); prereleases such as `v1.2.3-rc.1` are ignored.

Every non-root tier builds with `ASTRO_STAGING=1`, which forces a site-wide `noindex`, drops the sitemap, and makes its pages self-canonical to their own tier URL (the `noindex` is the real guard, so the canonical target does not matter). The root's `robots.txt` disallows each of the other tier paths, so search engines see one copy of the site.

`site.webmanifest` is built per tier from its base path, so each tier is self-contained. Pages on a non-root tier show a small version switcher in the footer, listing every tier; the production root never shows it.

The site's origin and base path are never written into the repo. The deploy workflow derives them from the repository name (`https://<owner>.github.io` with `/<repo>/`, or `/` for a repository named `<owner>.github.io`) or from the custom domain, and passes them to every tier build as `ASTRO_SITE` and `ASTRO_BASE`. This repository is named `<owner>.github.io`, so the derived base is the domain root.

Local builds and tests use the defaults in `src/lib/constants.ts`. That is the one place to edit if the local default should follow a rename. The live URL shows on the `github-pages` environment in the Actions run.

The deploy workflow (`.github/workflows/deploy.yml`) can also be run by hand from the Actions tab; it always publishes `main` as `latest/`, whatever ref it was started from.

## Release flow

Releases come from Conventional Commits. After CI is green on `main`, release-please keeps one rolling release pull request that bumps the version and regenerates `CHANGELOG.md`. Merging it creates the `vX.Y.Z` tag and the GitHub release, and the same run deploys the site with the new tag at the root, `stable/`, and `vX.Y.Z/`.

Before the first release the version is `0.0.0`. While it stays below `1.0.0`, a `feat:` commit bumps the minor version, a `fix:` commit bumps the patch version, and a breaking change bumps the minor version rather than the major. The launch release is `0.1.0`, set by `initial-version` in `release-please-config.json`.

The release pull request is opened with the built-in `GITHUB_TOKEN`, and GitHub never starts workflows for pull requests that token opens, so it carries neither required check (`all-green` and `conventional-title`). Either merge it through the ruleset's admin bypass (the code it releases was already checked on `main`), or push an empty commit to its branch when you want the checks to run.

The branch is named after the `name` in `package.json`:

```bash
git fetch origin
git checkout release-please--branches--main--components--soul-cafe
git commit --allow-empty -m "chore: start ci"
git push
```

To release a specific version instead of the computed one, add a `Release-As` footer to any commit on `main`, for example:

```
chore: prepare the launch release

Release-As: 1.0.0
```

The next release pull request then proposes that version. Release tags are protected by a tag ruleset (`.github/settings.yml`): they cannot be deleted or moved without the admin bypass, because the deploy rebuilds production from them.

## Moving to the custom domain

The site can move to a real domain while staying on GitHub Pages. The switch is driven by one repository variable, `CUSTOM_DOMAIN`, plus the domain field in the Pages settings. When the variable is unset, everything builds exactly as described above.

When you set it to the bare domain, the deploy builds the production root at the domain root, keeps the other tiers under it (`/latest/`, `/stable/`, `/vX.Y.Z/`), and points every absolute URL at the new origin. The origin and base come from `ASTRO_SITE` and `ASTRO_BASE`, which `src/lib/constants.ts` already reads, so the move needs no code change. `robots.txt` and `site.webmanifest` are built from the same values and flip with them.

1. Point the DNS at GitHub Pages. For an apex domain, add A records for GitHub's four IPv4 addresses (`185.199.108.153` through `185.199.111.153`) and AAAA records for its four IPv6 addresses (`2606:50c0:8000::153` through `2606:50c0:8003::153`). For a `www` subdomain, add a CNAME to `<owner>.github.io`.
2. Set the repository variable. Under Settings, then Secrets and variables, then Actions, then Variables, add `CUSTOM_DOMAIN` with the bare domain such as `thesoulcafe.com`, no scheme and no trailing slash. It is a variable, not a secret.
3. Deploy. Push to `main`, or run the Deploy website workflow by hand. It builds the root at `/` and the other tiers under it, and sets the origin to the new domain.
4. Set the domain in GitHub. Under Settings, then Pages, enter the same bare domain in the Custom domain field and save. Pages published from Actions ignore the `CNAME` file the deploy writes, so this step is what attaches the domain.
5. Turn on Enforce HTTPS once the certificate is ready, which can take up to a day.
6. Verify the live site. The home page loads on the new domain, the canonical tags and sitemap carry it, and `/latest/` still serves the build from `main`.

To roll back, delete the `CUSTOM_DOMAIN` variable, clear the Custom domain field under Settings, then Pages, and redeploy. The site returns to `https://<owner>.github.io/`, the user-site root.

## Repository setup

The repository is `soulcafebyvanessaworrell/soulcafebyvanessaworrell.github.io`, a public repository of the `soulcafebyvanessaworrell` organization. The deploy derives the base path from the repository name, and because this repository is named `<owner>.github.io` the derived base is the root. It already exists, so nothing below creates anything.

1. Give the `maintainers` team the repository. Under the organization, then Teams, then `maintainers`, set the visibility to Visible, and under Repositories add this repository with the Write role. `.github/CODEOWNERS` names that team as the sole code owner, and GitHub honours a team code owner only when the team is visible and has write access.
2. Install the [Settings](https://github.com/apps/settings) GitHub app on this repository. It applies `.github/settings.yml` (visibility, description, topics, labels, merge options, the `main` and `release-tags` rulesets) on every push to `main`. Before installing, confirm `private` in that file is `false`, or the app makes the repository private.
3. Enable GitHub Pages with the source "GitHub Actions". The maintainer does this once through the API, before the next deploy run; if the first deploy already failed, re-run it after this call. If Pages is already on, send the same call with `-X PUT`.

   ```bash
   gh api -X POST repos/soulcafebyvanessaworrell/soulcafebyvanessaworrell.github.io/pages -f build_type=workflow
   ```

   In the UI, the same setting is under Settings, then Pages, then Build and deployment, where Source is set to GitHub Actions. On a brand-new repository the first deploy can fail to publish until this has been done once.
4. Add no secrets or variables. The repository holds none by decision: every workflow runs on the built-in `GITHUB_TOKEN`. The one optional input, the `CUSTOM_DOMAIN` variable, stays unset until the owner chooses a domain.

## Owner runbook

These are the jobs only you can do, roughly in order of importance.

1. Set up the repository. The three one-time steps (team access, the Settings app, GitHub Pages) are under "Repository setup" above.
2. Merge release pull requests. They open automatically after a `feat:` or `fix:` commit lands on `main` and carry no CI check, because GitHub does not run workflows for pull requests the built-in token opens. Merge them with your admin bypass, or start CI first as described under "Release flow".
3. Activate the contact form. It posts to [FormSubmit](https://formsubmit.co/). The first real submission after launch triggers a confirmation email to `thesoulcafebyvanessaworrell@gmail.com`, and you have to click the link in it before FormSubmit will deliver any messages. Send yourself a test and confirm you receive it.
4. Review the translations. Every translated string was drafted by machine for warmth and readability, and no native speaker has checked it; a language marked `stub` still shows English until its translation lands. The "Translation review" table below tracks each language; read `src/i18n/<code>.ts` and the matching blog posts in `src/content/blog/` before launch.
5. Review the crisis note. The line in the footer points to Tele-MANAS `14416`; confirm the number and the wording are current and appropriate. It lives in `crisis_note` in every `src/i18n/<code>.ts`, with `src/i18n/en.ts` as the reference.
6. Review the privacy page before launch. It is a plain-language policy for a static site with no cookies or analytics; its prose is the `privacy` block in each `src/i18n/<code>.ts`. Have it checked for your practice and jurisdiction.
7. Fill in the missing social URLs. The Facebook and LinkedIn addresses are unknown, so they point at the network homepages with `TODO(owner)` markers in `src/lib/constants.ts`. Replace them.
8. Check the Canva license. The teacup doodle (`src/assets/teacup-doodle.svg`) and the other decorative elements come from Canva. Confirm the license allows use on a public commercial site before launch.
9. Add analytics when you want it; nothing is wired up yet. [Plausible](https://plausible.io/) and [Umami](https://umami.is/) are cookieless and privacy-friendly, which suits a therapy practice; GA4 is the other option. The snippet goes in `src/layouts/Base.astro`.
10. Add the couples and family booking calendars. Both currently reuse the one-on-one calendar; paste each dedicated Google Calendar link over `BOOKING.couples` and `BOOKING.family` in `src/lib/constants.ts`.

## Adding a locale

Every language comes from a single table plus one dictionary file. Adding another takes five small steps.

1. Add one row to `LOCALE_TABLE` in `src/i18n/locales.ts`: the code (which becomes the URL prefix, such as `/de/`), the language's own name, its `<html lang>` value, its reading direction, the date format locale, its script, and whether the picker lists it under India or Europe.
2. Create `src/i18n/<code>.ts` with exactly this shape, copying the object from `src/i18n/en.ts` and setting `translation.source` to `stub` until a real translation replaces the English. Only `en.ts` exports `en`; every other file exports `dict`. TypeScript flags any key you miss or add.

   ```ts
   import type { LocaleDict } from "./en";

   export const dict = { ... } satisfies LocaleDict;
   ```

3. Register it in `src/i18n/ui.ts`: `import { dict as xx } from "./xx";` plus one `xx,` line in the `dictionaries` map (a code that is a JavaScript reserved word takes a trailing-underscore alias, as `as_` and `or_` do).
4. Add the language's row to the "Translation review" table below, and update the language count in this file's introduction.
5. Only if the language uses a script the site does not have yet (the table's `script` field lists the ones it does): add the matching fontsource package to `package.json`, two `@import` lines to `src/styles/fonts.css`, a `[data-script="..."]` block and the family in the shared `--font-noto` stack in `src/styles.css` (so its name renders in every language's picker), and the new name to the `Script` type in `locales.ts`.

Nothing else changes. The Astro config, the sitemap, the language picker, the 404 page, and the tests all read the table, so the new language appears everywhere at once.

After that, `bun run typecheck` and `bun run test` hold the new dictionary in step with English: same keys, same number of paragraphs in every list, no empty strings, the crisis note keeping its two phone-number slots, and no em or en dashes.

## Translation review

Each language ships in one of three states, recorded in its dictionary file: `human` (owner-written or reviewed), `ai` (a machine draft), or `stub` (still English). The Source and Reviewed columns mirror `translation.source` and `translation.reviewed` in each `src/i18n/<code>.ts`; the maintainer updates them as translations land.

| Language | Script | Source | Reviewed |
|---|---|---|---|
| English (en) | latin | human | yes |
| हिन्दी (hi) | devanagari | ai | no |
| বাংলা (bn) | bengali | ai | no |
| मराठी (mr) | devanagari | ai | no |
| తెలుగు (te) | telugu | ai | no |
| தமிழ் (ta) | tamil | ai | no |
| ગુજરાતી (gu) | gujarati | ai | no |
| اردو (ur) | nastaliq | ai | no |
| ಕನ್ನಡ (kn) | kannada | ai | no |
| ଓଡ଼ିଆ (or) | oriya | ai | no |
| മലയാളം (ml) | malayalam | ai | no |
| ਪੰਜਾਬੀ (pa) | gurmukhi | ai | no |
| অসমীয়া (as) | bengali | ai | no |
| मैथिली (mai) | devanagari | ai | no |
| ᱥᱟᱱᱛᱟᱲᱤ (sat) | olchiki | ai | no |
| کٲشُر (ks) | naskh | ai | no |
| नेपाली (ne) | devanagari | ai | no |
| سنڌي (sd) | naskh | ai | no |
| डोगरी (doi) | devanagari | ai | no |
| कोंकणी (kok) | devanagari | ai | no |
| Русский (ru) | cyrillic | ai | no |
| Deutsch (de) | latin | ai | no |
| Français (fr) | latin | ai | no |
| Italiano (it) | latin | ai | no |
| Español (es) | latin | ai | no |
| Polski (pl) | latin | ai | no |
| Українська (uk) | cyrillic | ai | no |
| Română (ro) | latin | ai | no |
| Nederlands (nl) | latin | ai | no |

## Notes

The pre-commit hook runs the fast subset (lint-staged on changed files, then lint, typecheck, and the unit tests); CI runs the full gates on top of that (yamllint, the production build, the Playwright smoke suite, Lighthouse, and actionlint). A clean commit is not a promise CI is green, but it catches the common breakages before they leave your machine.

Internal links must go through `localizePath()` (from `src/i18n/locales.ts`), which applies both the GitHub Pages base path and the locale prefix. Never hardcode a leading `/`. CLAUDE.md explains why.

There is no dark mode. The brand is one bright pastel palette.
