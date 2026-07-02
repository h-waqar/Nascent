import { describe, it, expect } from "vitest";
import { ProductModel, CategoryModel, OrderModel, SettingsModel, ReviewModel } from "@/models";

describe("Mongoose models", () => {
  it("Product schema declares numeric price and required slug", () => {
    const priceType = ProductModel.schema.path("price");
    const slugPath = ProductModel.schema.path("slug");
    expect(priceType.instance).toBe("Number");
    expect(slugPath.isRequired).toBe(true);
  });

  it("Category schema declares required imageUrl", () => {
    const imageUrl = CategoryModel.schema.path("imageUrl");
    expect(imageUrl.isRequired).toBe(true);
  });

  it("Order.status enum matches OrderStatus union exactly", () => {
    const statusPath = OrderModel.schema.path("status") as unknown as {
      enumValues: string[];
    };
    expect(statusPath.enumValues).toEqual([
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "refunded",
      "cancelled",
    ]);
  });

  it("Order.paymentMethod enum matches PaymentMethod union exactly", () => {
    const pmPath = OrderModel.schema.path("paymentMethod") as unknown as {
      enumValues: string[];
    };
    expect(pmPath.enumValues).toEqual(["cod", "bank_transfer"]);
  });

  it("Order requires non-empty items array", () => {
    const itemsPath = OrderModel.schema.path("items");
    expect(itemsPath.isRequired).toBe(true);
  });

  it("Settings schema declares boolean payment flags defaulting true", () => {
    const codPath = SettingsModel.schema.path("codEnabled") as unknown as {
      instance: string;
      defaultValue: boolean;
    };
    const bankPath = SettingsModel.schema.path("bankTransferEnabled") as unknown as {
      instance: string;
      defaultValue: boolean;
    };
    expect(codPath.instance).toBe("Boolean");
    expect(codPath.defaultValue).toBe(true);
    expect(bankPath.instance).toBe("Boolean");
    expect(bankPath.defaultValue).toBe(true);
  });

  it("Settings schema declares string bank fields", () => {
    const accountNamePath = SettingsModel.schema.path("accountName") as unknown as {
      instance: string;
    };
    const ibanPath = SettingsModel.schema.path("iban") as unknown as {
      instance: string;
    };
    expect(accountNamePath.instance).toBe("String");
    expect(ibanPath.instance).toBe("String");
  });

  it("Review schema enforces one review per user/product", () => {
    const indexes = ReviewModel.schema.indexes() as Array<[
      Record<string, number>,
      { unique?: boolean } | undefined,
    ]>;
    const uniqueIndex = indexes.find(([fields, options]) => {
      return (
        fields.userId === 1 &&
        fields.productId === 1 &&
        options?.unique === true
      );
    });
    expect(uniqueIndex).toBeTruthy();
  });

  it("Review schema defaults submitted reviews to pending and not featured", () => {
    const statusPath = ReviewModel.schema.path("status") as unknown as {
      enumValues: string[];
      defaultValue: string;
    };
    const featuredPath = ReviewModel.schema.path("isFeatured") as unknown as {
      defaultValue: boolean;
    };
    expect(statusPath.enumValues).toEqual(["pending", "approved", "rejected"]);
    expect(statusPath.defaultValue).toBe("pending");
    expect(featuredPath.defaultValue).toBe(false);
  });
});
