import { expect, type Page, test } from "@playwright/test";
import { LANGUAGE_STORAGE_KEY } from "../src/i18n/languageStorage";
import { LOCALE_TABLE, type LocaleMeta } from "../src/i18n/locales";
import { dictionaries } from "../src/i18n/ui";
import { PRIVACY_UPDATED, SITE_BASE } from "../src/lib/constants";

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

/** `<base>/<prefix>` for a locale row, so `${localeBase(row)}/about/` is a URL. */
function localeBase(row: LocaleMeta): string {
  return row.code === DEFAULT_LOCALE.code ? BASE : `${BASE}/${row.code}`;
}

// A representative sample of locales rather than all 29: the default, Hindi
// (the second fully translated locale), the first right-to-left row, and the
// first row of every other script. Every distinct rendering path is covered
// while the per-route suite stays quick.
const SAMPLE_LOCALES: LocaleMeta[] = (() => {
  const picked: LocaleMeta[] = [DEFAULT_LOCALE];
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
  const row = SAMPLE_LOCALES[0];
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

// An unknown path serves the 404 page with a real 404 status (base-path aware).
test("unknown path serves the 404 page", async ({ page }) => {
  const resp = await page.goto(`${BASE}/this-route-does-not-exist-xyz/`, {
    waitUntil: "load",
  });
  expect(resp?.status(), "unknown path status").toBe(404);
  await expect(page.locator("h1, h2").first()).toBeVisible();
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
});
