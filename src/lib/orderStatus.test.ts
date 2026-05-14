import { describe, it, expect } from "vitest";
import { isValidTransition } from "@/lib/orderStatus";

describe("isValidTransition", () => {
  it("allows pending → confirmed (one forward step)", () => {
    expect(isValidTransition("pending", "confirmed")).toBe(true);
  });

  it("rejects pending → shipped (skips steps)", () => {
    expect(isValidTransition("pending", "shipped")).toBe(false);
  });

  it("allows confirmed → processing (one forward step)", () => {
    expect(isValidTransition("confirmed", "processing")).toBe(true);
  });

  it("allows processing → cancelled (exit transition)", () => {
    expect(isValidTransition("processing", "cancelled")).toBe(true);
  });

  it("allows shipped → refunded (exit transition)", () => {
    expect(isValidTransition("shipped", "refunded")).toBe(true);
  });

  it("rejects delivered → shipped (terminal state — no exits)", () => {
    expect(isValidTransition("delivered", "shipped")).toBe(false);
  });

  it("rejects cancelled → pending (terminal state — no exits)", () => {
    expect(isValidTransition("cancelled", "pending")).toBe(false);
  });

  it("rejects delivered → cancelled (terminal state — no exit transitions)", () => {
    expect(isValidTransition("delivered", "cancelled")).toBe(false);
  });
});
