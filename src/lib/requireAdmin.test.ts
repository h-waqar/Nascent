import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth, clerkClient } from "@clerk/nextjs/server";

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(),
  clerkClient: vi.fn(),
}));

// Import after mock
const { requireAdmin } = await import("@/lib/requireAdmin");

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when userId is null (not signed in)", async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null } as unknown as Awaited<ReturnType<typeof auth>>);
    const result = await requireAdmin();
    expect(result).not.toBeNull();
    expect(result?.status).toBe(401);
  });

  it("returns 403 when signed in but role is not admin in sessionClaims and clerkClient", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "u1",
      sessionClaims: { metadata: { role: "user" } },
    } as unknown as Awaited<ReturnType<typeof auth>>);
    const result = await requireAdmin();
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });

  it("returns null when signed in with admin role in sessionClaims", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "u1",
      sessionClaims: { metadata: { role: "admin" } },
    } as unknown as Awaited<ReturnType<typeof auth>>);
    const result = await requireAdmin();
    expect(result).toBeNull();
  });

  it("falls back to clerkClient when sessionClaims is undefined and returns null for admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "u1",
      sessionClaims: undefined,
    } as unknown as Awaited<ReturnType<typeof auth>>);
    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          publicMetadata: { role: "admin" },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof clerkClient>>);

    const result = await requireAdmin();
    expect(result).toBeNull();
  });

  it("returns 403 when sessionClaims is undefined and clerkClient returns non-admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      userId: "u1",
      sessionClaims: undefined,
    } as unknown as Awaited<ReturnType<typeof auth>>);
    vi.mocked(clerkClient).mockResolvedValue({
      users: {
        getUser: vi.fn().mockResolvedValue({
          publicMetadata: { role: "customer" },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof clerkClient>>);

    const result = await requireAdmin();
    expect(result).not.toBeNull();
    expect(result?.status).toBe(403);
  });
});
