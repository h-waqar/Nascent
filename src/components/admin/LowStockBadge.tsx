export function LowStockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-[13px] font-semibold border-[2px] border-black px-1 text-black">OUT</span>;
  if (stock <= 5) return <span className="text-[13px] font-semibold border border-black px-1 text-black">{stock}</span>;
  return <span className="text-[13px] text-black">{stock}</span>;
}
