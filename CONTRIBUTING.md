# Contributing

Thank you for helping The Soul Cafe. Everything here is copyright The Soul Cafe by Vanessa Worrell, all rights reserved. See `LICENSE`.

- **Run the site.** Install [Bun](https://bun.sh), run `bun install`, then use the scripts in `package.json` to start the dev server, run the gates, and build.
- **The contract.** `AGENTS.md` holds the rules the code cannot enforce (links, prose, layout, right-to-left). Read it before changing anything.
- **Where prose lives.** All visible text sits in the dictionaries under `src/i18n/`, one file per language, never in a page file. `src/i18n/en.ts` is canonical, and the typecheck names every other dictionary that misses a key.
- **Pull requests.** Titles follow Conventional Commits (`fix: ...`, `feat: ...`, `docs: ...`). CI checks the title, since it becomes the squash commit that drives releases.
- **Before pushing.** Run the gates that CI runs, listed in `.github/workflows/ci.yml`.
- **A wrong translation.** Open an issue with the "Translation correction" form. It asks for the language, the page or key, the current text, and your suggested text. No code needed.
