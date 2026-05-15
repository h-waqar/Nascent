/**
 * Shared order reference formatting utilities.
 * All references use the last 6 characters of the MongoDB ObjectId for consistency.
 */

/**
 * Returns the raw 6-character suffix of an order id, uppercased.
 * Use this in admin contexts where the `#NSC-` prefix is not shown.
 */
export function shortRef(id: string): string {
  return id.slice(-6).toUpperCase();
}

/**
 * Returns a customer-facing order reference in the format `#NSC-XXXXXX`.
 * Use this in confirmation pages, invoices, and WhatsApp messages.
 */
export function formatOrderRef(id: string): string {
  return `#NSC-${shortRef(id)}`;
}
