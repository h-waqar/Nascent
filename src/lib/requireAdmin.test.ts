import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@clerk/nextjs/server";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
}));

// Import after mock
const { requireAdmin } = await import("@/lib/requireAdmin");

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when userId is null (not signed in)", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as any);
    const result = await requireAdmin();
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
  });

  it("returns 403 when signed in but role is not admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "u1",
      sessionClaims: { metadata: { role: "user" } },
    } as any);
    const result = await requireAdmin();
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it("returns null when signed in with admin role", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "u1",
      sessionClaims: { metadata: { role: "admin" } },
    } as any);
    const result = await requireAdmin();
    expect(result).toBeNull();
  });

  it("returns 403 when signed in but sessionClaims is undefined", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "u1",
      sessionClaims: undefined,
    } as any);
    const result = await requireAdmin();
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });
});
