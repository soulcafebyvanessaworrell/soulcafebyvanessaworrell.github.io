// Blog content collection. Posts are plain Markdown files under
// src/content/blog/, one file per post per language. A non-technical owner can
// publish by copying _template.md, filling the frontmatter, and committing.
//
// The glob pattern `**/[!_]*.md` skips any file whose name starts with an
// underscore, so _template.md is never loaded as a post (its frontmatter is
// illustrative, not real). `locale` reads its allowed values from LOCALES, so
// adding a language later needs no change here. A file is named
// `<slug>-<locale>.md`, and the same slug across locales is one post.

import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { DEFAULT_LOCALE, LOCALES, type SiteLocale } from "./i18n/locales";

const localeValues = [...LOCALES] as [SiteLocale, ...SiteLocale[]];

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/[!_]*.md" }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
        pubDate: z.coerce.date().refine((d) => d.getTime() % 86_400_000 === 0, {
          message: "pubDate must be a plain date (YYYY-MM-DD) with no time component.",
        }),
        locale: z.enum(localeValues).default(DEFAULT_LOCALE),
        draft: z.boolean().default(false),
        heroImage: image().optional(),
        heroImageAlt: z.string().trim().min(1).optional(),
      })
      // A hero image needs alt text to be meaningful; without it the image
      // would render as decorative (alt=""). Require the pair together.
      .refine((data) => !data.heroImage || Boolean(data.heroImageAlt), {
        message: "heroImageAlt is required when heroImage is set.",
        path: ["heroImageAlt"],
      }),
});

export const collections = { blog };
