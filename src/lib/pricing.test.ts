import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LOCALES } from "../i18n/locales";
import { dictionaries } from "../i18n/ui";
import { CURRENCIES, formatPrice, OFFERS, SESSION_TYPES } from "./pricing";

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

// The pages fill placeholders from PRICING: {price} in packages.meta.description
// and book.from, {minutes} in each booking card description, {n} and {h} {m} in
// the duration templates. A translation that drops one would ship a stale
// number or lose the minutes, and the parity test compares key sets, not text.
describe("dictionary copy keeps the placeholders the pages fill from PRICING", () => {
  for (const locale of LOCALES) {
    test(`${locale}`, () => {
      const { packages, book } = dictionaries[locale].pages;
      const required: [string, string, string[]][] = [
        ["packages.meta.description", packages.meta.description, ["{price}"]],
        ["packages.duration.minutes", packages.duration.minutes, ["{n}"]],
        ["packages.duration.hours", packages.duration.hours, ["{h}", "{m}"]],
        ["book.from", book.from, ["{price}"]],
        ...SESSION_TYPES.map((type): [string, string, string[]] => [
          `book.cards.${type}.description`,
          book.cards[type].description,
          ["{minutes}"],
        ]),
      ];
      const missing = required
        .filter(([, text, tokens]) => tokens.some((token) => !text.includes(token)))
        .map(([path]) => path);
      expect(missing).toEqual([]);
    });
  }
});

// External fact: ICU renders en-GB and hi-IN with Latin digits, narrowSymbol
// gives the bare symbol everywhere, including the Italian "INR" case (other
// locales keep their own numerals, which is intended), and useGrouping "always"
// puts the separator in a four-digit Spanish amount, which ICU's default drops
// under both Bun and Node (Italian differs only under Node). This pins Bun's
// ICU, which `bun test` runs under; the build runs `astro build` under Node,
// whose ICU is pinned by the smoke test's English literals against the built
// HTML.
describe("formatPrice per locale", () => {
  const cases = [
    ["en-GB", "INR", 1500, "₹1,500"],
    ["en-GB", "INR", 12500, "₹12,500"],
    ["hi-IN", "INR", 1500, "₹1,500"],
    ["en-GB", "GBP", 25, "£25"],
    ["hi-IN", "USD", 30, "$30"],
    ["en-GB", "USD", 30, "$30"],
    ["it-IT", "INR", 12500, "12.500\u00a0₹"],
    ["es-ES", "INR", 1500, "1.500\u00a0₹"],
    ["bn-IN", "INR", 1500, "₹১,৫০০"],
  ] as const;
  for (const [dateLocale, currency, amount, expected] of cases) {
    test(`${amount} ${currency} in ${dateLocale} is ${expected}`, () => {
      expect(formatPrice(amount, currency, dateLocale)).toBe(expected);
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
