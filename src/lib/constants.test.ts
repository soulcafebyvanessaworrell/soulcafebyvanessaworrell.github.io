// CSS cannot import a TypeScript constant, so the mint brand colour is written
// twice: THEME_COLOR (the theme-color meta tag and the manifest) and the
// --color-mint token in styles.css (every mint surface). Without this test the
// browser chrome could tint to one mint while the header paints another.
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { THEME_COLOR } from "./constants";

test("--color-mint in styles.css equals THEME_COLOR", () => {
  const css = readFileSync(join(import.meta.dir, "..", "styles.css"), "utf8");
  const token = css.match(/--color-mint:\s*(#[0-9a-fA-F]{6})\s*;/);
  // Hex digits are case-insensitive, so #A9EFE3 is the same colour.
  expect(token?.[1]?.toLowerCase()).toBe(THEME_COLOR.toLowerCase());
});
