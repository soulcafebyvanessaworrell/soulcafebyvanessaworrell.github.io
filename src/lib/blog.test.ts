import type { CollectionEntry } from "astro:content";
import { describe, expect, test } from "bun:test";
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
