// The six primary sections, shared by Header (mobile panel) and NavPills
// (desktop row). `key` is both the UI string key and the `active` id a page
// passes to highlight its own pill. `path` is locale-relative, so always run
// it through localizePath() before it becomes an href.
import type { UiKey } from "../i18n/ui";

export interface NavItem {
  key: UiKey;
  /** The `active` id used to mark the current section. */
  id: string;
  /** Locale-relative page path (no leading slash, trailing slash). */
  path: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "nav_about", id: "about", path: "about/" },
  { key: "nav_packages", id: "packages", path: "packages/" },
  { key: "nav_blog", id: "blog", path: "blog/" },
  { key: "nav_merch", id: "merch", path: "merch/" },
  { key: "nav_learning", id: "learning", path: "learning/" },
  { key: "nav_supper_club", id: "supper-club", path: "supper-club/" },
];
