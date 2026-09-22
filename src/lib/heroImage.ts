// The founder photo is the LCP element of the home page. The <head> preload
// and the hero <Image> must share these exact values so the browser coalesces
// them into one request; both read from here so they cannot drift.
import { getImage } from "astro:assets";
import { founder } from "./assets";

// The slot follows the hero markup. At lg the photo column is 0.45 of the
// max-w-6xl container minus its sm:px-8 padding and the lg:gap-14 gap, so about
// 40vw until that caps at 29rem. Below lg it sits in a max-w-md (28rem) wrapper
// inside px-5 (2.5rem) gutters: 28rem from 488px up, the viewport minus the
// gutters below. A 2x phone at 390px (a 350px slot) then picks the 750w candidate.
export const HERO_SIZES =
  "(min-width: 1024px) min(40vw, 29rem), (min-width: 488px) 28rem, calc(100vw - 2.5rem)";
export const HERO_WIDTHS = [400, 640, 750, 900];
export const HERO_FORMAT = "webp" as const;

export const getHeroPreload = () =>
  getImage({ src: founder, widths: HERO_WIDTHS, format: HERO_FORMAT });
