"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart";

const NAV_LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "The House" },
  { href: "/archive", label: "Archive" },
  { href: "/stores", label: "Stores" },
];

export function Nav() {
  const pathname = usePathname();
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total, itemCount } =
    useCartStore();
  const count = itemCount();

  return (
    <>
      {/* ── Nav bar ── */}
      <header className="bg-white fixed top-0 w-full z-50 border-b border-black">
        <div className="flex justify-between items-center w-full px-12 h-20 max-w-[1440px] mx-auto">
          {/* Left: logo + links */}
          <div className="flex items-center gap-12">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-black tracking-tighter uppercase text-black">
                Nascent
              </span>
            </Link>
            <nav className="hidden md:flex gap-8">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`font-['Inter'] uppercase tracking-[0.2em] text-[11px] font-medium transition-none ${
                      active
                        ? "text-black border-b border-black pb-1"
                        : "text-[#4c4546] hover:text-black"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: cart + account */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleCart}
              className="text-black hover:bg-black hover:text-white transition-none p-2 relative"
              aria-label="Open cart"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
            <Link
              href="/account"
              className="text-black hover:bg-black hover:text-white transition-none p-2"
              aria-label="Account"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Spacer so content isn't hidden under fixed nav ── */}
      <div className="h-20" />

      {/* ── Cart drawer overlay ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) toggleCart();
          }}
        >
          {/* Scrim */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Drawer panel */}
          <div className="relative w-full max-w-md h-full bg-white border-l border-black flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-black">
              <h2 className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold">
                Your Cart ({count})
              </h2>
              <button
                onClick={toggleCart}
                className="text-black hover:opacity-50 transition-none"
                aria-label="Close cart"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Items */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                  <p className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] text-[#4c4546]">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.productId} className="flex gap-4 border border-black p-4">
                    <div className="w-20 h-24 bg-[#f3f3f3] border border-black flex-shrink-0 relative overflow-hidden">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover grayscale"
                        />
                      )}
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex justify-between">
                          <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold text-black">
                            {item.name}
                          </span>
                          <span className="font-['Inter'] text-[11px] font-semibold text-black">
                            ${item.price}
                          </span>
                        </div>
                        <span className="font-['Inter'] text-[12px] text-[#4c4546]">
                          50ml Extrait de Parfum
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-4 border border-black px-2 py-1">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="text-black w-4 text-center"
                          >
                            −
                          </button>
                          <span className="font-['Inter'] text-[11px] font-semibold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="text-black w-4 text-center"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="font-['Inter'] text-[11px] text-black underline underline-offset-2 hover:opacity-50 transition-none"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-black bg-white">
                <div className="flex justify-between items-baseline mb-6">
                  <span className="font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold">
                    Subtotal
                  </span>
                  <span className="text-2xl font-medium tracking-tight">${total()}</span>
                </div>
                <p className="font-['Inter'] text-[12px] text-[#4c4546] mb-6">
                  Shipping &amp; taxes calculated at checkout.
                </p>
                <Link
                  href="/checkout"
                  onClick={toggleCart}
                  className="block w-full border border-black bg-black text-white text-center py-4 font-['Inter'] uppercase tracking-[0.15em] text-[11px] font-semibold hover:bg-white hover:text-black transition-none"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
