import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, type Page, test } from "@playwright/test";
import { LANGUAGE_STORAGE_KEY } from "../src/i18n/languageStorage";
import { LOCALE_TABLE } from "../src/i18n/locales";
import { dictionaries, fill, PLACEHOLDER } from "../src/i18n/ui";
import { BRAND, CRISIS, PRIVACY_UPDATED, SITE_BASE } from "../src/lib/constants";

// Base path the site is served under, without its trailing slash so it can be
// joined with the leading-slash paths below (root base becomes "").
const BASE = SITE_BASE.replace(/\/$/, "");

// Content routes, WITHOUT the base prefix and without a locale prefix. Every
// one exists in every locale. 404 is tested separately because it must return
// HTTP 404, not 200.
const CONTENT_PATHS = [
  "/",
  "/about/",
  "/book/",
  "/contact/",
  "/contact/thanks/",
  "/packages/",
  "/blog/",
  "/merch/",
  "/learning/",
  "/supper-club/",
  "/privacy/",
];

const DEFAULT_LOCALE = LOCALE_TABLE[0];

// A row of the locale table itself, so `row.code` is a SiteLocale and can index the dictionaries.
type LocaleRow = (typeof LOCALE_TABLE)[number];

/** `<base>/<prefix>` for a locale row, so `${localeBase(row)}/about/` is a URL. */
function localeBase(row: LocaleRow): string {
  return row.code === DEFAULT_LOCALE.code ? BASE : `${BASE}/${row.code}`;
}

// A representative sample of locales rather than all 29: the default, Hindi
// (the second fully translated locale), the first right-to-left row, and the
// first row of every other script. Every distinct rendering path is covered
// while the per-route suite stays quick.
const SAMPLE_LOCALES: LocaleRow[] = (() => {
  const picked: LocaleRow[] = [DEFAULT_LOCALE];
  const hi = LOCALE_TABLE.find((row) => row.code === "hi");
  if (hi) picked.push(hi);
  const rtl = LOCALE_TABLE.find((row) => row.dir === "rtl");
  if (rtl) picked.push(rtl);
  for (const row of LOCALE_TABLE) {
    if (!picked.some((p) => p.script === row.script)) picked.push(row);
  }
  return picked;
})();

// Full URLs (base + locale + path) for the sampled locales.
const ROUTES = SAMPLE_LOCALES.flatMap((row) => CONTENT_PATHS.map((p) => `${localeBase(row)}${p}`));

// English-only routes for the link crawler (every locale renders the same
// page tree, so crawling one locale finds every hardcoded-path bug).
const CRAWL_ROUTES = CONTENT_PATHS.map((p) => `${BASE}${p}`);

// Playwright's `requestfailed` also fires for cancelled navigations/prefetches
// (view transitions, speculative loads); those are not real breakage.
const IGNORED_REQUEST_FAILURES = ["net::ERR_ABORTED"];

