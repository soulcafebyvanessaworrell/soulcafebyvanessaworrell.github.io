import { expect, test } from "bun:test";
import type { VersionEntry } from "../../scripts/pages-site.mts";
import { robotsTxt } from "./robots";

// A deploy's tier list, the root tier's own path among them.
const versions: VersionEntry[] = [
  { kind: "root", label: "v0.2.0", path: "/site/" },
  { kind: "latest", label: "latest", path: "/site/latest/" },
  { kind: "version", label: "v0.2.0", path: "/site/v0.2.0/" },
  { kind: "version", label: "v0.1.0", path: "/site/v0.1.0/" },
];
const origin = "https://example.test";

// Without this, the root tier could list its own base among the Disallow
// lines (the tier list carries it too) and keep every crawler off the
// production site, or drop a tier and let a duplicate copy be indexed. The
// Disallow paths are absolute on the origin because that is where the tiers
// live, not below the root's own base.
test("the root tier allows itself, disallows each other tier, and names its sitemap", () => {
  expect(robotsTxt({ staging: false, versions, base: "/site/", origin })).toBe(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /site/latest/",
      "Disallow: /site/v0.2.0/",
      "Disallow: /site/v0.1.0/",
      "",
      "Sitemap: https://example.test/site/sitemap-index.xml",
      "",
    ].join("\n"),
  );
  // A local build has no tier list and nothing to disallow.
  expect(robotsTxt({ staging: false, versions: [], base: "/preview/", origin })).toBe(
    [
      "User-agent: *",
      "Allow: /",
      "",
      "Sitemap: https://example.test/preview/sitemap-index.xml",
      "",
    ].join("\n"),
  );
});

// Without this, a non-root tier could advertise a sitemap or allow a path,
// and a crawler that ignores the per-page noindex would index latest/.
test("a non-root tier disallows everything and advertises no sitemap, whatever the tier list says", () => {
  for (const base of ["/site/latest/", "/site/v0.1.0/"]) {
    expect(robotsTxt({ staging: true, versions, base, origin })).toBe(
      "User-agent: *\nDisallow: /\n",
    );
  }
});
