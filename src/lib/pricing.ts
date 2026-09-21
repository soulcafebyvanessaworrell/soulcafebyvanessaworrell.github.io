// Session prices, the one place a number is written. Labels ("One session",
// "minutes", the type names) live in the dictionaries under pages.packages and
// pages.book, with {price} and {minutes} placeholders the pages fill from here,
// so a translation never carries a price and a price change never touches a
// translation. Base.astro reads OFFERS for the structured-data offers.

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
const PACKAGE_PAID_SESSIONS = 5;

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

/** A whole-unit price in the reader's own numerals and symbol placement, always
 *  with the bare symbol (₹, $, £): several European locales would otherwise
 *  print "INR" for a foreign currency. Grouping is forced so a four-digit
 *  amount reads like the five-digit one beside it ("1.500 ₹" next to
 *  "10.000 ₹"; Italian and a few others skip the separator below 10,000 by
 *  default). `dateLocale` is the locale table's BCP 47 tag
 *  (localeMeta(locale).dateLocale). */
export function formatPrice(amount: number, currency: Currency, dateLocale: string): string {
  return new Intl.NumberFormat(dateLocale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    useGrouping: "always",
  }).format(amount);
}

/** A plain count (minutes, hours) in the same numerals formatPrice uses for
 *  that locale, so a duration never mixes digit systems with the price beside it. */
export function formatNumber(value: number, dateLocale: string): string {
  return new Intl.NumberFormat(dateLocale).format(value);
}

/** Whole hours and leftover minutes of a session length, for the dictionary's
 *  duration templates. */
export function hoursAndMinutes(minutes: number): { hours: number; minutes: number } {
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}