test.describe("every route loads cleanly", () => {
  for (const route of ROUTES) {
    test(`200 + no console/network errors: ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err)));
      page.on("requestfailed", (req) => {
        const errorText = req.failure()?.errorText ?? "";
        if (IGNORED_REQUEST_FAILURES.some((e) => errorText.includes(e))) return;
        failedRequests.push(`${req.method()} ${req.url()} (${errorText})`);
      });

      const resp = await page.goto(route, { waitUntil: "load" });
      expect(resp, `no response for ${route}`).not.toBeNull();
      expect(resp?.status(), `HTTP status for ${route}`).toBe(200);

      // Contract: every page shows a visible <nav> landmark. The header renders
      // a desktop and a mobile copy; exactly one is shown at any viewport.
      await expect(page.locator("nav:visible").first()).toBeVisible();

      expect(consoleErrors, `console errors on ${route}`).toEqual([]);
      expect(failedRequests, `failed requests on ${route}`).toEqual([]);
    });
  }
});

// Without this, a locale row could build a home page whose <html> attributes
// disagree with the table (a typo in htmlLang, a missing dir) and nothing else
// would notice: the per-route suite above only samples locales.
test("all 29 home pages respond 200 with the table's lang, dir, and script", async ({
  request,
}) => {
  test.slow();
  const mismatches: string[] = [];
  let checked = 0;
  for (const row of LOCALE_TABLE) {
    const url = `${localeBase(row)}/`;
    const resp = await request.get(url);
    checked++;
    if (resp.status() !== 200) {
      mismatches.push(`${resp.status()} ${url}`);
      continue;
    }
    const html = await resp.text();
    const tag = html.match(/<html[^>]*>/)?.[0] ?? "";
    for (const [attr, want] of [
      ["lang", row.htmlLang],
      ["dir", row.dir],
      ["data-script", row.script],
    ] as const) {
      if (!tag.includes(`${attr}="${want}"`))
        mismatches.push(`${url}: expected ${attr}="${want}" in ${tag}`);
    }
  }
  expect(mismatches, "home pages disagreeing with the locale table").toEqual([]);
  // An emptied table would make the loop above a no-op and the test vacuous.
  expect(checked, "home pages fetched").toBe(LOCALE_TABLE.length);
  expect(checked).toBeGreaterThan(1);
});

// Crawl every same-origin <a href> on every English page and assert it
// resolves 200. This is the base-path canary: a hardcoded "/about/" (missing
// the base path) would 404 here even though the page it lives on loads fine.
// The language picker links every page to its 28 siblings, so this also
// covers every locale's route tree.
test("same-origin links all resolve 200", async ({ page, request }) => {
  test.slow();
  const seen = new Set<string>();

  for (const route of CRAWL_ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const origin = new URL(page.url()).origin;
    const hrefs = await page.$$eval("a[href]", (els) =>
      els.map((el) => (el as HTMLAnchorElement).href),
    );
    for (const href of hrefs) {
      let url: URL;
      try {
        url = new URL(href);
      } catch {
        continue;
      }
      // Skip external links and non-http schemes (mailto:, tel:, etc.).
      if (url.origin !== origin || !url.protocol.startsWith("http")) continue;
      url.hash = "";
      seen.add(url.toString());
    }
  }

  // Zero links found would mean the pages did not render, not that they are clean.
  expect(seen.size, "same-origin links collected").toBeGreaterThan(CRAWL_ROUTES.length);

  const broken: string[] = [];
  for (const url of seen) {
    const resp = await request.get(url);
    if (resp.status() !== 200) broken.push(`${resp.status()} ${url}`);
  }
  expect(broken, "broken same-origin links").toEqual([]);
});

// The six primary nav sections (see src/lib/nav.ts). The header has no
// hamburger: every nav link must be visible at mobile with no interaction.
const NAV_SECTIONS = ["about", "packages", "blog", "merch", "learning", "supper-club"];

test("primary nav links are all visible at mobile width", async ({ page }) => {
  const width = page.viewportSize()?.width ?? 0;
  test.skip(width > 500, "mobile viewport only");

  await page.goto(`${BASE}/`, { waitUntil: "load" });

  for (const section of NAV_SECTIONS) {
    // `:visible` resolves to the shown copy if the header renders more than one
    // (e.g. a desktop row hidden at this width). Locate inside the header
    // landmark by href so the assertion survives copy/class changes.
    const link = page.locator(`header a[href$="/${section}/"]:visible`).first();
    await expect(link, `nav link "${section}" visible`).toBeVisible();
    await expect(link, `nav link "${section}" enabled`).toBeEnabled();
  }

  // The two header CTAs must also be present without interaction.
  await expect(
    page.locator(`header a[href$="/book/"]:visible`).first(),
    "Book a Session CTA visible",
  ).toBeVisible();
  await expect(
    page.locator(`header a[href$="/contact/"]:visible`).first(),
    "Contact Us CTA visible",
  ).toBeVisible();
});

// Without this, a translated CTA label could wrap the header pills to two
// lines on a phone, or the desktop action bar could grow to three rows, and
// nothing else would notice: the per-route suite only samples locales. A
// one-line pill is its 44px min-height (a second line adds 20px); from `sm`
// up the pill is nowrap, so only the 390 leg can catch a wrapped label. The
// bar's nav wraps between the Book and Contact pills, and two rows is the
// most the longest labels (Tamil, Malayalam) need at 1280.
test("header CTA pills stay one line at 390 and the nav at most two rows at 1280, every locale", async ({
  page,
}) => {
  const width = page.viewportSize()?.width ?? 0;
  test.skip(width <= 500, "runs once, in the desktop project");
  test.slow();
  const problems: string[] = [];
  let checked = 0;
  for (const row of LOCALE_TABLE) {
    for (const [vw, vh] of [
      [390, 844],
      [1280, 800],
    ] as const) {
      await page.setViewportSize({ width: vw, height: vh });
      await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      const found = await page.evaluate(() => {
        const shown = (el: Element) => (el as HTMLElement).offsetParent !== null;
        const pills = [
          ...document.querySelectorAll('header a[href$="/book/"], header a[href$="/contact/"]'),
        ]
          .filter(shown)
          .map((el) => ({
            text: el.textContent?.trim() ?? "",
            height: Math.round(el.getBoundingClientRect().height),
          }));
        const nav = [...document.querySelectorAll("header nav")].find(shown);
        const rows = new Set(
          [...(nav?.querySelectorAll("a") ?? [])].map((a) =>
            Math.round(a.getBoundingClientRect().top),
          ),
        ).size;
        return { pills, rows };
      });
      // Both CTAs and the nav render at every width; fewer means the header
      // did not paint, and a missing nav would otherwise pass the row bound.
      expect(found.pills.length, `header CTA pills on ${row.code} at ${vw}`).toBe(2);
      expect(found.rows, `nav rows on ${row.code} at ${vw}`).toBeGreaterThanOrEqual(1);
      checked++;
      if (vw === 390) {
        for (const pill of found.pills) {
          if (pill.height > 44)
            problems.push(`${row.code} at 390: "${pill.text}" is ${pill.height}px tall`);
        }
      }
      if (vw === 1280 && found.rows > 2)
        problems.push(`${row.code} at 1280: nav wraps to ${found.rows} rows`);
    }
  }
  expect(problems, "header pills wrapping or nav past two rows").toEqual([]);
  expect(checked, "locale and width pairs measured").toBe(LOCALE_TABLE.length * 2);
});

/** Horizontal overflow of the header and the document, in CSS pixels. */
async function overflowAt(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    const de = document.documentElement;
    return {
      header: header ? header.scrollWidth - header.clientWidth : -1,
      document: de.scrollWidth - de.clientWidth,
    };
  });
}

// Narrowest supported width: the page must not introduce horizontal overflow,
// closed or with the language picker open, in the default locale, in Hindi,
// and in a right-to-left locale: the first three sample rows. The footer email
// is the longest unbroken run on the page, and the open picker panel is
// absolutely positioned at the inline end, so a wrong `end-0` (or a panel
// wider than the viewport) shows up here.
for (const row of SAMPLE_LOCALES.slice(0, 3)) {
  test(`no horizontal overflow at 320px, picker closed and open: ${row.code}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
    // A page whose footer failed to render has no email to spill; make sure it is there.
    await expect(page.locator('footer a[href^="mailto:"]')).toBeVisible();

    const closed = await overflowAt(page);
    expect(closed.header, "header scrollWidth exceeds its client width").toBeLessThanOrEqual(1);
    expect(closed.document, "document overflows horizontally at 320px").toBeLessThanOrEqual(1);

    await page.locator("details[data-language-picker]:visible summary").first().click();
    await expect(page.locator("details[data-language-picker][open]:visible")).toHaveCount(1);
    const open = await overflowAt(page);
    expect(open.document, "document overflows with the language picker open").toBeLessThanOrEqual(
      1,
    );
  });
}

// Without this, the open picker panel could sink behind page content again:
// its z-index only orders it against the page when no ancestor forms a
// stacking context, and the desktop wrapper once did (a translate used for
// vertical centring), which let the hero photo cover the open menu. So no
// ancestor between the panel and <body> may form one, in either direction.
for (const row of SAMPLE_LOCALES.slice(0, 3)) {
  test(`the language panel's z-index is not trapped by an ancestor: ${row.code}`, async ({
    page,
  }) => {
    await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
    await page.locator("details[data-language-picker]:visible summary").first().click();
    const panel = page.locator("details[data-language-picker][open]:visible > div");
    await expect(panel).toHaveCount(1);
    const contexts = await panel.evaluate((el) => {
      const found: string[] = [];
      for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
        const cs = getComputedStyle(node);
        // Tailwind's translate, rotate, and scale utilities set the individual
        // transform properties, which form a stacking context like `transform`.
        const reasons = [
          cs.transform !== "none" && `transform ${cs.transform}`,
          cs.translate !== "none" && `translate ${cs.translate}`,
          cs.rotate !== "none" && `rotate ${cs.rotate}`,
          cs.scale !== "none" && `scale ${cs.scale}`,
          cs.position !== "static" && cs.zIndex !== "auto" && `z-index ${cs.zIndex}`,
          cs.opacity !== "1" && `opacity ${cs.opacity}`,
          cs.filter !== "none" && `filter ${cs.filter}`,
          cs.isolation !== "auto" && `isolation ${cs.isolation}`,
        ].filter((reason) => reason !== false);
        if (reasons.length > 0)
          found.push(`${node.tagName.toLowerCase()}.${node.className}: ${reasons.join(", ")}`);
      }
      return found;
    });
    expect(contexts, "ancestors forming a stacking context above the language panel").toEqual([]);
  });
}

// Without this, the language menu could join the scroll reveal again (it is a
// `.card`, and site.ts once selected every `.card`): the panel would open at
// opacity 0 and fade in over half a second. The rest of the suite runs with
// reduced motion, where the reveal never starts, so this block opts back in.
// The heading is the control that the reveal did run on this page.
test.describe("with motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });
  const row = DEFAULT_LOCALE;
  test(`the language menu is not a scroll-reveal target: ${row.code}`, async ({ page }) => {
    await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
    const heading = page.locator("main h1[data-reveal]").first();
    await expect(heading, "reveal ran on the page heading").toHaveClass(/reveal-pending/);
    await page.locator("details[data-language-picker]:visible summary").first().click();
    const panel = page.locator("details[data-language-picker][open]:visible > div");
    await expect(panel).toHaveCount(1);
    await expect(panel, "panel joined the reveal").not.toHaveClass(/reveal-pending/);
    const opacity = await panel.evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity, "panel opacity right after opening").toBe("1");
  });
});

