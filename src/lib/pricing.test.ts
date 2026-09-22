import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { localeMeta, type SiteLocale } from "../i18n/locales";
import { fillPieces } from "../i18n/ui";
import {
  CURRENCIES,
  formatNumber,
  formatNumberParts,
  formatPrice,
  formatPriceParts,
  freeConsultationPieces,
  OFFERS,
} from "./pricing";

// Without this, a price typed as 1500.5 or 0 would type-check and then render
// as "₹1,501" or "₹0", since formatPrice rounds to whole units.
test("every offer prices every currency as a positive whole number", () => {
  const bad = OFFERS.flatMap((offer) =>
    CURRENCIES.filter((c) => !Number.isInteger(offer.price[c]) || offer.price[c] <= 0).map(
      (c) => `${offer.type} x${offer.sessions}.${c}`,
    ),
  );
  expect(bad).toEqual([]);
});

// External fact: ICU renders en-GB and hi-IN with Latin digits, narrowSymbol
// gives the bare symbol everywhere, including the Italian "INR" case, and
// useGrouping "always" puts the separator in a four-digit Spanish amount,
// which ICU's default drops under both Bun and Node (Italian differs only
// under Node). A locale whose table row names a non-Latin numbering system
// (Marathi, Bengali) shows its own digits first and the Western digits in
// brackets after a no-break space; a Latin-digit locale (German) shows the amount
// once. The Western repeat is formatted through the default locale's row, not
// the page locale's, so it reads "₹1,500" everywhere: Kashmiri would otherwise
// group it with the Arabic comma (U+060C) its CLDR data pairs with Latin
// digits, and Sindhi would put the symbol after the amount with a no-break
// space, as their native renderings here do. This pins Bun's ICU, which
// `bun test` runs under (it puts a no-break space after the Urdu rupee sign;
// Node's ICU does not); the build runs `astro build` under Node, whose ICU is
// pinned by the smoke test's English literals against the built HTML.
describe("formatPrice per locale", () => {
  const cases: readonly [SiteLocale, (typeof CURRENCIES)[number], number, string][] = [
    ["en", "INR", 1500, "₹1,500"],
    ["en", "INR", 12500, "₹12,500"],
    ["hi", "INR", 1500, "₹1,500"],
    ["en", "GBP", 25, "£25"],
    ["hi", "USD", 30, "$30"],
    ["en", "USD", 30, "$30"],
    ["it", "INR", 12500, "12.500\u00a0₹"],
    ["es", "INR", 1500, "1.500\u00a0₹"],
    ["de", "INR", 1500, "1.500\u00a0₹"],
    ["de", "INR", 12500, "12.500\u00a0₹"],
    ["bn", "INR", 1500, "₹১,৫০০\u00a0(₹1,500)"],
    ["mr", "INR", 1500, "₹१,५००\u00a0(₹1,500)"],
    ["mr", "INR", 12500, "₹१२,५००\u00a0(₹12,500)"],
    ["mr", "USD", 30, "$३०\u00a0($30)"],
    ["ur", "INR", 1500, "₹\u00a0۱٬۵۰۰\u00a0(₹1,500)"],
    ["ur", "INR", 12500, "₹\u00a0۱۲٬۵۰۰\u00a0(₹12,500)"],
    ["ks", "INR", 1500, "₹۱٬۵۰۰\u00a0(₹1,500)"],
    ["sd", "INR", 1500, "١٬٥٠٠\u00a0₹\u00a0(₹1,500)"],
  ];
  for (const [locale, currency, amount, expected] of cases) {
    test(`${amount} ${currency} in ${locale} is ${expected}`, () => {
      expect(formatPrice(amount, currency, localeMeta(locale))).toBe(expected);
    });
  }
});

