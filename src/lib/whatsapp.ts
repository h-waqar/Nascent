import type { Order } from "@/types/models";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "447700000000";

export function generateWhatsAppLink(order: Order): string {
  const itemLines = order.items
    .map((item) => `• ${item.name} x${item.quantity} — £${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  const message = [
    `*NASCENT ORDER CONFIRMATION*`,
    `Order: #${order.id.slice(-6).toUpperCase()}`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `Subtotal: £${order.subtotal.toFixed(2)}`,
    `Total: £${order.total.toFixed(2)}`,
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