// Without these, the browser-language redirect in Base.astro could stop firing,
// fire on the wrong pages, or override a visitor's choice, and only a visitor
// would notice. In the "stays" tests the short wait after `load` is the real
// negative: a `location.replace` issued while the head is parsed can commit
// after `load` fires, so URL equality right after `goto` alone would pass even
// when a redirect had been decided.
test.describe("language detection", () => {
  const storedLanguage = (page: Page) =>
    page.evaluate((key) => localStorage.getItem(key), LANGUAGE_STORAGE_KEY);

  test.describe("browser set to Hindi", () => {
    test.use({ locale: "hi-IN" });
    test("the English home and a deep page redirect to Hindi, and nothing is remembered", async ({
      page,
    }) => {
      await page.goto(`${BASE}/`);
      await expect(page).toHaveURL(`${BASE}/hi/`);
      expect(await storedLanguage(page), "nothing remembered").toBeNull();
      await page.goto(`${BASE}/about/`);
      await expect(page).toHaveURL(`${BASE}/hi/about/`);
    });
    test("a remembered choice of English wins over the browser language", async ({ page }) => {
      await page.goto(`${BASE}/hi/`, { waitUntil: "load" });
      await page.evaluate((key) => localStorage.setItem(key, "en"), LANGUAGE_STORAGE_KEY);
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      await page.waitForTimeout(200);
      await expect(page).toHaveURL(`${BASE}/`);
    });
    test("the 404 page, which exists in no locale, stays", async ({ page }) => {
      await page.goto(`${BASE}/no-such-page/`, { waitUntil: "load" });
      await page.waitForTimeout(200);
      await expect(page).toHaveURL(`${BASE}/no-such-page/`);
    });
    test("a language picked before window load, while images still load, is remembered", async ({
      page,
    }) => {
      // Never answer the image requests, so window load (and with it
      // astro:page-load) does not fire during the test.
      await page.route("**/*.webp", () => {});
      await page.goto(`${BASE}/hi/`, { waitUntil: "domcontentloaded" });
      await page.locator("details[data-language-picker]:visible summary").first().click();
      await page.locator('details[data-language-picker][open]:visible a[data-locale="en"]').click();
      await expect(page).toHaveURL(`${BASE}/`);
      expect(await storedLanguage(page), "remembered language").toBe("en");
    });
  });

  test.describe("browser set to French", () => {
    test.use({ locale: "fr-CA" });
    test("a localized page never redirects", async ({ page }) => {
      await page.goto(`${BASE}/hi/`, { waitUntil: "load" });
      await page.waitForTimeout(200);
      await expect(page).toHaveURL(`${BASE}/hi/`);
    });
  });

  test.describe("browser set to English", () => {
    test.use({ locale: "en-GB" });
    test("the English home stays", async ({ page }) => {
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      await page.waitForTimeout(200);
      await expect(page).toHaveURL(`${BASE}/`);
    });
    test("a choice made after a soft navigation is applied when the router returns to a page it already ran the script on", async ({
      page,
    }) => {
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      await page.locator(`nav a[href="${BASE}/about/"]:visible`).first().click();
      await expect(page).toHaveURL(`${BASE}/about/`);
      await page.evaluate((key) => localStorage.setItem(key, "hi"), LANGUAGE_STORAGE_KEY);
      await page.goBack();
      await expect(page).toHaveURL(`${BASE}/hi/`);
    });
    test("picking a language in the menu is remembered and applied on the next visit", async ({
      page,
    }) => {
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      await page.locator("details[data-language-picker]:visible summary").first().click();
      await page.locator('details[data-language-picker][open]:visible a[data-locale="hi"]').click();
      await expect(page).toHaveURL(`${BASE}/hi/`);
      expect(await storedLanguage(page), "remembered language").toBe("hi");
      await page.goto(`${BASE}/`);
      await expect(page).toHaveURL(`${BASE}/hi/`);
      await page.locator("details[data-language-picker]:visible summary").first().click();
      await page.locator('details[data-language-picker][open]:visible a[data-locale="en"]').click();
      await expect(page).toHaveURL(`${BASE}/`);
      expect(await storedLanguage(page), "remembered language").toBe("en");
    });
  });

  test.describe("browser set to a language the site lacks", () => {
    test.use({ locale: "ja-JP" });
    test("the English home stays", async ({ page }) => {
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      await page.waitForTimeout(200);
      await expect(page).toHaveURL(`${BASE}/`);
    });
  });
});

// Without this, the privacy page could ship the literal "{date}" or a month
// that disagrees with PRIVACY_UPDATED: the dictionaries carry only the label,
// and only privacy.astro splices the formatted date in.
test.describe("privacy page shows the policy date from the constant", () => {
  for (const row of SAMPLE_LOCALES) {
    test(`last-updated line is the label around the formatted date: ${row.code}`, async ({
      page,
    }) => {
      await page.goto(`${localeBase(row)}/privacy/`, { waitUntil: "load" });
      const date = new Intl.DateTimeFormat(row.dateLocale, {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(PRIVACY_UPDATED));
      await expect(page.locator("[data-privacy-updated]")).toHaveText(
        dictionaries[row.code].pages.privacy.updated.replace("{date}", date),
      );
    });
  }
});

// Without this, the privacy page could become an orphan again: it is in
// CONTENT_PATHS, so the route suite loads it, but nothing else asserts a page
// links to it. The footer is on every page, so the home page stands for all.
for (const row of SAMPLE_LOCALES) {
  test(`footer links to the locale's privacy page: ${row.code}`, async ({ page }) => {
    await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
    const link = page.locator(`footer a[href="${localeBase(row)}/privacy/"]`);
    await expect(link, "footer privacy link").toHaveCount(1);
    await expect(link).toBeVisible();
    await expect(link, "privacy link has a label").not.toHaveText("");
  });
}

// Without this, a blog post could go back to ending on "book a session or just
// say hello" as plain text with "Back to blog" as its only link, or the pills
// under it could point into the default locale's tree instead of the reader's.
// The welcome post exists in every locale, so it stands for every post.
for (const row of SAMPLE_LOCALES) {
  test(`a blog post ends with Book and Contact pills into its own locale: ${row.code}`, async ({
    page,
  }) => {
    await page.goto(`${localeBase(row)}/blog/welcome/`, { waitUntil: "load" });
    const cta = page.locator("[data-post-cta]");
    await expect(cta, "one CTA row under the post").toHaveCount(1);
    for (const target of ["book/", "contact/"]) {
      const pill = cta.locator(`a[href="${localeBase(row)}/${target}"]`);
      await expect(pill, `pill to ${target} in the ${row.code} tree`).toHaveCount(1);
      await expect(pill).toBeVisible();
      await expect(pill, `pill to ${target} has a label`).not.toHaveText("");
    }
  });
}

// Without this, a tighter footer row pitch would again leave neighbouring
// links overlapping hit areas (the old 33px rows gave a finger 33px per link,
// the next row's `.tap` pseudo-element covering the rest). Probed with
// elementFromPoint down the column centred on each footer link, under a
// coarse pointer at phone width; the crisis note's two tel: links have their
// own suite below, across every locale.
test.describe("footer links each own a 44px tap column at 390px", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  for (const row of SAMPLE_LOCALES.slice(0, 3)) {
    test(`every footer link is hit for 44px and covered by no other link: ${row.code}`, async ({
      page,
    }) => {
      await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
      // Control: the `.tap` rule is behind (pointer: coarse); without it the
      // probe below would measure the bare links and prove nothing.
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);

      const links = await page.evaluate(() => {
        const out: { text: string; hit: number; coveredBy: string | null }[] = [];
        for (const a of document.querySelectorAll<HTMLAnchorElement>("footer a[href]")) {
          a.scrollIntoView({ block: "center" });
          const r = a.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          // The hit test works on whole pixel rows, so the rows the link owns
          // are counted over a window wider than its 44px column: a neighbour
          // reaching into that column shows up as fewer than 44 rows.
          let hit = 0;
          let coveredBy: string | null = null;
          for (let y = Math.floor(cy - 30); y <= Math.ceil(cy + 30); y++) {
            const el = document.elementFromPoint(cx, y);
            if (el === a || a.contains(el)) hit++;
            // Another link hit on a row wholly inside this link's own box is
            // covering it (a row the box only partly spans belongs to whoever
            // the pixel snapping gives it to).
            else if (
              y >= Math.ceil(r.top) &&
              y < Math.floor(r.bottom) &&
              el?.closest("a") &&
              !coveredBy
            ) {
              coveredBy = el.closest("a")?.textContent?.trim() ?? "another link";
            }
          }
          out.push({ text: a.textContent?.trim() ?? "", hit, coveredBy });
        }
        return out;
      });
      // The footer alone carries at least the phone, WhatsApp, email, the
      // socials, the privacy link, and the two helpline numbers.
      expect(links.length, "footer links found").toBeGreaterThanOrEqual(8);
      for (const link of links) {
        expect(link.hit, `tap column of "${link.text}" in px`).toBeGreaterThanOrEqual(44);
        expect(link.coveredBy, `"${link.text}" covered by`).toBeNull();
      }
    });
  }
});

