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

// PREVIEW_PORT is read once, when the module loads, so each case below imports
// the module in a fresh process with its own environment, run by the same bun
// binary that runs this test. The parent's own PREVIEW_PORT is dropped first
// so the default case is really the default.
function previewPortIn(env: Record<string, string | undefined>) {
  const { PREVIEW_PORT: _dropped, ...inherited } = process.env;
  const child = Bun.spawnSync(
    [
      process.execPath,
      "-e",
      'import { PREVIEW_PORT } from "./constants"; console.log(PREVIEW_PORT);',
    ],
    { cwd: import.meta.dir, env: { ...inherited, ...env }, stdout: "pipe", stderr: "pipe" },
  );
  return {
    exitCode: child.exitCode,
    stdout: child.stdout.toString().trim(),
    stderr: child.stderr.toString(),
  };
}

// Without this, the preview port could silently stop following the environment
// (a refactor that reads the literal again), and two Playwright suites on one
// machine would collide on 4322 with nothing else to say why.
test("PREVIEW_PORT defaults to 4322 and follows the PREVIEW_PORT environment variable", () => {
  const byDefault = previewPortIn({});
  expect(byDefault.exitCode, byDefault.stderr).toBe(0);
  expect(byDefault.stdout).toBe("4322");

  const overridden = previewPortIn({ PREVIEW_PORT: "4399" });
  expect(overridden.exitCode, overridden.stderr).toBe(0);
  expect(overridden.stdout).toBe("4399");
});

// Without this, a mistyped PREVIEW_PORT could pass through as NaN or a
// truncated number, and the server, Playwright, and Lighthouse would each make
// their own sense of it; the constant must refuse instead, naming the variable.
test("PREVIEW_PORT rejects a value that is not an integer port, naming the variable", () => {
  for (const bad of ["abc", "43.99", "0", "70000", "4399x"]) {
    const result = previewPortIn({ PREVIEW_PORT: bad });
    expect(result.exitCode, `PREVIEW_PORT="${bad}" was accepted: ${result.stdout}`).not.toBe(0);
    expect(result.stderr, `error for PREVIEW_PORT="${bad}" does not name the variable`).toContain(
      "PREVIEW_PORT",
    );
    expect(result.stderr, `error for PREVIEW_PORT="${bad}" does not echo the value`).toContain(bad);
  }
});
