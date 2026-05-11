"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Show, UserButton, SignInButton } from "@clerk/nextjs";
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
                        : "text-black hover:underline"
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
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-black text-white text-[9px] flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 border border-black",
                    userButtonPopoverCard: "border border-black shadow-none rounded-none",
                    userButtonPopoverActionButton: "rounded-none hover:bg-black hover:text-white",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="redirect">
                <button
                  className="text-black hover:bg-black hover:text-white transition-none p-2"
                  aria-label="Sign in"
                >
                  <span className="material-symbols-outlined">person</span>
                </button>
              </SignInButton>
            </Show>
          </div>
        </div>
      </header>

      {/* ── Spacer so content isn't hidden under fixed nav ── */}
      <div className="h-20" />

      {/* ── Cart drawer overlay ── */}
      {isOpen && (
        <>
          {/* Scrim — full viewport, click to close */}
          <div
            className="fixed inset-0 z-[100] bg-black/30"
            onClick={toggleCart}
          />

          {/* Drawer panel — pinned to right edge of the viewport */}
          <div
            className="fixed top-0 right-0 h-full w-[420px] z-[101] bg-white border-l border-black flex flex-col"
          >
            {/* Header — h-20 matches nav height so borders form a continuous line */}
            <div className="flex justify-between items-center px-6 h-20 border-b border-black mt-[1px]">
              <div>
                <h2 className="text-[13px] font-semibold text-black uppercase tracking-[0.1em]">
                  Your Bag
                </h2>
                <p className="text-[11px] text-black mt-0.5">
                  {count} {count === 1 ? "item" : "items"}
                </p>
              </div>
              <button
                onClick={toggleCart}
                className="text-black hover:bg-black hover:text-white transition-none p-1"
                aria-label="Close cart"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Items */}
            <div className="flex-grow overflow-y-auto">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 p-8">
                  <span className="material-symbols-outlined text-[40px] text-[#ccc]">shopping_bag</span>
                  <p className="text-[12px] uppercase tracking-[0.15em] text-black">
                    Your bag is empty
                  </p>
                  <button
                    onClick={toggleCart}
                    className="border border-black px-6 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-black hover:text-white transition-none"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-black">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-5">
                      {/* Thumbnail */}
                      <div className="w-[72px] h-[90px] bg-white border border-black flex-shrink-0 relative overflow-hidden">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="72px"
                            className="object-cover grayscale"
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col justify-between flex-grow min-w-0">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-black leading-tight truncate">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-black mt-0.5">50ml · Extrait de Parfum</p>
                          </div>
                          <p className="text-[13px] font-semibold text-black flex-shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>

                        {/* Qty + remove */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-black">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-black hover:bg-black hover:text-white transition-none text-[14px]"
                            >
                              −
                            </button>
                            <span className="w-8 h-8 flex items-center justify-center text-[12px] font-semibold border-x border-black">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-black hover:bg-black hover:text-white transition-none text-[14px]"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-[11px] text-black hover:underline transition-none uppercase tracking-[0.1em]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-black bg-white">
                {/* Totals */}
                <div className="px-6 py-4 space-y-2">
                  <div className="flex justify-between text-[12px] text-black">
                    <span>Subtotal</span>
                    <span className="font-semibold text-black">${total().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] text-black">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-[15px] font-semibold text-black pt-2 border-t border-black">
                    <span>Total</span>
                    <span>${total().toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <Link
                    href="/checkout"
                    onClick={toggleCart}
                    className="flex items-center justify-center gap-2 w-full border border-black bg-black text-white py-4 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-white hover:text-black transition-none"
                  >
                    Proceed to Checkout
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
