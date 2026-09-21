// Pins the publish plan that scripts/pages-site.mts derives from a tag list.
// The planner decides what lands at the production root and which tags keep a
// directory, so a wrong answer here ships silently as a wrong live site.

import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  keptTags,
  normalizeBase,
  planTiers,
  reachableReleaseTags,
  reservedNames,
  resolveSite,
  versionsIndex,
} from "./pages-site.mts";

describe("planTiers", () => {
  test("a repository with no tag serves HEAD at the root", () => {
    // Drift: an empty root would 404 until the first release.
    const tiers = planTiers([]);
    expect(tiers.map((tier) => [tier.kind, tier.ref, tier.rel])).toEqual([
      ["root", "HEAD", ""],
      ["latest", "HEAD", "latest/"],
    ]);
    expect(tiers[0]?.label).toBe("latest");
  });

  test("prerelease and non-semver tags never become tiers", () => {
    // Drift: a v1.0.0-rc.1 or a stray `v2` tag would win the root over the real release.
    const tiers = planTiers(["v1.0.0-rc.1", "v2", "release-1", "1.0.0", "v0.1.0", "v0.1.0+build"]);
    expect(tiers.map((tier) => tier.ref)).toEqual(["v0.1.0", "HEAD", "v0.1.0"]);
  });

  test("the cap keeps the five newest by semver, not by string order", () => {
    // Drift: lexical sorting ranks v0.9.0 above v0.10.0 and drops the wrong tag.
    const tags = ["v0.9.0", "v0.10.0", "v0.2.0", "v0.1.0", "v0.3.0", "v0.4.0", "v1.0.0"];
    expect(keptTags(tags)).toEqual(["v1.0.0", "v0.10.0", "v0.9.0", "v0.4.0", "v0.3.0"]);
    const versionDirs = planTiers(tags).filter((tier) => tier.kind === "version");
    expect(versionDirs.map((tier) => tier.rel)).toEqual([
      "v1.0.0/",
      "v0.10.0/",
      "v0.9.0/",
      "v0.4.0/",
      "v0.3.0/",
    ]);
  });

  test("the root serves the newest tag once one exists", () => {
    // Drift: a root left on HEAD after the first release would publish main as production.
    const tiers = planTiers(["v0.1.0", "v0.2.0"]);
    const byKind = Object.fromEntries(tiers.map((tier) => [tier.kind, tier]));
    expect(byKind.root?.ref).toBe("v0.2.0");
    expect(byKind.root?.label).toBe("v0.2.0");
    expect(byKind.latest?.ref).toBe("HEAD");
  });
});

describe("versionsIndex", () => {
  test("paths carry the root base, so a project site links under /<repo>/", () => {
    // Drift: bare "/latest/" links would leave the project site's base path.
    const index = versionsIndex(planTiers(["v0.2.0"]), "/example-site/");
    expect(index.versions.map((entry) => [entry.label, entry.path])).toEqual([
      ["v0.2.0", "/example-site/"],
      ["latest", "/example-site/latest/"],
      ["v0.2.0", "/example-site/v0.2.0/"],
    ]);
    expect(index.versions.map((entry) => entry.kind)).toEqual(["root", "latest", "version"]);
  });
});

describe("reservedNames", () => {
  test("every non-root tier directory, versions.json, and CNAME are reserved at the root", () => {
    // Drift: names must come back without the trailing slash ("latest", not "latest/"), or the
    // readdirSync comparison in the root check never matches and the guard silently never fires.
    expect(reservedNames(planTiers(["v0.1.0"]))).toEqual([
      "versions.json",
      "CNAME",
      "latest",
      "v0.1.0",
    ]);
  });
});

