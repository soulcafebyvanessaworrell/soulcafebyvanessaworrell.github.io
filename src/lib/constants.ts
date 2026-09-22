// Single source of site identity for The Soul Cafe: every URL, phone number,
// social handle, and brand value the site writes out lives here, so a change
// is made in exactly one place.

/** Preview server port. Distinct from DEV_PORT so `astro preview` (and the
 * Playwright e2e suite that spawns it) never collides with a running dev
 * server. */
export const PREVIEW_PORT = 4322;

/** Site origin. The deploy workflow always passes ASTRO_SITE (derived from
 *  the repository's GitHub Pages host, or from the CUSTOM_DOMAIN repo variable).
 *  Locally it falls back to the preview server's origin, so absolute URLs
 *  (hreflang alternates, the sitemap, the contact form's redirect) are always
 *  well formed. Any trailing slash is stripped so joins with SITE_BASE never
 *  double up. Read at build time only: constants are consumed in
 *  server-rendered frontmatter, never shipped to the client. */
export const SITE_ORIGIN = (process.env.ASTRO_SITE ?? `http://localhost:${PREVIEW_PORT}`).replace(
  /\/+$/,
  "",
);

/** Base path the site is served from, always normalized to a single leading
 *  and trailing slash (root becomes "/"). Every internal link is
 *  `BASE_URL + path`, so the slashes must be exact. As with the origin, the
 *  deploy always passes ASTRO_BASE (/<repo>/ for a project site, / for a custom
 *  domain, with the tier path appended for non-root tiers), so the literal below
 *  is only the local default and the one place it is written. It is a neutral
 *  slug, not the repository name, and it stays non-root on purpose: the smoke
 *  suite's base-path canary only bites under a real base. */
const RAW_BASE = process.env.ASTRO_BASE ?? "/preview/";
const CORE_BASE = RAW_BASE.replace(/^\/+|\/+$/g, "");
export const SITE_BASE = CORE_BASE ? `/${CORE_BASE}/` : "/";

/** The brand name, verbatim in every language (the translation contract keeps
 *  it untranslated). The manifest's short_name and the title suffix on every
 *  page read it from here. */
export const BRAND = "The Soul Cafe";

/** The founder, as the JSON-LD `Person` and the signature block write her:
 *  `qualification` is the honorific suffix ("M.A."), `jobTitle` the English
 *  role for structured data. Localized role text stays in the dictionaries. */
export const FOUNDER = {
  name: "Vanessa Worrell",
  qualification: "M.A.",
  jobTitle: "Psychotherapist",
} as const;

export const SITE_TITLE = `${BRAND} by ${FOUNDER.name}`;

/** The mint brand colour, as the browser UI shows it: `<meta name="theme-color">`
 *  and the manifest's `theme_color`. CSS cannot import this file, so
 *  `--color-mint` in src/styles.css repeats the value; a unit test keeps the
 *  two equal. */
export const THEME_COLOR = "#a9efe3";

/** The day the privacy policy last changed, as an ISO date. The privacy page
 *  formats it as month and year in each locale, so every dictionary carries
 *  only the label around it. Bump it whenever the policy text changes. */
export const PRIVACY_UPDATED = "2026-09-21";

/** Dev server port. Kept stable so bookmarks and docs don't drift. */
export const DEV_PORT = 4321;

export const CONTACT = {
  phone: "+91 7009597939",
  phoneHref: "tel:+917009597939",
  whatsappHref: "https://wa.me/917009597939",
  email: "thesoulcafebyvanessaworrell@gmail.com",
  website: "www.thesoulcafebyvanessaworrell.com",
} as const;

export interface Social {
  /** Display name, also used as the accessible label stem. */
  name: string;
  /** The @handle or page name shown next to the icon. */
  handle: string;
  url: string;
  /** Full astro-icon name from the simple-icons set. */
  icon: string;
  /** True while the URL is a stand-in network homepage, not a real profile.
   *  Excluded from the footer and JSON-LD `sameAs`. */
  placeholder?: boolean;
}

export const SOCIALS: Social[] = [
  {
    name: "Instagram",
    handle: "@_the_soul_cafe_",
    url: "https://instagram.com/_the_soul_cafe_",
    icon: "simple-icons:instagram",
  },
  {
    name: "Threads",
    handle: "@_the_soul_cafe_",
    url: "https://www.threads.net/@_the_soul_cafe_",
    icon: "simple-icons:threads",
  },
  {
    name: "X",
    handle: "@TheSoulCafebyVW",
    url: "https://x.com/TheSoulCafebyVW",
    icon: "simple-icons:x",
  },
  {
    name: "Facebook",
    handle: BRAND,
    // TODO(owner): replace with the real Facebook page URL once known, and delete `placeholder`.
    url: "https://www.facebook.com/",
    placeholder: true,
    icon: "simple-icons:facebook",
  },
  {
    name: "LinkedIn",
    handle: SITE_TITLE,
    // TODO(owner): replace with the real LinkedIn page URL once known, and delete `placeholder`.
    url: "https://www.linkedin.com/",
    placeholder: true,
    icon: "simple-icons:linkedin",
  },
];

/** Socials with real profile URLs; placeholder entries stay out of the footer
 *  and JSON-LD `sameAs`. */
export const PUBLISHED_SOCIALS: Social[] = SOCIALS.filter((social) => !social.placeholder);

/** Google Calendar appointment links. `session` is the paid one-on-one
 *  booking; `consultation` is the free intro call. `couples` and `family`
 *  reuse the one-on-one calendar until the owner creates dedicated schedules:
 *  paste each new calendar.app.google link over the value below. */
export const BOOKING = {
  session: "https://calendar.app.google/uoA91m1dvCVzgebx5",
  couples: "https://calendar.app.google/uoA91m1dvCVzgebx5",
  family: "https://calendar.app.google/uoA91m1dvCVzgebx5",
  consultation: "https://calendar.app.google/PvdNpJ4rFvXLrVd9A",
} as const;

/** FormSubmit endpoint for the contact form. One-time activation required:
 *  the first real submission triggers a confirmation email the owner must
 *  click before the endpoint delivers mail. */
export const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/${CONTACT.email}`;

/** Tele-MANAS, the Government of India's free 24x7 mental-health helpline. Shown
 *  in the footer crisis note; the Soul Cafe is not an emergency service. Both
 *  the short code and the full toll-free number are published as plain text
 *  (deliberately not emphasized, so no one mistakes them for a Soul Cafe line). */
export const CRISIS = {
  name: "Tele-MANAS",
  number: "14416",
  numberHref: "tel:14416",
  fullNumber: "1800-891-4416",
  fullNumberHref: "tel:18008914416",
} as const;
