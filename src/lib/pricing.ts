// Session prices and the other numbers the pages quote, the one place any of
// them is written. Labels ("One session", "minutes", the type names) live in
// the dictionaries under pages.packages and pages.book, with placeholders such
// as {price} and {minutes} the pages fill from here, so a translation never
// carries a number and a number change never touches a translation.
// Base.astro reads OFFERS for the structured-data offers.

import {
  type LocaleMeta,
  localeMeta,
  type NumberingSystem,
  type SiteLocale,
} from "../i18n/locales";
import { fill, t } from "../i18n/ui";
import { BOOKING } from "./constants";

export const CURRENCIES = ["INR", "USD", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Currency = "INR";

export const SESSION_TYPES = ["individual", "couples", "family"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

/** Which Google Calendar schedule books each session type. */
export const BOOKING_LINK: Record<SessionType, string> = {
  individual: BOOKING.session,
  couples: BOOKING.couples,
  family: BOOKING.family,
};

export type Prices = Record<Currency, number>;

const PACKAGE_SESSIONS = 6;
/** Sessions paid for in a package; the rest are free, as the packages pill says. */
export const PACKAGE_PAID_SESSIONS = 5;
export const PACKAGE_FREE_SESSIONS = PACKAGE_SESSIONS - PACKAGE_PAID_SESSIONS;

/** Length of the free introductory call. */
export const CONSULTATION_MINUTES = 15;

/** Age bands of the discounted groups on the packages page. */
export const DISCOUNT_AGES = {
  youth: { from: 18, to: 25 },
  senior: 60,
} as const;

export interface SessionPricing {
  minutes: number;
  single: Prices;
  package: Prices;
}

const BASE: Record<SessionType, Omit<SessionPricing, "package">> = {
  individual: { minutes: 50, single: { INR: 1500, USD: 30, GBP: 25 } },
  couples: { minutes: 80, single: { INR: 2000, USD: 40, GBP: 35 } },
  family: { minutes: 105, single: { INR: 2500, USD: 50, GBP: 45 } },
};

function packagePrice(single: Prices): Prices {
  return {
    INR: single.INR * PACKAGE_PAID_SESSIONS,
    USD: single.USD * PACKAGE_PAID_SESSIONS,
    GBP: single.GBP * PACKAGE_PAID_SESSIONS,
  };
}

export const PRICING: Record<SessionType, SessionPricing> = {
  individual: { ...BASE.individual, package: packagePrice(BASE.individual.single) },
  couples: { ...BASE.couples, package: packagePrice(BASE.couples.single) },
  family: { ...BASE.family, package: packagePrice(BASE.family.single) },
};

export interface Offer {
  type: SessionType;
  sessions: 1 | typeof PACKAGE_SESSIONS;
  price: Prices;
}

/** PRICING as flat rows in display order, for the structured data. */
export const OFFERS: readonly Offer[] = SESSION_TYPES.flatMap((type) => {
  const { single, package: pack } = PRICING[type];
  return [
    { type, sessions: 1, price: single },
    { type, sessions: PACKAGE_SESSIONS, price: pack },
  ];
});

/** Formats `amount` through `render` in the digits the locale row names and,
 *  when those are not Western, again in Western digits in round brackets after
 *  a space ("₹१,५०० (₹1,500)"), so a reader of either system finds the number. */
function dualDigits(
  amount: number,
  { dateLocale, numberingSystem }: LocaleMeta,
  render: (tag: string, numberingSystem: NumberingSystem) => Intl.NumberFormat,
): string {
  const native = render(dateLocale, numberingSystem).format(amount);
  if (numberingSystem === "latn") return native;
  return `${native} (${render(dateLocale, "latn").format(amount)})`;
}

/** A whole-unit price in the reader's own numerals and symbol placement, always
 *  with the bare symbol (₹, $, £): several European locales would otherwise
 *  print "INR" for a foreign currency. Grouping is forced so a four-digit
 *  amount reads like the five-digit one beside it ("1.500 ₹" next to
 *  "10.000 ₹"; Italian and a few others skip the separator below 10,000 by
 *  default). A locale whose digits are not Western repeats the price in
 *  Western digits in brackets (dualDigits). */
export function formatPrice(amount: number, currency: Currency, meta: LocaleMeta): string {
  return dualDigits(
    amount,
    meta,
    (tag, numberingSystem) =>
      new Intl.NumberFormat(tag, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
        maximumFractionDigits: 0,
        useGrouping: "always",
        numberingSystem,
      }),
  );
}

/** A plain count (minutes, hours, sessions, ages) in the same numerals
 *  formatPrice uses for that locale, so a duration never mixes digit systems
 *  with the price beside it, with the same Western repeat in brackets. */
export function formatNumber(value: number, meta: LocaleMeta): string {
  return dualDigits(
    value,
    meta,
    (tag, numberingSystem) => new Intl.NumberFormat(tag, { numberingSystem }),
  );
}

/** The "Free 15-minute consultation" pill label with the length filled in, for
 *  every page that links to the consultation. */
export function freeConsultationLabel(locale: SiteLocale): string {
  return fill(t(locale, "free_consultation"), {
    minutes: formatNumber(CONSULTATION_MINUTES, localeMeta(locale)),
  });
}

/** Whole hours and leftover minutes of a session length, for the dictionary's
 *  duration templates. */
export function hoursAndMinutes(minutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}
