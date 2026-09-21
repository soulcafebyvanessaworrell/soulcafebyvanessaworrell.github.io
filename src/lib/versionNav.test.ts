import { describe, expect, test } from "bun:test";
import type { VersionEntry } from "../../scripts/pages-site.mts";
import { currentVersion, parseVersions, showsVersionNav, versionText } from "./versionNav";

const versions: VersionEntry[] = [
  { kind: "root", label: "v0.2.0", path: "/site/" },
  { kind: "latest", label: "latest", path: "/site/latest/" },
  { kind: "stable", label: "v0.2.0", path: "/site/stable/" },
  { kind: "version", label: "v0.2.0", path: "/site/v0.2.0/" },
  { kind: "version", label: "v0.1.0", path: "/site/v0.1.0/" },
];
const parsed = parseVersions(JSON.stringify({ versions }));

// Without these, the switcher would appear on the production root or on a
// local build, where SITE_VERSIONS is unset.
describe("the switcher renders only on a non-root tier of a deploy", () => {
  test("a build outside the deploy has no tiers and no current tier", () => {
    const outside = parseVersions(undefined);
    expect(outside).toEqual([]);
    expect(showsVersionNav(currentVersion(outside, "/preview/"))).toBe(false);
  });

  test("a base path the deploy does not list has no current tier", () => {
    expect(currentVersion(parsed, "/elsewhere/")).toBeUndefined();
  });

  test("the root tier is found but hidden", () => {
    const current = currentVersion(parsed, "/site/");
    expect(current?.kind).toBe("root");
    expect(showsVersionNav(current)).toBe(false);
  });

  // The template marks the current tier with aria-current by identity, so the
  // helper has to hand back the list's own entry, not a copy.
  test("latest, stable, and tagged tiers show, as the list's own entry", () => {
    for (const path of ["/site/latest/", "/site/stable/", "/site/v0.1.0/"]) {
      const current = currentVersion(parsed, path);
      expect(parsed.includes(current!)).toBe(true);
      expect(showsVersionNav(current)).toBe(true);
    }
  });
});

// The tag always sits in `label`, alone, so the template can wrap exactly it in
// dir="ltr"; a translated word never lands inside that span.
describe("a tier's wording keeps the tag separate from the translated words", () => {
  const words = { production: "produzione", stable: "stabile" };

  test("root: tag then the production word in parentheses", () => {
    expect(versionText(versions[0]!, words)).toEqual({
      before: "",
      label: "v0.2.0",
      after: " (produzione)",
    });
  });

  test("stable: the stable word then the tag in parentheses", () => {
    expect(versionText(versions[2]!, words)).toEqual({
      before: "stabile (",
      label: "v0.2.0",
      after: ")",
    });
  });

  test("latest and tagged tiers: the bare label", () => {
    expect(versionText(versions[1]!, words)).toEqual({ before: "", label: "latest", after: "" });
    expect(versionText(versions[4]!, words)).toEqual({ before: "", label: "v0.1.0", after: "" });
  });
});
