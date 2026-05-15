/**
 * Format a numeric amount as a Pakistani Rupee display string.
 * - Prefix: "Rs. " (with trailing space)
 * - No decimals: round to whole rupees first
 * - Locale grouping: en-PK
 *
 * Single source of truth for monetary display across storefront and admin.
 * If the format ever changes (e.g. add decimals, switch symbol), edit this file only.
 *
 * @example
 *   formatPrice(12500)    // "Rs. 12,500"
 *   formatPrice(99.6)     // "Rs. 100"  (rounded)
 *   formatPrice(0)        // "Rs. 0"
 */
export function formatPrice(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}