// The pages render the two halves as separate spans, so the Western half must
// be absent, not "" or the native text, for a Latin-digit locale: either would
// render an empty or a doubled bracket. The formatPrice table above pins what
// the halves read; this pins the shape the template branches on.
describe("formatPriceParts and formatNumberParts", () => {
  test("a Latin-digit locale has only the native half", () => {
    expect(formatPriceParts(1500, "INR", localeMeta("de"))).toStrictEqual({
      native: "1.500\u00a0₹",
    });
    expect(formatNumberParts(50, localeMeta("en"))).toStrictEqual({ native: "50" });
  });
  test("a non-Latin locale has both halves", () => {
    expect(formatPriceParts(1500, "INR", localeMeta("mr"))).toEqual({
      native: "₹१,५००",
      western: "₹1,500",
    });
  });
});

// The pill label is rendered from pieces, and the pages mark up the one
// piece that is the number. This pins that the values key matches the
// dictionary's placeholder name: renamed on either side, the pill would show
// a literal {minutes} and no number piece. Every other locale carries the
// placeholder as often as English does (i18n.test.ts), so English is enough.
describe("freeConsultationPieces", () => {
  test("carries the minutes as exactly one value piece", () => {
    const numbers = freeConsultationPieces("en").filter((piece) => typeof piece !== "string");
    expect(numbers).toHaveLength(1);
  });
});

// fillPieces is the splitter every marked-up sentence goes through, and no
// page test reads its pieces: a splitter that dropped the text after the last
// placeholder, pushed "" between two adjacent ones (a stray text node in the
// template), or spliced a value into a string piece (a number the template
// could not mark up) would ship a sentence with words missing or a number in
// one digit system only.
describe("fillPieces", () => {
  const value = { native: "५", western: "5" };
  test("splits a sentence around its placeholders and keeps the values as values", () => {
    expect(fillPieces("Buy {paid}, get {free} free", { paid: value, free: value })).toEqual([
      "Buy ",
      value,
      ", get ",
      value,
      " free",
    ]);
  });
  test("adjacent placeholders, and one at either end, produce no empty text piece", () => {
    expect(fillPieces("{h}{m}", { h: value, m: value })).toEqual([value, value]);
    expect(fillPieces("{n} minutes", { n: value })).toEqual([value, " minutes"]);
    expect(fillPieces("From {price}", { price: value })).toEqual(["From ", value]);
  });
  test("a placeholder without a value stays literal", () => {
    expect(fillPieces("{a} and {b}", { a: "x" })).toEqual(["x", " and {b}"]);
  });
});

// Same dual-digit rule for the bare counts beside a price (minutes, sessions,
// ages), so "५० (50) मिनिटं" sits next to "₹१,५०० (₹1,500)" and a German page
// shows "50" once.
describe("formatNumber per locale", () => {
  const cases: readonly [SiteLocale, number, string][] = [
    ["de", 50, "50"],
    ["de", 1, "1"],
    ["en", 105, "105"],
    ["mr", 50, "५०\u00a0(50)"],
    ["mr", 1, "१\u00a0(1)"],
    ["mr", 105, "१०५\u00a0(105)"],
  ];
  for (const [locale, value, expected] of cases) {
    test(`${value} in ${locale} is ${expected}`, () => {
      expect(formatNumber(value, localeMeta(locale))).toBe(expected);
    });
  }
});

// The no-JS switch is CSS in styles.css written per currency by hand; nothing
// else ties those selectors to CURRENCIES. Without this, a currency added to
// the list would render a radio and a price column that never reveal, or one
// that reveals while the old column stays. Both rules are matched by their own
// selector text.
test("styles.css has a reveal rule for every currency", () => {
  const css = readFileSync(join(import.meta.dir, "..", "styles.css"), "utf8");
  const missing = CURRENCIES.filter((c) => {
    const checked = `:has(#currency-${c.toLowerCase()}:checked)`;
    const reveal = `${checked} [data-currency="${c}"]`;
    const hide = `${checked} [data-currency]:not([data-currency="${c}"])`;
    return !css.includes(reveal) || !css.includes(hide);
  });
  expect(missing).toEqual([]);
});
