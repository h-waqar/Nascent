import { describe, it, expect, beforeAll } from "vitest";
import type { Order } from "@/types/models";

const sampleOrder: Order = {
  id: "507f1f77bcf86cd799439011",
  userId: "user_test123",
  items: [
    {
      productId: "prod1",
      slug: "oud-noir",
      name: "Oud Noir",
      price: 120,
      quantity: 2,
    },
  ],
  subtotal: 240,
  total: 245,
  status: "pending",
  paymentMethod: "bank_transfer",
  shippingAddress: {
    fullName: "Jane Doe",
    line1: "1 Kings Road",
    city: "London",
    postalCode: "SW1A 1AA",
    country: "GB",
    phone: "+44 7700 900000",
  },
  createdAt: "2026-05-01T12:00:00.000Z",
  updatedAt: "2026-05-01T12:00:00.000Z",
};

describe("generateWhatsAppLink", () => {
  let generateWhatsAppLink: (order: Order) => string;

  beforeAll(async () => {
    const mod = await import("@/lib/whatsapp");
    generateWhatsAppLink = mod.generateWhatsAppLink;
  });

  it("returns a string starting with https://wa.me/", () => {
    const link = generateWhatsAppLink(sampleOrder);
    expect(link).toMatch(/^https:\/\/wa\.me\//);
  });

  it("decoded text contains £ symbol", () => {
    const link = generateWhatsAppLink(sampleOrder);
    const url = new URL(link);
    const text = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(text).toContain("£");
  });

  it("decoded text does NOT contain $ symbol", () => {
    const link = generateWhatsAppLink(sampleOrder);
    const url = new URL(link);
    const text = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(text).not.toContain("$");
  });

  it("decoded text contains NASCENT ORDER CONFIRMATION header", () => {
    const link = generateWhatsAppLink(sampleOrder);
    const url = new URL(link);
    const text = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(text).toContain("*NASCENT ORDER CONFIRMATION*");
  });
});
