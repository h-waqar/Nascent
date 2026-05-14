import { describe, it, expect } from "vitest";
import { generateSlug } from "@/lib/slug";

describe("generateSlug", () => {
  it('converts basic name to slug', () => {
    expect(generateSlug("Phantom Elixir")).toBe("phantom-elixir");
  });

  it('converts name with year', () => {
    expect(generateSlug("Phantom Elixir 2024")).toBe("phantom-elixir-2024");
  });

  it('strips special chars like slashes', () => {
    expect(generateSlug("Oud Reverie // 004")).toBe("oud-reverie-004");
  });

  it('collapses multiple spaces', () => {
    expect(generateSlug("  Spaced   Out  ")).toBe("spaced-out");
  });

  it('strips non-ascii and punctuation', () => {
    expect(generateSlug("Café Noir!")).toBe("caf-noir");
  });

  it('handles already-slugged input', () => {
    expect(generateSlug("Already-Slugged")).toBe("already-slugged");
  });
});
