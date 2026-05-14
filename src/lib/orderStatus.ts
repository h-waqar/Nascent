import type { OrderStatus } from "@/types/models";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "refunded",
  "cancelled",
];

const FORWARD_FLOW: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];
const TERMINAL: OrderStatus[] = ["delivered", "refunded", "cancelled"];

/**
 * Linear forward progression: pending → confirmed → processing → shipped → delivered (one step at a time).
 * Exit transitions to "cancelled" or "refunded" are allowed from any NON-terminal status.
 * No transitions are allowed FROM a terminal status (delivered, refunded, cancelled).
 */
export function isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return false;
  if (TERMINAL.includes(current)) return false;
  if (next === "cancelled" || next === "refunded") return true;
  const currentIdx = FORWARD_FLOW.indexOf(current);
  const nextIdx = FORWARD_FLOW.indexOf(next);
  if (currentIdx === -1 || nextIdx === -1) return false;
  return nextIdx === currentIdx + 1;
}
