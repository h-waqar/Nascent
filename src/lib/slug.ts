/**
 * Generate a URL-safe slug from a product name.
 * Lowercases, trims, collapses whitespace to single hyphens, strips
 * everything outside [a-z0-9-], and collapses repeated hyphens.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
