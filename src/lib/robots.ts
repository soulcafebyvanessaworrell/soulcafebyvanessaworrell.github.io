// The robots.txt body. The deploy publishes several tiers of the site on one
// origin (the root, latest/, vX.Y.Z/; see scripts/pages-site.mts), and this
// file is what keeps crawlers to one copy.
import type { VersionEntry } from "../../scripts/pages-site.mts";

export interface RobotsInput {
  /** True on a non-root tier, which no crawler should index. */
  staging: boolean;
  /** Every published tier, this build's own included; empty outside the deploy. */
  versions: VersionEntry[];
  /** This build's base path, with one leading and one trailing slash. */
  base: string;
  /** The site origin without a trailing slash, for the sitemap line. */
  origin: string;
}

/** A non-root tier disallows everything. The root allows all but the other
 *  tiers, so only one copy of the site is crawled, and advertises the sitemap. */
export function robotsTxt({ staging, versions, base, origin }: RobotsInput): string {
  const lines = staging
    ? ["User-agent: *", "Disallow: /", ""]
    : [
        "User-agent: *",
        "Allow: /",
        ...versions
          .map((entry) => entry.path)
          .filter((path) => path !== base)
          .map((path) => `Disallow: ${path}`),
        "",
        `Sitemap: ${origin}${base}sitemap-index.xml`,
        "",
      ];
  return lines.join("\n");
}
