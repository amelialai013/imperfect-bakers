"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { label: "Home",        href: "/" },
  { label: "About",       href: "/about" },
  { label: "Our Classes", href: "/classes" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-[#faf9f6]/95 backdrop-blur-sm border-b border-[#e4dfd5]">
      <div className="max-w-7xl mx-auto px-8 h-[72px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a3228] text-white text-sm font-serif font-bold tracking-wide">
            IB
          </span>
          <span
            className="text-[#1a3228] font-serif text-lg tracking-wide font-semibold"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Imperfect Bakers
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors relative pb-0.5 ${
                  active
                    ? "text-[#1a3228] font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[#c9a96e]"
                    : "text-[#6b7280] hover:text-[#1a3228]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link href="/book-a-class">
            <button className="btn-primary text-xs px-6 py-3">
              Book a Class
            </button>
          </Link>

          <Link href="/interest">
            <button className="btn-outline text-xs px-6 py-3">
              I&apos;m Interested
            </button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-[#1a3228]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#e4dfd5] bg-[#faf9f6] px-8 py-6 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-[#1a3228] tracking-wide py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/book-a-class" onClick={() => setOpen(false)}>
              <button className="btn-primary w-full justify-center text-xs">Book a Class</button>
            </Link>
            <Link href="/interest" onClick={() => setOpen(false)}>
              <button className="btn-outline w-full justify-center text-xs">I&apos;m Interested</button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