// Without this, the two Tele-MANAS tel: links could again be 18px lines
// inside the wrapping crisis paragraph, and a translation that wraps {short}
// onto one line and {full} onto the next would let a tap at the bottom of the
// first number dial the second. Each link is a real 44px box that enlarges
// its line, so the two boxes never share rows; every locale's wording is
// measured because each wraps differently.
test.describe("the crisis note's two tel: links are 44px tall and never overlap, every locale", () => {
  // The mobile project's 390px viewport, with a coarse pointer added.
  test.use({ hasTouch: true });
  test.skip(({ viewport }) => (viewport?.width ?? 0) > 500, "runs once, in the mobile project");

  for (const row of LOCALE_TABLE) {
    test(`${row.code}`, async ({ page }) => {
      await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
      expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
      const links = await page.evaluate(() => {
        // Boxes in document coordinates, so the scroll per link does not matter.
        const out: {
          text: string;
          top: number;
          bottom: number;
          left: number;
          right: number;
          hit: number;
        }[] = [];
        for (const a of document.querySelectorAll<HTMLAnchorElement>(
          "footer [data-crisis-note] a[href^='tel:']",
        )) {
          a.scrollIntoView({ block: "center" });
          const r = a.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          let hit = 0;
          for (let y = Math.floor(cy - 30); y <= Math.ceil(cy + 30); y++) {
            const el = document.elementFromPoint(cx, y);
            if (el === a || a.contains(el)) hit++;
          }
          out.push({
            text: a.textContent?.trim() ?? "",
            top: r.top + scrollY,
            bottom: r.bottom + scrollY,
            left: r.left,
            right: r.right,
            hit,
          });
        }
        return out;
      });
      expect(links.length, "tel: links in the crisis note").toBe(2);
      for (const link of links) {
        expect(link.bottom - link.top, `box of "${link.text}"`).toBeGreaterThanOrEqual(44);
        expect(link.hit, `rows a finger hits on "${link.text}"`).toBeGreaterThanOrEqual(44);
      }
      const [a, b] = links;
      if (!a || !b) return; // the count above already failed
      const overlap = a.bottom > b.top && b.bottom > a.top && a.right > b.left && b.right > a.left;
      expect(overlap, `the two tel: boxes overlap: ${JSON.stringify([a, b])}`).toBe(false);
    });
  }
});

