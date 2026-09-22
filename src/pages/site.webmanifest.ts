import type { APIRoute } from "astro";
import { SITE_BASE } from "../lib/constants";
import { webManifest } from "../lib/manifest";

export const GET: APIRoute = () =>
  new Response(JSON.stringify(webManifest(SITE_BASE), null, 2), {
    headers: { "Content-Type": "application/manifest+json" },
  });
