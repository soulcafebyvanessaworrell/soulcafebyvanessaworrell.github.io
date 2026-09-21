// The founder photo is the LCP element on both home pages. The <head> preload
// and the hero <Image> must share these exact values so the browser coalesces
// them into one request; both locale pages import from here so they cannot drift.
import { getImage } from "astro:assets";
import { founder } from "./assets";

export const HERO_SIZES = "(min-width: 1024px) 40vw, (min-width: 640px) 60vw, 90vw";
export const HERO_WIDTHS = [400, 640, 900];
export const HERO_FORMAT = "webp" as const;

export const getHeroPreload = () =>
  getImage({ src: founder, widths: HERO_WIDTHS, format: HERO_FORMAT });
