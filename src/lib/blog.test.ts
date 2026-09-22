import type { CollectionEntry } from "astro:content";
import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parseFrontmatter } from "astro/markdown";
import { DEFAULT_LOCALE, LOCALES } from "../i18n/locales";
import { blogSlug } from "./blog";

/** The two fields blogSlug reads, shaped as a collection entry. */
function post(id: string, locale: string): CollectionEntry<"blog"> {
  return { id, data: { locale } } as unknown as CollectionEntry<"blog">;
}

// Without this, a post saved as welcome-hi.md with `locale: de` would build at
// /de/blog/welcome-hi/, the file name taken whole as its slug, and a file
// named -hi.md would build as a post at the blog index's own URL. The content
// schema checks each field alone; only the join between file name and
// frontmatter says the two must agree.
describe("blogSlug", () => {
  test("takes the slug off a name whose suffix is the frontmatter locale", () => {
    expect(blogSlug(post("welcome-hi", "hi"))).toBe("welcome");
    // A slug may itself contain hyphens; only the last segment is the locale.
    expect(blogSlug(post("a-quiet-week-mai", "mai"))).toBe("a-quiet-week");
  });

  test("rejects a name whose suffix is not the frontmatter locale", () => {
    expect(() => blogSlug(post("welcome-hi", "de"))).toThrow(/must end with "-de"/);
    // No suffix at all fails the same way: a bare "welcome" is not "welcome-en".
    expect(() => blogSlug(post("welcome", "en"))).toThrow(/must end with "-en"/);
  });

  test("rejects a name that is only the suffix", () => {
    expect(() => blogSlug(post("-hi", "hi"))).toThrow(/empty slug/);
  });
});

// Without this, a locale whose welcome post was never written, or was left at
// `draft: true`, would render an empty blog index: the index has no empty
// state, and a build has nothing to fail on. The collection exists only
// inside a build, so the files are read here with the same file rule as the
// loader's glob (any depth, `.md`, no leading underscore) and Astro's own
// frontmatter parser, with the two defaults the schema declares.
test("every locale has at least one published post", () => {
  const dir = join(import.meta.dir, "..", "content", "blog");
  const files = readdirSync(dir, { recursive: true, encoding: "utf8" }).filter(
    (name) => name.endsWith(".md") && !basename(name).startsWith("_"),
  );
  const published = new Set<unknown>();
  for (const file of files) {
    const { frontmatter } = parseFrontmatter(readFileSync(join(dir, file), "utf8"));
    if (frontmatter.draft !== true) published.add(frontmatter.locale ?? DEFAULT_LOCALE);
  }
  expect(published.size, "published posts found").toBeGreaterThan(0);
  expect(
    LOCALES.filter((code) => !published.has(code)),
    "locales with no post",
  ).toEqual([]);
});
