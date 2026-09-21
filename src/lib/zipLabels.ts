// Pairs a dictionary's label tuple with a page's icon tuple. The icon tuple's
// type is derived from the label tuple's keys, so a length mismatch between
// the prose (in src/i18n) and the icons (in the page) is a compile error, not
// an empty icon at runtime.
export function zipLabels<T extends readonly string[]>(
  labels: T,
  icons: { readonly [K in keyof T]: string },
): { label: string; icon: string }[] {
  return labels.map((label, index) => ({ label, icon: icons[index] as string }));
}
