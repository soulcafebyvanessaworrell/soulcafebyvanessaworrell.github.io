// Builds every published tier (root, latest/, vX.Y.Z/) into one GitHub Pages artifact
// directory, each from `git archive` of its ref, plus versions.json; planTiers decides the tiers.
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

export type TierKind = "root" | "latest" | "version";

export interface Tier {
  kind: TierKind;
  /** The tag the tier serves, or "latest" when it serves HEAD. */
  label: string;
  /** Git ref the tier is archived from. */
  ref: string;
  /** Path below the root base: "" for the root, otherwise ending in "/". */
  rel: string;
}

export interface VersionEntry {
  kind: TierKind;
  label: string;
  /** Absolute path on the origin, root base included. */
  path: string;
}

export interface VersionsIndex {
  versions: VersionEntry[];
}

export interface SiteLocation {
  origin: string;
  base: string;
}

/** How many tagged versions keep their own vX.Y.Z/ directory. */
export const KEPT_VERSIONS = 5;

/** Plain release tags only: prereleases and build metadata never become tiers. */
const RELEASE_TAG = /^v(\d+)\.(\d+)\.(\d+)$/;

type SemverKey = [number, number, number];

function semverKey(tag: string): SemverKey | undefined {
  const match = RELEASE_TAG.exec(tag);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined;
}

/** Release tags, newest first by semver, capped at KEPT_VERSIONS. */
export function keptTags(tags: string[]): string[] {
  const keyed = tags.flatMap((tag) => {
    const key = semverKey(tag);
    return key ? [{ tag, key }] : [];
  });
  keyed.sort((a, b) => b.key[0] - a.key[0] || b.key[1] - a.key[1] || b.key[2] - a.key[2]);
  return keyed.slice(0, KEPT_VERSIONS).map((entry) => entry.tag);
}

/** The tier list for a set of tags; HEAD serves the root until the first tag exists. */
export function planTiers(tags: string[]): Tier[] {
  const kept = keptTags(tags);
  const newest = kept[0];
  const tiers: Tier[] = [
    newest
      ? { kind: "root", label: newest, ref: newest, rel: "" }
      : { kind: "root", label: "latest", ref: "HEAD", rel: "" },
    { kind: "latest", label: "latest", ref: "HEAD", rel: "latest/" },
  ];
  for (const tag of kept) tiers.push({ kind: "version", label: tag, ref: tag, rel: `${tag}/` });
  return tiers;
}

export function versionsIndex(tiers: Tier[], rootBase: string): VersionsIndex {
  return {
    versions: tiers.map((tier) => ({
      kind: tier.kind,
      label: tier.label,
      path: `${rootBase}${tier.rel}`,
    })),
  };
}

/** Top-level names the root build may not contain, or a tier or site file would shadow it. */
export function reservedNames(tiers: Tier[]): string[] {
  return [
    "versions.json",
    "CNAME",
    ...tiers.filter((tier) => tier.rel).map((tier) => tier.rel.slice(0, -1)),
  ];
}

/**
 * Where the site lives, mirroring the deploy workflow's resolution: a custom
 * domain sits at its root; otherwise the GitHub Pages host for the owner, with
 * a root base for an `<owner>.github.io` repository and `/<repo>/` for any other.
 */
export function resolveSite(repository: string, customDomain?: string): SiteLocation {
  if (customDomain) return { origin: `https://${customDomain}`, base: "/" };
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) throw new Error(`GITHUB_REPOSITORY is not owner/repo: "${repository}"`);
  const host = `${owner.toLowerCase()}.github.io`;
  return { origin: `https://${host}`, base: repo.toLowerCase() === host ? "/" : `/${repo}/` };
}

/** A base path with exactly one leading and one trailing slash ("/" for the root). */
export function normalizeBase(base: string): string {
  const core = base.replace(/^\/+|\/+$/g, "");
  return core ? `/${core}/` : "/";
}

