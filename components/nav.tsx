"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useScrolled } from "@/hooks/useScrolled";

const links = [
  { label: "Home",        href: "/" },
  { label: "About",       href: "/about" },
  { label: "Our classes", href: "/classes" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const scrolled = useScrolled(10);

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
    <nav className={`sticky top-0 z-[9999] bg-[#faf9f6] transition-shadow duration-300 ${scrolled ? "shadow-sm" : ""}`}>
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#006644] shrink-0">
            <img src="/logo.png" alt="" className="w-5 h-5 object-contain" style={{ filter: "invert(1)", mixBlendMode: "screen" }} />
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

          <div className="flex items-center gap-4">
            <Link href="/book-class" className="btn-primary btn-sm shrink-0">Book class</Link>
            <Link href="/interest" className="btn-secondary btn-sm shrink-0">I&apos;m interested</Link>
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
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-sm tracking-wide py-1 transition-colors ${
                  active
                    ? "text-[#006644] font-semibold"
                    : "text-[#555] font-normal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/book-class" onClick={() => setOpen(false)} className="btn-primary btn-sm w-full justify-center">
              Book class
            </Link>
            <Link href="/interest" onClick={() => setOpen(false)} className="btn-secondary btn-sm w-full justify-center">
              I&apos;m interested
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
