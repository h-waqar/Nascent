import type { Order } from "@/types/models";
import { formatPrice } from "@/lib/currency";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "447700000000";

export function generateWhatsAppLink(order: Order): string {
  const itemLines = order.items
    .map((item) => `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
    .join("\n");

  const message = [
    `*NASCENT ORDER CONFIRMATION*`,
    `Order: #${order.id.slice(-6).toUpperCase()}`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `Total: ${formatPrice(order.total)}`,
    `Payment: ${order.paymentMethod === "bank_transfer" ? "Direct Bank Transfer" : "Cash on Delivery"}`,
    ``,
    `*Ship to:*`,
    order.shippingAddress.fullName,
    order.shippingAddress.line1,
    order.shippingAddress.line2 ?? "",
    `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
    order.shippingAddress.phone,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