function git(args: string[]): string {
  const result = Bun.spawnSync(["git", ...args], { stdout: "pipe", stderr: "pipe" });
  if (result.exitCode !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr.toString().trim()}`);
  }
  return result.stdout.toString().trim();
}

function run(command: string[], cwd: string, env: Record<string, string | undefined>): void {
  const result = Bun.spawnSync(command, {
    cwd,
    env,
    stdin: "ignore",
    stdout: "inherit",
    stderr: "inherit",
  });
  if (result.exitCode !== 0) {
    throw new Error(`${command.join(" ")} exited ${result.exitCode} in ${cwd}`);
  }
}

/** Archives and builds one tier in the scratch dir; returns its dist directory. */
function buildTier(tier: Tier, scratch: string, env: Record<string, string>): string {
  const source = path.join(scratch, tier.kind === "root" ? "root" : tier.rel.slice(0, -1));
  mkdirSync(source);
  const archive = `${source}.tar`;
  git(["archive", "--format=tar", "-o", archive, tier.ref]);
  run(["tar", "-xf", archive, "-C", source], source, process.env);
  const buildEnv: Record<string, string | undefined> = {
    ...process.env,
    ...env,
    ASTRO_BASE: `${env.ASTRO_BASE}${tier.rel}`,
    // The archive is not a git checkout, so husky's prepare step has nothing to install.
    HUSKY: "0",
  };
  if (tier.kind === "root") delete buildEnv.ASTRO_STAGING;
  else buildEnv.ASTRO_STAGING = "1";
  run(["bun", "install", "--frozen-lockfile"], source, buildEnv);
  run(["bun", "run", "build"], source, buildEnv);
  return path.join(source, "dist");
}

function printTiers(tiers: Tier[], origin: string, base: string): void {
  const rows = tiers.map((tier) => [
    tier.kind,
    tier.label,
    tier.ref,
    `${origin}${base}${tier.rel}`,
  ]);
  const widths = [0, 1, 2].map((column) =>
    Math.max(...rows.map((row) => row[column]?.length ?? 0)),
  );
  console.log("\nPublished tiers:");
  for (const row of rows) {
    console.log(`  ${row.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join("  ")}`);
  }
}

function main(argv: string[]): void {
  const { values } = parseArgs({
    args: argv,
    options: {
      site: { type: "string", default: "_site" },
      origin: { type: "string" },
      base: { type: "string" },
    },
  });
  const location =
    values.origin && values.base
      ? { origin: values.origin, base: values.base }
      : resolveSite(process.env.GITHUB_REPOSITORY ?? "", process.env.CUSTOM_DOMAIN);
  const origin = (values.origin ?? location.origin).replace(/\/+$/, "");
  const base = normalizeBase(values.base ?? location.base);
  const site = path.resolve(values.site);

  if (git(["rev-parse", "--is-shallow-repository"]) !== "false") {
    throw new Error(
      "shallow clone: tags and their trees are needed (checkout with fetch-depth: 0)",
    );
  }
  const tags = git(["tag", "--list", "v*"]).split("\n").filter(Boolean);
  const tiers = planTiers(tags);
  const index = versionsIndex(tiers, base);
  const reserved = reservedNames(tiers);

  if (existsSync(site) && readdirSync(site).length > 0) {
    throw new Error(`site directory is not empty: ${site}`);
  }
  mkdirSync(site, { recursive: true });
  const scratch = mkdtempSync(path.join(process.env.RUNNER_TEMP ?? os.tmpdir(), "pages-site-"));
  const env = { ASTRO_SITE: origin, ASTRO_BASE: base, SITE_VERSIONS: JSON.stringify(index) };

  try {
    for (const tier of tiers) {
      console.log(`\n== ${tier.kind} ${tier.label} (${tier.ref}) -> ${base}${tier.rel}`);
      const dist = buildTier(tier, scratch, env);
      if (tier.kind === "root") {
        const clashes = readdirSync(dist).filter((name) => reserved.includes(name));
        if (clashes.length > 0) {
          throw new Error(`root build contains reserved top-level names: ${clashes.join(", ")}`);
        }
      }
      cpSync(dist, path.join(site, tier.rel), { recursive: true });
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  writeFileSync(path.join(site, "versions.json"), `${JSON.stringify(index, null, 2)}\n`);
  if (process.env.CUSTOM_DOMAIN) {
    writeFileSync(path.join(site, "CNAME"), `${process.env.CUSTOM_DOMAIN}\n`);
  }
  printTiers(tiers, origin, base);
  console.log(`\nSite written to ${site}`);
}

if (import.meta.main) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`pages-site: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
