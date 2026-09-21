/**
 * The localStorage key that remembers the visitor's language. Written only by
 * the language picker (site.ts) when a visitor picks a language; read by the
 * redirect in Base.astro. Kept apart from locales.ts so the client bundle does
 * not pull the whole locale table in with it.
 */
export const LANGUAGE_STORAGE_KEY = "soul-cafe-language";
