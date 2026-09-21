// Blog route helpers shared by the index and post pages, so the file-name
// convention lives in exactly one place.
import type { CollectionEntry } from "astro:content";

/**
 * URL slug for a post, taken from its file id. Posts are named
 * `<slug>-<locale>.md` (welcome-en.md, welcome-hi.md). The trailing
 * `-<locale>` must match the frontmatter `locale`, and an empty slug is
 * rejected. Collection ids are unique, so two posts in the same locale can
 * never share a slug.
 */
export function blogSlug(post: CollectionEntry<"blog">): string {
  const suffix = `-${post.data.locale}`;
  if (!post.id.endsWith(suffix)) {
    throw new Error(
      `Blog post "${post.id}.md" has locale "${post.data.locale}", so its file name must end with "${suffix}". Rename it to <slug>${suffix}.md.`,
    );
  }
  const slug = post.id.slice(0, -suffix.length);
  if (!slug) {
    throw new Error(`Blog post "${post.id}.md" has an empty slug. Put a name before "${suffix}".`);
  }
  return slug;
}

/** Posts grouped by slug, so a post page can tell which locales carry a
 *  translation of it (the group's locales) without a second collection pass. */
export function groupBySlug(
  posts: CollectionEntry<"blog">[],
): Map<string, CollectionEntry<"blog">[]> {
  const groups = new Map<string, CollectionEntry<"blog">[]>();
  for (const post of posts) {
    const slug = blogSlug(post);
    const group = groups.get(slug) ?? [];
    group.push(post);
    groups.set(slug, group);
  }
  return groups;
}

/** YYYY-MM-DD for <time datetime>. The blog schema pins pubDate to UTC midnight. */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
