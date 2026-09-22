import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SCRIPT_TAG = /<script\b([^>]*)>/g;
/** A data block (JSON, JSON-LD) runs nothing and needs no marker. */
const DATA_TYPE = /\btype=["']application\/(?:ld\+)?json["']/;

type InlineScript = { line: number; rerun: boolean };

function runningInlineScripts(source: string): InlineScript[] {
  const found: InlineScript[] = [];
  for (const match of source.matchAll(SCRIPT_TAG)) {
    const attrs = match[1] ?? "";
    if (!/\bis:inline\b/.test(attrs) || DATA_TYPE.test(attrs)) continue;
    found.push({
      line: source.slice(0, match.index).split("\n").length,
      rerun: /\bdata-astro-rerun\b/.test(attrs),
    });
  }
  return found;
}

describe("runningInlineScripts", () => {
  test("lists each running inline script by line with its marker, and no data, bundled, or src script", () => {
    const source = [
      "<html>",
      '<script type="application/ld+json" set:html={JSON.stringify(x)} is:inline />',
      "<script is:inline>",
      "  console.log(1);",
      "</script>",
      "<script",
      "  is:inline",
      "  data-astro-rerun",
      "  define:vars={{ base }}",
      ">",
      "  console.log(base);",
      "</script>",
      "<script is:inline>c()</script>",
      '<script type="application/json" id="data" set:html={payload} is:inline />',
      '<script type="module" is:inline>m()</script>',
      "<script>",
      "  import { x } from './x';",
      "</script>",
      '<script src="../scripts/site.ts"></script>',
      "</html>",
    ].join("\n");
    expect(runningInlineScripts(source)).toEqual([
      { line: 3, rerun: false },
      { line: 6, rerun: true },
      { line: 13, rerun: false },
      { line: 15, rerun: false },
    ]);
  });
});

/** Every .astro file below `dir`, as paths relative to it. */
function astroFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(".astro"))
    .sort();
}

// Without this, a new inline script would run once per session under the
// ClientRouter and silently ignore every later soft navigation: Astro replays
// a `<script is:inline>` only when it carries `data-astro-rerun`, and nothing
// at build time says a script lacks it. Two scripts have needed the marker
// (the language redirect in Base.astro and the 404 page's localizer).
test("every inline script that runs code carries data-astro-rerun", () => {
  const src = import.meta.dir;
  const files = astroFiles(src);
  expect(files.length, ".astro files found").toBeGreaterThan(1);
  const scripts = files.flatMap((file) =>
    runningInlineScripts(readFileSync(join(src, file), "utf8")).map((script) => ({
      ...script,
      where: `${file}:${script.line}`,
    })),
  );
  // The redirect script alone makes this non-empty; zero would mean the tag
  // regex stopped matching real tags, not that every script is marked.
  expect(scripts.length, "running inline scripts found").toBeGreaterThan(0);
  const missing = scripts.filter((script) => !script.rerun).map((script) => script.where);
  expect(missing, "inline scripts without data-astro-rerun").toEqual([]);
});
