// The six primary sections, rendered by NavPills. `path` is locale-relative,
// so always run it through localizePath() before it becomes an href.
import type { UiKey } from "../i18n/ui";

export interface NavItem {
  key: UiKey;
  id: string;
  /** Locale-relative page path (no leading slash, trailing slash). */
  path: string;
}

export const NAV_ITEMS = [
  { key: "nav_about", id: "about", path: "about/" },
  { key: "nav_packages", id: "packages", path: "packages/" },
  { key: "nav_blog", id: "blog", path: "blog/" },
  { key: "nav_merch", id: "merch", path: "merch/" },
  { key: "nav_learning", id: "learning", path: "learning/" },
  { key: "nav_supper_club", id: "supper-club", path: "supper-club/" },
] as const satisfies readonly NavItem[];

/** The `active` prop of Base, Header, and NavPills: one of the ids above, so a
 *  page cannot name a section that has no pill. */
export type NavId = (typeof NAV_ITEMS)[number]["id"];
