import { describe, expect, it } from "vitest";
import { takeFixedWindowRateLimit } from "@/lib/rateLimit";

describe("takeFixedWindowRateLimit", () => {
  it("allows requests until the fixed window limit is reached", () => {
    const key = `test:${Date.now()}:${Math.random()}`;
    expect(takeFixedWindowRateLimit(key, 2, 60_000).ok).toBe(true);
    expect(takeFixedWindowRateLimit(key, 2, 60_000).ok).toBe(true);
    const third = takeFixedWindowRateLimit(key, 2, 60_000);
    expect(third.ok).toBe(false);
    if (!third.ok) {
      expect(third.retryAfterSeconds).toBeGreaterThan(0);
    }
  });
});
