"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const links = [
  { label: "Home",        href: "/" },
  { label: "About",       href: "/about" },
  { label: "Our Classes", href: "/classes" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const el = menuRef.current;
      if (el) el.style.opacity = "0";
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (visible && menuRef.current) {
      requestAnimationFrame(() => {
        if (menuRef.current) menuRef.current.style.opacity = "1";
      });
    }
  }, [visible]);

  return (
    <nav className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-[#e8e4dc]">
      <div className="max-w-7xl mx-auto px-10 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#006644] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" stroke="currentColor" strokeWidth="1.8">
              <line x1="12" y1="3" x2="12" y2="5" />
              <path d="M6 8 Q12 5 18 8" />
              <rect x="5" y="8" width="14" height="10" rx="2" />
              <line x1="5" y1="11" x2="3" y2="11" />
              <line x1="19" y1="11" x2="21" y2="11" />
            </svg>
          </span>
          <span
            className="text-[#006644] font-bold text-base tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Imperfect Bakers
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors whitespace-nowrap ${
                  active
                    ? "text-[#006644] font-semibold"
                    : "text-[#555] hover:text-[#006644] font-normal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="w-px h-5 bg-[#e4dfd5] mx-1" />

          <div className="flex items-center gap-4">
            <Link href="/book-a-class" className="shrink-0">
              <button className="btn-primary btn-sm">Book a Class</button>
            </Link>
            <Link href="/interest" className="shrink-0">
              <button className="btn-secondary btn-sm">I&apos;m Interested</button>
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-[#006644]"
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

      {/* Mobile menu — absolutely positioned so it overlays the page */}
      {visible && (
        <div
          ref={menuRef}
          style={{ opacity: 0, transition: "opacity 0.25s ease" }}
          className="lg:hidden absolute top-full left-0 right-0 z-50 border-t border-[#e4dfd5] bg-[#faf9f6] shadow-lg px-8 py-6 flex flex-col gap-4"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm text-[#006644] tracking-wide py-1"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/book-a-class" onClick={() => setOpen(false)}>
              <button className="btn-primary btn-sm w-full justify-center">Book a Class</button>
            </Link>
            <Link href="/interest" onClick={() => setOpen(false)}>
              <button className="btn-secondary btn-sm w-full justify-center">I&apos;m Interested</button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