describe("resolveSite", () => {
  test("an <owner>.github.io repository is served from the root base", () => {
    // Drift: a /<repo>/ base on the user site would put every link under a path that 404s.
    expect(resolveSite("SoulCafe/soulcafe.github.io")).toEqual({
      origin: "https://soulcafe.github.io",
      base: "/",
    });
  });

  test("any other repository is served under /<repo>/ with its case kept", () => {
    // Drift: lowercasing the repo segment would break links on a mixed-case project site.
    expect(resolveSite("SoulCafe/Soul_Site")).toEqual({
      origin: "https://soulcafe.github.io",
      base: "/Soul_Site/",
    });
  });

  test("a custom domain wins and sits at the root", () => {
    // Drift: keeping /<repo>/ under a custom domain would publish every page one level too deep.
    expect(resolveSite("SoulCafe/Soul_Site", "example.com")).toEqual({
      origin: "https://example.com",
      base: "/",
    });
  });

  test("a repository coordinate without an owner is rejected", () => {
    // Drift: an unset GITHUB_REPOSITORY would silently publish to https://.github.io.
    expect(() => resolveSite("")).toThrow(/GITHUB_REPOSITORY/);
  });
});

describe("normalizeBase", () => {
  test("bases join with tier paths on exactly one slash", () => {
    // Drift: "/repo" + "latest/" would produce "/repolatest/".
    expect(normalizeBase("/repo")).toBe("/repo/");
    expect(normalizeBase("repo//")).toBe("/repo/");
    expect(normalizeBase("")).toBe("/");
    expect(normalizeBase("/")).toBe("/");
  });
});

describe("reachableReleaseTags", () => {
  // A throwaway repository in the OS temp dir: main carries v0.1.0, a side branch carries a
  // newer v9.9.9 that main never merged. The fixture is built with no user or system git
  // config, so a developer's commit signing, hooks path, or aliases cannot alter it.
  let scratch: string;
  let repo: string;

  beforeAll(() => {
    scratch = mkdtempSync(path.join(os.tmpdir(), "pages-site-tags-"));
    repo = path.join(scratch, "repo");
    const env = {
      PATH: process.env.PATH,
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_AUTHOR_NAME: "example-user",
      GIT_AUTHOR_EMAIL: "example-user@example.com",
      GIT_COMMITTER_NAME: "example-user",
      GIT_COMMITTER_EMAIL: "example-user@example.com",
    };
    const git = (...args: string[]) => {
      const result = Bun.spawnSync(["git", ...args], { cwd: scratch, env, stderr: "pipe" });
      if (result.exitCode !== 0) throw new Error(`git ${args[0]}: ${result.stderr.toString()}`);
    };
    git("init", "--quiet", "--initial-branch=main", repo);
    git("-C", repo, "commit", "--quiet", "--allow-empty", "-m", "first");
    git("-C", repo, "tag", "v0.1.0");
    git("-C", repo, "checkout", "--quiet", "-b", "side");
    git("-C", repo, "commit", "--quiet", "--allow-empty", "-m", "unmerged");
    git("-C", repo, "tag", "v9.9.9");
    git("-C", repo, "checkout", "--quiet", "main");
  });

  afterAll(() => {
    rmSync(scratch, { recursive: true, force: true });
  });

  test("a release tag on an unmerged branch never reaches the plan", () => {
    // Drift: listing every v* tag would let a tag pushed on any branch become the production
    // root, since the planner ranks by semver alone.
    expect(reachableReleaseTags(repo)).toEqual(["v0.1.0"]);
  });

  test("the listing reads the repository at the given path, not the one GIT_DIR names", () => {
    // Drift: a git hook exports GIT_DIR, and git prefers it over the working directory. The
    // pre-commit hook once ran this suite with GIT_DIR set, and the listing answered for the
    // hook's repository, which had no tag. With GIT_DIR naming a non-repository, only a
    // listing that drops it can find the fixture's tag.
    const previous = process.env.GIT_DIR;
    process.env.GIT_DIR = path.join(scratch, "not-a-repository");
    try {
      expect(reachableReleaseTags(repo)).toEqual(["v0.1.0"]);
    } finally {
      if (previous === undefined) delete process.env.GIT_DIR;
      else process.env.GIT_DIR = previous;
    }
  });
});
