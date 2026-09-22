import { expect, test } from "bun:test";
import { webManifest } from "./manifest";

// The manifest is what the browser installs the site from. Without this, a
// tier build (latest/, vX.Y.Z/) or a custom-domain cutover could ship a
// start_url or scope still pointing at another tier's base, an icon path
// outside the scope, or a doubled slash in an icon path at a root base. The
// tier fact is pinned by prefix, not by reading `scope: base` back: a
// manifest that hardcoded start_url and scope would fail for the tier base.
test("start_url and scope start with the tier's base, and every icon sits inside the scope with no doubled slash", () => {
  for (const base of ["/", "/repo/", "/repo/latest/"]) {
    const { scope, start_url, icons } = webManifest(base);
    expect(start_url.startsWith(base), `${start_url} under the tier base ${base}`).toBe(true);
    expect(scope.startsWith(base), `${scope} under the tier base ${base}`).toBe(true);
    expect(start_url.startsWith(scope), `${start_url} inside ${scope}`).toBe(true);
    expect(icons.length).toBeGreaterThan(0);
    for (const icon of icons) {
      expect(icon.src.startsWith(scope), `${icon.src} inside ${scope}`).toBe(true);
      expect(icon.src.includes("//"), `${icon.src} has no doubled slash`).toBe(false);
    }
  }
});