// Without this, a wider picker label or a larger logo could collide at the
// narrowest supported width: the mobile brand row pins its controls to the
// edges and centers the logo between them, so nothing else measures the gap.
for (const row of SAMPLE_LOCALES.slice(0, 3)) {
  test(`brand-row controls clear the logo at 320px: ${row.code}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });

    const logo = await page.locator("header a img:visible").first().boundingBox();
    expect(logo, "visible header logo").not.toBeNull();
    if (!logo) return;

    const picker = page.locator("details[data-language-picker]:visible summary").first();
    const pickerBox = await picker.boundingBox();
    expect(pickerBox, "visible picker trigger").not.toBeNull();
    expect(pickerBox?.width ?? 0, "picker trigger width below sm").toBeLessThanOrEqual(44);

    const controls = page.locator(
      "header a[aria-label]:visible, header details[data-language-picker]:visible summary",
    );
    const count = await controls.count();
    expect(count, "brand-row controls found").toBeGreaterThan(0);
    const margin = 4;
    for (let i = 0; i < count; i++) {
      const box = await controls.nth(i).boundingBox();
      if (!box) continue;
      // A control inside the logo's vertical band must sit entirely to one side.
      const verticallyOverlaps = box.y < logo.y + logo.height && box.y + box.height > logo.y;
      if (!verticallyOverlaps) continue;
      const clearsLeft = box.x + box.width + margin <= logo.x;
      const clearsRight = box.x >= logo.x + logo.width + margin;
      expect(
        clearsLeft || clearsRight,
        `control ${i} at x=${box.x}..${box.x + box.width} overlaps logo x=${logo.x}..${logo.x + logo.width}`,
      ).toBe(true);
    }
  });
}

// Without this, a phone number, email, URL, handle, or copyright line added
// without dir="ltr" renders reordered on right-to-left pages and nothing else
// notices (AGENTS.md, rule 5). Text runs are matched by shape, so a
// translated sentence never trips it; the phone inputs are checked by their
// tel role.
const RTL_LOCALE = LOCALE_TABLE.find((row) => row.dir === "rtl") ?? DEFAULT_LOCALE;

test(`Latin and digit runs are isolated with dir="ltr" on RTL pages: ${RTL_LOCALE.code}`, async ({
  page,
}) => {
  test.skip(RTL_LOCALE.dir !== "rtl", "the locale table has no right-to-left row");
  const unisolated: string[] = [];
  for (const path of ["/", "/contact/", "/book/", "/packages/", "/privacy/"]) {
    await page.goto(`${localeBase(RTL_LOCALE)}${path}`, { waitUntil: "load" });
    const found = await page.evaluate(() => {
      // Anywhere in the node, so a run after a label in the same text node is
      // seen: a phone number (five or more digits joined by spaces or hyphens,
      // optional +), an email, a URL, a social handle, or a copyright sign.
      const shape = /\+?\d(?:[\s-]?\d){4,}|[\w.+-]+@[\w-]+\.|www\.|https?:\/\/|@\w|©/;
      const hits: { text: string; isolated: boolean }[] = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const el = node.parentElement;
        if (!el || el.closest("script, style")) continue;
        const text = node.textContent?.trim() ?? "";
        if (!shape.test(text)) continue;
        hits.push({ text, isolated: el.closest('[dir="ltr"]') !== null });
      }
      // Footer splits the address around a <wbr>, so no single text node above
      // matches the email branch (the handle branch still catches the "@gmail.com"
      // half); reading each mailto link whole makes the email branch itself live.
      for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]')) {
        const text = (link.textContent ?? "").replace(/\s+/g, "");
        if (!shape.test(text)) continue;
        hits.push({
          text,
          isolated:
            link.closest('[dir="ltr"]') !== null || link.querySelector('[dir="ltr"]') !== null,
        });
      }
      for (const input of document.querySelectorAll<HTMLInputElement>(
        'input[type="tel"], input[inputmode="tel"]',
      )) {
        hits.push({ text: `<input ${input.id}>`, isolated: input.closest('[dir="ltr"]') !== null });
      }
      return hits;
    });
    // The footer alone carries a phone, an email, a URL, handles, and the
    // copyright line, so a page that rendered without them is a failure here,
    // not a vacuous pass.
    expect(found.length, `Latin/digit runs found on ${path}`).toBeGreaterThan(4);
    for (const hit of found) if (!hit.isolated) unisolated.push(`${path}: ${hit.text}`);
  }
  expect(unisolated, "runs without a dir=ltr ancestor").toEqual([]);
});

// Without this, a phone typed as letters would again be reported as a missing
// reply channel ("give us a phone number or an email") while the dictionary's
// phoneFormat message stayed unused: only the form's script decides which
// message a field carries. Submissions are blocked at the network layer, so a
// validation that failed to hold would not reach FormSubmit from a test.
for (const row of [DEFAULT_LOCALE, RTL_LOCALE]) {
  test(`a phone typed as letters reports the format message, not the reply hint: ${row.code}`, async ({
    page,
  }) => {
    await page.route("**/formsubmit.co/**", (route) => route.abort());
    await page.goto(`${localeBase(row)}/contact/`, { waitUntil: "load" });
    const { form: copy } = dictionaries[row.code];
    const phone = page.locator("#cf-num");
    const message = () => phone.evaluate((el: HTMLInputElement) => el.validationMessage);

    await page.locator("#cf-name").fill("Test");
    await page.locator("#cf-message").fill("Hello");
    // Control: with no phone and no email the phone field carries the reply hint.
    expect(await message(), "empty phone and email").toBe(copy.replyHint);

    await phone.fill("abc");
    await page.locator("button[type=submit]").click();
    expect(await message(), "letters in the phone").toBe(copy.phoneFormat);
    await expect(phone, "the browser stopped at the phone field").toBeFocused();
    await expect(page, "the submit was blocked").toHaveURL(
      new RegExp(`${localeBase(row)}/contact/$`),
    );

    // A number-shaped phone clears both messages.
    await phone.fill("7009 597 939");
    expect(await message(), "a real phone").toBe("");
  });
}

// An unknown path serves the 404 page with a real 404 status (base-path aware).
test("unknown path serves the 404 page", async ({ page }) => {
  const resp = await page.goto(`${BASE}/this-route-does-not-exist-xyz/`, {
    waitUntil: "load",
  });
  expect(resp?.status(), "unknown path status").toBe(404);
  await expect(page.locator("h1, h2").first()).toBeVisible();
});

// GitHub Pages serves the one English 404.html for every path, so a 404 under
// a locale tree would keep an English header, footer, title, and <html lang>
// unless the page's own script turns them; nothing at build time can. These
// pin that turn for a left-to-right and a right-to-left locale, that the
// script is what does it, and that without JavaScript the English page stands.
test.describe("a 404 under a locale tree takes that locale's chrome", () => {
  const rows = LOCALE_TABLE.filter((row) => row.code === "hi" || row.code === "ur");
  const notFoundTitle = (row: LocaleRow) =>
    `${dictionaries[row.code].ui.not_found_title} · ${BRAND}`;
  // The header's home links, not the picker's link to the same locale's home.
  const homeLink = (page: Page, row: LocaleRow) =>
    page.locator(`header a[href="${localeBase(row)}/"]:not([data-locale])`).first();

  for (const row of rows) {
    test(`${row.code}: lang, dir, script, chrome links, title, and picker label follow the row`, async ({
      page,
    }) => {
      const resp = await page.goto(`${localeBase(row)}/no-such-page/`, { waitUntil: "load" });
      expect(resp?.status(), "status").toBe(404);
      const html = page.locator("html");
      await expect(html).toHaveAttribute("lang", row.htmlLang);
      await expect(html).toHaveAttribute("dir", row.dir);
      await expect(html).toHaveAttribute("data-script", row.script);
      await expect(page).toHaveTitle(notFoundTitle(row));

      // The home link and the privacy link moved into the locale's tree, and
      // no header or footer link outside the picker stayed in the English one.
      await expect(homeLink(page, row)).toBeAttached();
      await expect(page.locator(`footer a[href="${localeBase(row)}/privacy/"]`)).toHaveCount(1);
      const strayed = await page.locator(`a[href^="${BASE}/"]`).evaluateAll(
        (links, tree) =>
          links
            .filter((a) => !a.closest("[data-language-picker], [data-language-homes]"))
            .map((a) => a.getAttribute("href"))
            .filter((href) => !href?.startsWith(tree)),
        `${localeBase(row)}/`,
      );
      expect(strayed, "page links left in the English tree").toEqual([]);

      // The header reads in the locale, and the picker names it.
      await expect(page.locator("header nav a").first()).toHaveText(
        dictionaries[row.code].ui.nav_about,
      );
      // Without this, the footer's crisis note could silently stay English on
      // a localized 404, or lose its tap-to-call links, while every other
      // chrome string translated: it is the one string refilled through the
      // footer's data-crisis hooks rather than matched by text.
      const note = page.locator("footer [data-crisis-note]");
      await expect(note).toHaveText(
        fill(dictionaries[row.code].ui.crisis_note, {
          short: CRISIS.number,
          full: CRISIS.fullNumber,
        }),
      );
      await expect(note.locator(`a[href="${CRISIS.numberHref}"]`)).toHaveText(CRISIS.number);
      await expect(note.locator(`a[href="${CRISIS.fullNumberHref}"]`)).toHaveText(
        CRISIS.fullNumber,
      );
      await expect(
        page.locator("details[data-language-picker] summary span[lang]").first(),
      ).toHaveText(row.label);
      await expect(
        page.locator(`details[data-language-picker] a[data-locale="${row.code}"]`).first(),
      ).toHaveAttribute("aria-current", "page");
    });
  }

  // The ClientRouter runs an inline script once per session unless it is
  // marked to rerun, and it swaps a 404 response like any page. Leaving a
  // localized 404 by its home pill and coming back must turn the chrome again.
  test("a soft navigation back into the 404 turns the chrome again", async ({ page }) => {
    const row = rows[0] as LocaleRow;
    await page.goto(`${localeBase(row)}/no-such-page/`, { waitUntil: "load" });
    await expect(page.locator("html")).toHaveAttribute("lang", row.htmlLang);
    // The URL is in place before the router fires astro:page-load (on the
    // traverse back, even before the swap), so each step waits for the
    // page-load count, not for the URL.
    type Counted = Window & { pageLoads: number };
    await page.evaluate(() => {
      (window as unknown as Counted).pageLoads = 0;
      document.addEventListener("astro:page-load", () => {
        (window as unknown as Counted).pageLoads += 1;
      });
    });
    const pageLoads = (count: number) =>
      page.waitForFunction((n) => (window as unknown as Counted).pageLoads === n, count);
    await page
      .locator(`main a[href="${localeBase(row)}/"]`)
      .first()
      .click();
    await pageLoads(1);
    await expect(page).toHaveURL(`${localeBase(row)}/`);
    await page.goBack();
    await pageLoads(2);
    await expect(page).toHaveURL(`${localeBase(row)}/no-such-page/`);
    await expect(page.locator("html")).toHaveAttribute("lang", row.htmlLang);
    await expect(homeLink(page, row)).toBeAttached();
    await expect(page).toHaveTitle(notFoundTitle(row));
  });

  // Control for the lang assertion above: the same page with its locale payload
  // hidden from the script stays English, so a green run above means the
  // script ran, not that the attribute was already there.
  test("with the locale payload hidden from the script, the chrome stays English", async ({
    page,
  }) => {
    const row = rows[0] as LocaleRow;
    let hidden = false;
    await page.route(`**${localeBase(row)}/no-such-page/`, async (route) => {
      const response = await route.fetch();
      const html = await response.text();
      const cut = html.replace('id="not-found-locales"', 'id="not-found-locales-off"');
      hidden = cut !== html;
      await route.fulfill({ response, body: cut });
    });
    await page.goto(`${localeBase(row)}/no-such-page/`, { waitUntil: "load" });
    expect(hidden, "the payload element was found and renamed").toBe(true);
    await expect(page.locator("html")).toHaveAttribute("lang", DEFAULT_LOCALE.htmlLang);
    await expect(page).toHaveTitle(notFoundTitle(DEFAULT_LOCALE));
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("the English chrome, the 404 status, and every language's home link stand", async ({
      page,
    }) => {
      const row = rows[0] as LocaleRow;
      const resp = await page.goto(`${localeBase(row)}/no-such-page/`, { waitUntil: "load" });
      expect(resp?.status(), "status").toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", DEFAULT_LOCALE.htmlLang);
      await expect(page).toHaveTitle(notFoundTitle(DEFAULT_LOCALE));
      await expect(homeLink(page, DEFAULT_LOCALE)).toBeAttached();
      await expect(page.locator(`footer a[href="${BASE}/privacy/"]`)).toHaveCount(1);
      await expect(page.locator("main [data-language-homes] a")).toHaveCount(LOCALE_TABLE.length);
    });
  });
});

// Pricing and booking. The currency switch is pure CSS (:has() on a checked
// radio), so the switching test runs with JavaScript disabled: a regression
// that quietly started depending on a script would fail here.
test.describe("packages and booking", () => {
  test("six price rows show INR and hide USD and GBP by default", async ({ page }) => {
    await page.goto(`${BASE}/packages/`, { waitUntil: "load" });
    const rows = page.locator("li:has([data-currency])");
    await expect(rows).toHaveCount(6);

    const inr = page.locator('[data-currency="INR"]');
    await expect(inr).toHaveCount(6);
    for (const price of await inr.all()) await expect(price).toBeVisible();
    await expect(inr.first()).toHaveText("₹1,500");

    for (const code of ["USD", "GBP"]) {
      const prices = page.locator(`[data-currency="${code}"]`);
      await expect(prices, `${code} rendered for every row`).toHaveCount(6);
      for (const price of await prices.all()) {
        await expect(price, `${code} hidden by default`).toBeHidden();
      }
    }
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("checking the USD radio shows USD prices and hides INR", async ({ page }) => {
      await page.goto(`${BASE}/packages/`, { waitUntil: "load" });
      await page.locator('label[for="currency-usd"]').click();
      await expect(page.locator("#currency-usd")).toBeChecked();

      const usd = page.locator('[data-currency="USD"]');
      await expect(usd).toHaveCount(6);
      for (const price of await usd.all()) await expect(price).toBeVisible();
      await expect(usd.first()).toHaveText("$30");
      const inr = page.locator('[data-currency="INR"]');
      await expect(inr).toHaveCount(6);
      for (const price of await inr.all()) {
        await expect(price, "INR hidden once USD is chosen").toBeHidden();
      }
    });
  });

  // The three session cards each carry a "From" line filled from PRICING; a
  // card wired without its note would still render and still link out.
  test("book page has a booking link and a starting price per session type", async ({ page }) => {
    await page.goto(`${BASE}/book/`, { waitUntil: "load" });
    const external = page.locator('main a[target="_blank"][href^="https://calendar.app.google/"]');
    // Three session types and the free consultation, each its own card.
    await expect(external).toHaveCount(4);
    await expect(page.locator("main article p", { hasText: /^From ₹/ })).toHaveText([
      "From ₹1,500",
      "From ₹2,000",
      "From ₹2,500",
    ]);
  });

  test("packages page does not overflow horizontally at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`${BASE}/packages/`, { waitUntil: "load" });
    // A blank or 404 page has no overflow either; make sure the prices rendered.
    await expect(page.locator("li:has([data-currency])")).toHaveCount(6);
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth - de.clientWidth;
    });
    expect(overflow, "document overflows horizontally at 320px").toBeLessThanOrEqual(1);
  });

  // Without this, the two halves of a dual-digit price ("₹۱٬۵۰۰" and
  // "(₹1,500)") could wrap inside the 3xl price cell on a phone, or the
  // package pill could run to five lines in Nastaliq, and nothing else would
  // notice: the per-route suite samples locales and the overflow test above
  // only measures the page width. Pinned for every locale whose row names a
  // non-Latin numbering system: the native half of each visible price is one
  // line box and the package pill at most two, at 320 and 390; the Western
  // half sits under the native half on a phone and after it in the writing
  // direction at 1280, so a right-to-left page reads native then bracket and
  // never bracket then native. On the booking page the featured card's "from"
  // price and the consultation button's label carry the same pair, and there
  // the Western half follows the native half on the same line at every width:
  // the two spans share a line because the no-break space sits inside the
  // Western span and nothing breakable separates them, so a wrap between them
  // or a bracket-first reading would mean the card stopped rendering pieces.
  // The default locale is the control: one line, no Western half, on both
  // pages. Line boxes are counted from the text's client rects, not from
  // height over line-height, because Nastaliq's content area is twice its
  // line-height and a one-line Urdu price stands 75px tall in a 36px line.
  test("dual-digit prices keep the native half on one line and the pill within two, on packages and the booking card, every non-Latin locale", async ({
    page,
  }) => {
    const width = page.viewportSize()?.width ?? 0;
    test.skip(width <= 500, "runs once, in the desktop project");
    test.slow();
    const dualRows = LOCALE_TABLE.filter((row) => row.numberingSystem !== "latn");
    expect(dualRows.length, "locales with non-Latin digits").toBeGreaterThan(0);
    const problems: string[] = [];
    const measure = async (row: LocaleRow, vw: number, path: "/packages/" | "/book/") => {
      await page.setViewportSize({ width: vw, height: 844 });
      await page.goto(`${localeBase(row)}${path}`, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      return page.evaluate(() => {
        // Distinct line boxes of an element's text. A rect starts a new line
        // when its top is at least half the element's line-height below the
        // line's first rect; rect heights are no guide, since Nastaliq's
        // content area spans two lines of its own line-height and would
        // swallow a wrapped second line.
        const lineBoxes = (el: Element) => {
          const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
          const range = document.createRange();
          range.selectNodeContents(el);
          const tops = [...range.getClientRects()]
            .filter((r) => r.width > 0 && r.height > 0)
            .map((r) => r.top)
            .sort((a, b) => a - b);
          let lines = 0;
          let lineTop = Number.NEGATIVE_INFINITY;
          for (const top of tops) {
            if (top - lineTop >= lineHeight / 2) {
              lines++;
              lineTop = top;
            }
          }
          return lines;
        };
        const rtl = getComputedStyle(document.documentElement).direction === "rtl";
        // Where the Western half sits: beside the native half (no horizontal
        // overlap), before or after it in reading order and how far apart, or
        // under it, with how far its outer edge (the end edge of the page
        // direction, where text-end puts both) is from the native half's. A
        // margin or alignment on a dir="ltr" span resolves against that span's
        // own direction, so the gap would be 0 and the offset 30px in Urdu.
        const place = (n: DOMRect, w: DOMRect) => {
          const beside = w.right <= n.left + 1 || w.left >= n.right - 1;
          if (!beside) {
            const offset = Math.abs(rtl ? w.left - n.left : w.right - n.right);
            return { where: w.top > n.top ? "below" : "overlapping", gap: 0, offset };
          }
          const after = rtl ? w.right <= n.left + 1 : w.left >= n.right - 1;
          const gap = rtl ? n.left - w.right : w.left - n.right;
          return { where: after ? "after" : "before", gap, offset: 0 };
        };
        const textBox = (el: Element) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          return range.getBoundingClientRect();
        };
        const shown = (el: Element) => (el as HTMLElement).offsetParent !== null;
        // One element holding a digit pair: how its halves sit and wrap.
        const measureCell = (cell: Element) => {
          const native = cell.querySelector('[data-digits="native"]');
          const western = cell.querySelector('[data-digits="western"]');
          // The text's own box, not the span's: a block span fills the
          // column whichever edge its text is aligned to.
          const n = native && textBox(native);
          const w = western && textBox(western);
          return {
            text: cell.textContent?.replace(/\s+/g, " ").trim() ?? "",
            nativeLines: native ? lineBoxes(native) : 0,
            cellLines: lineBoxes(cell),
            hasWestern: western !== null,
            placement: !n || !w ? { where: "none", gap: 0, offset: 0 } : place(n, w),
          };
        };
        const prices = [...document.querySelectorAll("li [data-currency]")].filter(shown);
        // The booking page's pairs: the featured card's "from" price (the first
        // note) and the consultation card's button label. Null on packages.
        const note = document.querySelector('[data-booking="note"]');
        const cta = document.querySelector('#consultation [data-booking="cta"]');
        return {
          rtl,
          prices: prices.map(measureCell),
          pills: [...document.querySelectorAll("li .pill-coral")].map((pill) => ({
            text: pill.textContent?.replace(/\s+/g, " ").trim() ?? "",
            lines: lineBoxes(pill),
          })),
          booking: {
            note: note && measureCell(note),
            cta: cta && measureCell(cta),
          },
        };
      });
    };
    for (const row of dualRows) {
      for (const vw of [320, 390, 1280]) {
        const found = await measure(row, vw, "/packages/");
        // Six visible prices and three pills render at every width; fewer
        // means the page did not paint and the bounds below would pass empty.
        expect(found.prices.length, `visible prices on ${row.code} at ${vw}`).toBe(6);
        expect(found.pills.length, `package pills on ${row.code} at ${vw}`).toBe(3);
        expect(found.rtl, `direction of ${row.code}`).toBe(row.dir === "rtl");
        for (const price of found.prices) {
          if (!price.hasWestern)
            problems.push(`${row.code} at ${vw}: "${price.text}" has no Western half`);
          if (price.nativeLines !== 1)
            problems.push(
              `${row.code} at ${vw}: "${price.text}" native half is ${price.nativeLines} lines`,
            );
          const { where, gap, offset } = price.placement;
          const expected = vw < 640 ? "below" : "after";
          if (where !== expected)
            problems.push(
              `${row.code} at ${vw}: "${price.text}" Western half is ${where}, not ${expected}`,
            );
          // Under the native half its outer edge lines up with it; after it, the
          // price cell's 4px margin separates the two boxes (the no-break space
          // sits inside the Western half's own box and adds nothing between them).
          if (where === "below" && offset > 1)
            problems.push(
              `${row.code} at ${vw}: "${price.text}" Western half sits ${offset}px in from the native edge`,
            );
          if (where === "after" && gap < 3)
            problems.push(
              `${row.code} at ${vw}: "${price.text}" Western half is ${gap}px from the native half`,
            );
        }
        if (vw < 640) {
          for (const pill of found.pills) {
            if (pill.lines > 2)
              problems.push(`${row.code} at ${vw}: pill "${pill.text}" is ${pill.lines} lines`);
          }
        }
        const { note, cta } = (await measure(row, vw, "/book/")).booking;
        // Both hooks render on every booking page; a missing one means the
        // page did not paint or the card lost its pieces.
        expect(note, `featured card price on ${row.code}/book at ${vw}`).not.toBeNull();
        expect(cta, `consultation button on ${row.code}/book at ${vw}`).not.toBeNull();
        for (const [what, cell] of [
          ["from price", note],
          ["consultation button", cta],
        ] as const) {
          if (!cell) continue;
          if (!cell.hasWestern)
            problems.push(`${row.code}/book at ${vw}: ${what} "${cell.text}" has no Western half`);
          if (cell.nativeLines !== 1)
            problems.push(
              `${row.code}/book at ${vw}: ${what} "${cell.text}" native half is ${cell.nativeLines} lines`,
            );
          if (cell.placement.where !== "after")
            problems.push(
              `${row.code}/book at ${vw}: ${what} "${cell.text}" Western half is ${cell.placement.where}, not after`,
            );
        }
      }
    }
    const control = await measure(DEFAULT_LOCALE, 390, "/packages/");
    expect(control.prices.length, "visible prices in the default locale").toBe(6);
    for (const price of control.prices) {
      if (price.hasWestern || price.cellLines !== 1)
        problems.push(
          `${DEFAULT_LOCALE.code} at 390: "${price.text}" is ${price.cellLines} lines, Western half ${price.hasWestern}`,
        );
    }
    const controlBooking = (await measure(DEFAULT_LOCALE, 390, "/book/")).booking;
    expect(controlBooking.note, "featured card price in the default locale").not.toBeNull();
    expect(controlBooking.cta, "consultation button in the default locale").not.toBeNull();
    for (const cell of [controlBooking.note, controlBooking.cta]) {
      if (cell?.hasWestern)
        problems.push(`${DEFAULT_LOCALE.code}/book at 390: "${cell.text}" has a Western half`);
    }
    expect(problems, "dual-digit prices or pills wrapping, or the Western half misplaced").toEqual(
      [],
    );
  });
});

// Images and icons. Each test pins a fact the source does not state: that two
// attributes generated in different places agree, or that a file the head
// points at is really served as the type the tag claims.
test.describe("images and icons", () => {
  // The preload in <head> and the hero <img> are rendered from the same
  // constants, but only the built HTML shows they produced one candidate list.
  // If they diverged the browser would download the photo twice.
  test("the hero preload names exactly the candidates the hero image renders", async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    const preload = page.locator('link[rel="preload"][as="image"]');
    await expect(preload).toHaveCount(1);
    const hero = page.locator("main img[fetchpriority=high]");
    await expect(hero).toHaveCount(1);
    expect(await preload.getAttribute("imagesrcset")).toBe(await hero.getAttribute("srcset"));
    expect(await preload.getAttribute("imagesizes")).toBe(await hero.getAttribute("sizes"));
  });

  // A phone at 2x used to be handed the largest (900w) candidate because the
  // sizes value overstated the slot. The slot at 390px is 350px wide, so the
  // browser should now settle on the 750w candidate.
  test("a 2x phone picks the 750w hero candidate", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      const hero = page.locator("main img[fetchpriority=high]");
      const srcset = (await hero.getAttribute("srcset")) ?? "";
      const candidate750 = srcset
        .split(",")
        .map((c) => c.trim().split(/\s+/))
        .find(([, descriptor]) => descriptor === "750w")?.[0];
      expect(candidate750, "srcset carries a 750w candidate").toBeTruthy();
      const currentSrc = await hero.evaluate((img) => (img as HTMLImageElement).currentSrc);
      expect(new URL(currentSrc).pathname).toBe(candidate750);
    } finally {
      await context.close();
    }
  });

  // The og:image tags describe a file in public/ by hand; nothing at build time
  // checks that the file exists, is served as the declared type, or has the
  // declared dimensions. 1200 x 630 is the card size the sharing platforms
  // recommend, an external fact the tags alone do not carry.
  test("the social preview image is served at the declared type and size", async ({
    page,
    request,
  }) => {
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    const content = (selector: string) => page.locator(selector).getAttribute("content");
    const ogImage = await content('meta[property="og:image"]');
    expect(ogImage).toBeTruthy();
    const width = Number(await content('meta[property="og:image:width"]'));
    const height = Number(await content('meta[property="og:image:height"]'));
    expect([width, height]).toEqual([1200, 630]);
    expect(await content('meta[property="og:image:alt"]')).toBeTruthy();

    // The tag holds an absolute URL on the configured site origin; fetch the
    // same path from the preview server and read the PNG header (IHDR holds
    // width and height as big-endian 32-bit integers at bytes 16 and 20).
    const resp = await request.get(new URL(ogImage ?? "").pathname);
    expect(resp.status()).toBe(200);
    expect(resp.headers()["content-type"]).toContain(
      await content('meta[property="og:image:type"]'),
    );
    const body = await resp.body();
    expect(body.subarray(1, 4).toString("latin1")).toBe("PNG");
    expect(body.readUInt32BE(16)).toBe(width);
    expect(body.readUInt32BE(20)).toBe(height);
    expect(body.length, "og-image.png stays under the 150 KB budget").toBeLessThan(150_000);
  });

  // Open Graph joins a locale's parts with underscores (language_TERRITORY);
  // htmlLang joins them with BCP 47 hyphens. The rows with a subtag are the
  // ones that could leak a hyphen into the tag.
  test("og:locale is in Open Graph shape on every page whose htmlLang has a subtag", async ({
    page,
  }) => {
    const rows = LOCALE_TABLE.filter((row) => row.htmlLang.includes("-"));
    expect(rows.length, "the locale table has a row with a subtag").toBeGreaterThan(0);
    for (const row of rows) {
      await page.goto(`${localeBase(row)}/`, { waitUntil: "load" });
      const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute("content");
      expect(ogLocale, `og:locale on ${row.code}`).toMatch(/^[a-z]{2,3}(_[A-Za-z0-9]{2,8})+$/);
      // The tag is this page's language, not one constant on every page.
      expect(ogLocale?.split("_")[0]).toBe(row.htmlLang.split("-")[0]);
    }
  });

  // Browsers request /favicon.ico on their own whenever no <link rel="icon">
  // matches (address-bar bookmarks, some RSS readers). It used to be a 404
  // page; it must be a real icon container.
  test("/favicon.ico is a real ICO file", async ({ request }) => {
    const resp = await request.get(`${BASE}/favicon.ico`);
    expect(resp.status()).toBe(200);
    expect(resp.headers()["content-type"]).toMatch(/^image\/(x-icon|vnd\.microsoft\.icon)/);
    const body = await resp.body();
    // ICONDIR: reserved 0, type 1 (icon), then the image count.
    expect(body.readUInt16LE(0)).toBe(0);
    expect(body.readUInt16LE(2)).toBe(1);
    expect(body.readUInt16LE(4)).toBeGreaterThanOrEqual(2);
  });
});

// Without this, a page could ship a literal "{minutes}" or "{price}": fill()
// hands a token back unchanged when the page passes no value for it, and the
// dictionary test proves only that every language carries the same tokens as
// English, not that every page fills them. The sweep reads dist, the tree the
// preview server serves, so it covers every built page without a browser and
// runs in one project only: the mobile run would read the same files.
test("no built page carries an unfilled {token} placeholder", () => {
  test.skip(test.info().project.name !== "desktop", "runs once, in the desktop project");
  const dist = fileURLToPath(new URL("../dist/", import.meta.url));
  const files = readdirSync(dist, { recursive: true, encoding: "utf8" }).filter((name) =>
    name.endsWith(".html"),
  );
  // Every locale builds a book page that splices a token, so fewer files than
  // locales means the sweep is reading the wrong tree.
  expect(files.length, "built pages found").toBeGreaterThan(LOCALE_TABLE.length);
  // The detector matches a token as the dictionaries write it.
  expect("{minutes}".match(PLACEHOLDER)).toEqual(["{minutes}"]);
  const leaks: string[] = [];
  for (const file of files) {
    // Inline scripts are dropped: the language redirect is code, and the 404
    // page's script carries its dictionary strings as data the sweep does not
    // reach. Styles carry no prose. The JSON-LD block keeps its dictionary
    // strings and stays.
    const text = readFileSync(join(dist, file), "utf8")
      .replace(/<script(?![^>]*ld\+json)[^>]*>[\s\S]*?<\/script>/g, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");
    for (const [token] of text.matchAll(PLACEHOLDER)) {
      leaks.push(`${file}: ${token}`);
    }
  }
  expect(leaks, "unfilled placeholders in built HTML").toEqual([]);
});
