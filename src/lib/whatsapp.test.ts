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
    city: "Lahore",
    postalCode: "54000",
    country: "PK",
    phone: "+92 300 1234567",
  },
  createdAt: "2026-05-01T12:00:00.000Z",
  updatedAt: "2026-05-01T12:00:00.000Z",
};

describe("generateWhatsAppLink", () => {
  let generateWhatsAppLink: (order: Order, number: string) => string;

  beforeAll(async () => {
    const mod = await import("@/lib/whatsapp");
    generateWhatsAppLink = mod.generateWhatsAppLink;
  });

  it("returns '#' when number is empty string", () => {
    const link = generateWhatsAppLink(sampleOrder, "");
    expect(link).toBe("#");
  });

  it("returns a string starting with https://wa.me/", () => {
    const link = generateWhatsAppLink(sampleOrder, "923001234567");
    expect(link).toMatch(/^https:\/\/wa\.me\//);
  });

  it("decoded text contains Rs. PKR prefix", () => {
    const link = generateWhatsAppLink(sampleOrder, "923001234567");
    const url = new URL(link);
    const text = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(text).toContain("Rs.");
  });

  it("decoded text does NOT contain £ symbol (legacy GBP removed)", () => {
    const link = generateWhatsAppLink(sampleOrder, "923001234567");
    const url = new URL(link);
    const text = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(text).not.toContain("£");
  });

  it("decoded text does NOT contain $ symbol", () => {
    const link = generateWhatsAppLink(sampleOrder, "923001234567");
    const url = new URL(link);
    const text = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(text).not.toContain("$");
  });

  it("decoded text contains NASCENT ORDER CONFIRMATION header", () => {
    const link = generateWhatsAppLink(sampleOrder, "923001234567");
    const url = new URL(link);
    const text = decodeURIComponent(url.searchParams.get("text") ?? "");
    expect(text).toContain("*NASCENT ORDER CONFIRMATION*");
  });
});
