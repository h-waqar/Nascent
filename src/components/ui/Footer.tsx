import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/shipping", label: "Shipping" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-black">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-16 max-w-[1440px] mx-auto gap-8">
        <div className="text-lg font-black text-black uppercase tracking-tighter">
          Nascent
        </div>
        <nav className="flex flex-wrap gap-8 justify-center">
          {FOOTER_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] hover:text-black transition-none"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="font-['Inter'] uppercase tracking-[0.15em] text-[10px] text-[#4c4546] text-center md:text-right">
          ©{new Date().getFullYear()} Nascent Fragrances. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
