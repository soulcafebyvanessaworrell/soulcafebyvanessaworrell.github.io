import type { APIRoute } from "astro";
import type { VersionsIndex } from "../../scripts/pages-site.mts";
import { SITE_BASE, SITE_ORIGIN } from "../lib/constants";

// On a GitHub Pages project site this is served under the base path, so it is
// advisory only (the per-page meta noindex guards the non-root tiers); at a
// root deploy it is authoritative.
const noindexTier = !!process.env.ASTRO_STAGING;

// Paths of the other published tiers (latest/, vX.Y.Z/), from the
// tier list the deploy script passes. The root tier disallows each of them so
// only one copy of the site is crawled. Unset in a local build.
const raw = process.env.SITE_VERSIONS;
const otherTiers: string[] = raw
  ? (JSON.parse(raw) as VersionsIndex).versions
      .map((entry) => entry.path)
      .filter((path) => path !== SITE_BASE)
  : [];

export const GET: APIRoute = () => {
  // Non-root tiers disallow everything; the root allows all but the other tiers
  // and advertises the sitemap.
  const lines = noindexTier
    ? ["User-agent: *", "Disallow: /", ""]
    : [
        "User-agent: *",
        "Allow: /",
        ...otherTiers.map((path) => `Disallow: ${path}`),
        "",
        `Sitemap: ${SITE_ORIGIN}${SITE_BASE}sitemap-index.xml`,
        "",
      ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
