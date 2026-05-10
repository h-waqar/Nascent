import React from 'react';
import Link from 'next/link';

/**
 * Brand Masthead (D-03, D-09)
 * High-contrast minimalist header with extreme scale contrast.
 */
export const Masthead: React.FC = () => {
  return (
    <header className="w-full border-b border-black py-4 px-6 lg:px-8 bg-white sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto flex justify-between items-baseline">
        <Link href="/" className="text-3xl lg:text-5xl font-light tracking-tighter uppercase">
          Nascent
        </Link>
        
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/collections" className="text-[11px] font-semibold tracking-widest uppercase hover:underline">
            Collections
          </Link>
          <Link href="/about" className="text-[11px] font-semibold tracking-widest uppercase hover:underline">
            Archive
          </Link>
          <Link href="/cart" className="text-[11px] font-semibold tracking-widest uppercase hover:underline">
            Cart (0)
          </Link>
        </nav>

        <div className="md:hidden text-[11px] font-semibold tracking-widest uppercase">
          Menu
        </div>
      </div>
    </header>
  );
};
