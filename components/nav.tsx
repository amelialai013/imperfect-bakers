"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Classes", href: "/classes" },
  { label: "Book a Class", href: "/book-a-class" },
  { label: "I'm Interested!", href: "/interest" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-gray-900">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#2d5a3d] text-white text-base">
            🍳
          </span>
          Imperfect Bakers
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active
                      ? "bg-[#2d5a3d] text-white"
                      : "bg-[#2d5a3d] text-white hover:bg-[#3a7050]"
                  }`}
                >
                  {link.label}
                </button>
              </Link>
            );
          })}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              <button className="w-full text-left px-4 py-2 rounded-full text-sm font-medium bg-[#2d5a3d] text-white">
                {link.label}
              </button>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
