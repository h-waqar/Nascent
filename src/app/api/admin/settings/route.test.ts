import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock requireAdmin before importing route
vi.mock("@/lib/requireAdmin", () => ({
  requireAdmin: vi.fn(),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

// Mock models
vi.mock("@/models", () => ({
  SettingsModel: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

import { requireAdmin } from "@/lib/requireAdmin";
import { SettingsModel } from "@/models";

// Import route handlers after mocks
const { GET, PUT } = await import("@/app/api/admin/settings/route");

const MOCK_DOC = {
  _id: { toString: () => "abc123" },
  bankName: "Barclays",
  accountName: "NASCENT PERFUMES LTD",
  accountNumber: "12345678",
  iban: "PK36SCBL0000001123456702",
  codEnabled: true,
  bankTransferEnabled: true,
  updatedAt: new Date("2026-01-15T12:00:00Z"),
};

const DEFAULT_SETTINGS = {
  bankName: "",
  accountName: "",
  accountNumber: "",
  iban: "",
  codEnabled: true,
  bankTransferEnabled: true,
};

describe("GET /api/admin/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with settings doc when it exists", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);
    vi.mocked(SettingsModel.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(MOCK_DOC),
    } as any);

    const req = new NextRequest("http://localhost/api/admin/settings");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.settings).toBeDefined();
    expect(body.settings.id).toBe("abc123");
    expect(body.settings.accountName).toBe("NASCENT PERFUMES LTD");
    expect(body.settings.accountNumber).toBe("12345678");
    expect(body.settings.iban).toBe("PK36SCBL0000001123456702");
    expect(body.settings.bankName).toBe("Barclays");
    expect(body.settings.codEnabled).toBe(true);
    expect(body.settings.bankTransferEnabled).toBe(true);
    expect(body.settings.updatedAt).toBe("2026-01-15T12:00:00.000Z");
    expect(body.settings._id).toBeUndefined();
  });

  it("returns 200 with defaults when no doc exists (findOne returns null)", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);
    vi.mocked(SettingsModel.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const req = new NextRequest("http://localhost/api/admin/settings");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.settings).toMatchObject(DEFAULT_SETTINGS);
    // No _id or id when using defaults
    expect(body.settings._id).toBeUndefined();
  });

  it("returns 403 when requireAdmin denies access", async () => {
    const denyResponse = new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
    vi.mocked(requireAdmin).mockResolvedValue(denyResponse as any);

    const req = new NextRequest("http://localhost/api/admin/settings");
    const res = await GET(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Forbidden");
  });
});

describe("PUT /api/admin/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and upserted settings on valid payload", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);
    const updatedDoc = {
      ...MOCK_DOC,
      accountName: "NASCENT PERFUMES LTD",
      bankTransferEnabled: false,
    };
    vi.mocked(SettingsModel.findOneAndUpdate).mockReturnValue({
      lean: vi.fn().mockResolvedValue(updatedDoc),
    } as any);

    const req = new NextRequest("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({
        accountName: "NASCENT PERFUMES LTD",
        bankTransferEnabled: false,
      }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.settings).toBeDefined();
    expect(body.settings.accountName).toBe("NASCENT PERFUMES LTD");
    expect(body.settings.bankTransferEnabled).toBe(false);

    // Verify findOneAndUpdate was called with correct args
    expect(SettingsModel.findOneAndUpdate).toHaveBeenCalledWith(
      {},
      { $set: { accountName: "NASCENT PERFUMES LTD", bankTransferEnabled: false } },
      { upsert: true, new: true, runValidators: true }
    );
  });

  it("returns 422 when payload has wrong types (accountName: 123)", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ accountName: 123 }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toBeDefined();
    // Must NOT have called findOneAndUpdate
    expect(SettingsModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("returns 400 when body is invalid JSON", async () => {
    vi.mocked(requireAdmin).mockResolvedValue(null);

    const req = new Request("http://localhost/api/admin/settings", {
      method: "PUT",
      body: "{not-valid-json",
    }) as unknown as NextRequest;
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Invalid JSON");
    expect(SettingsModel.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("returns 403 when requireAdmin denies access for PUT", async () => {
    const denyResponse = new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
    vi.mocked(requireAdmin).mockResolvedValue(denyResponse as any);

    const req = new NextRequest("http://localhost/api/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ codEnabled: false }),
    });
    const res = await PUT(req);

    expect(res.status).toBe(403);
    expect(SettingsModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
