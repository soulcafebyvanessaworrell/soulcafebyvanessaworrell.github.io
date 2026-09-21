// The version switcher's decisions, kept out of the component so they can be
// unit-tested without an Astro build: which tier this build is, whether the
// switcher shows at all, and how a tier is worded. The deploy script passes
// the tier list as SITE_VERSIONS (see scripts/pages-site.mts).

import type { VersionEntry, VersionsIndex } from "../../scripts/pages-site.mts";

/** The tier list from SITE_VERSIONS; empty outside the deploy. */
export function parseVersions(raw: string | undefined): VersionEntry[] {
  return raw ? (JSON.parse(raw) as VersionsIndex).versions : [];
}

/** The tier whose path is this build's base path. Returns the list's own entry,
 *  so the template can mark it current by identity. */
export function currentVersion(versions: VersionEntry[], base: string): VersionEntry | undefined {
  return versions.find((entry) => entry.path === base);
}

/** The root tier is the production site and never shows the switcher; neither
 *  does a build outside the deploy, where SITE_VERSIONS is unset. */
export function showsVersionNav(current: VersionEntry | undefined): current is VersionEntry {
  return current !== undefined && current.kind !== "root";
}

export interface VersionWords {
  production: string;
  stable: string;
}

/** A tier's wording in three parts, so the template can isolate the tag with
 *  dir="ltr" while the translated words around it follow the page direction. */
export interface VersionText {
  before: string;
  label: string;
  after: string;
}

export function versionText(entry: VersionEntry, words: VersionWords): VersionText {
  if (entry.kind === "root")
    return { before: "", label: entry.label, after: ` (${words.production})` };
  if (entry.kind === "stable")
    return { before: `${words.stable} (`, label: entry.label, after: ")" };
  return { before: "", label: entry.label, after: "" };
}
