import type { APIRoute } from "astro";
import { SITE_BASE, SITE_ORIGIN } from "../lib/constants";
import { robotsTxt } from "../lib/robots";
import { parseVersions } from "../lib/versionNav";

// On a GitHub Pages project site this is served under the base path, so it is
// advisory only (the per-page meta noindex guards the non-root tiers); at a
// root deploy it is authoritative. ASTRO_STAGING and SITE_VERSIONS are unset
// in a local build.
export const GET: APIRoute = () =>
  new Response(
    robotsTxt({
      staging: !!process.env.ASTRO_STAGING,
      versions: parseVersions(process.env.SITE_VERSIONS),
      base: SITE_BASE,
      origin: SITE_ORIGIN,
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
