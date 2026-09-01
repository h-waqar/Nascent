import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LowStockAlertsTable, LowStockItem } from "@/components/admin/LowStockAlertsTable";

const MOCK_ITEMS: LowStockItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `prod-${i + 1}`,
  name: `Product ${i + 1}`,
  slug: `product-${i + 1}`,
  stock: i < 5 ? 2 : 1,
  categoryId: "cat-1",
  collection: "FA Collection",
}));

describe("LowStockAlertsTable", () => {
  it("renders empty state when no items exist", () => {
    render(<LowStockAlertsTable lowStock={[]} />);
    expect(screen.getByText("All products are well-stocked.")).toBeDefined();
  });

  it("paginates items to specified page size", () => {
    render(<LowStockAlertsTable lowStock={MOCK_ITEMS} pageSize={5} />);
    
    // First 5 items should be visible
    expect(screen.getByText("Product 1")).toBeDefined();
    expect(screen.getByText("Product 5")).toBeDefined();
    
    // 6th item should not be in the first page slice
    expect(screen.queryByText("Product 6")).toBeNull();
    
    // Pagination controls should show
    expect(screen.getByText(/Page 1 of 3/)).toBeDefined();
  });
});
