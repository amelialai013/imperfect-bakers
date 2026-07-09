"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useScrolled } from "@/hooks/useScrolled";

const links = [
  { label: "Home",        href: "/" },
  { label: "About",       href: "/about" },
  { label: "Our classes", href: "/classes" },
  { label: "Gallery",     href: "/gallery" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const scrolled = useScrolled(10);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animate in on open, animate out on close
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      // Keep element mounted briefly so the close animation can play
      timerRef.current = setTimeout(() => setVisible(false), 220);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [open]);

  // Lock background scroll/focus/clicks while the mobile menu is open
  useEffect(() => {
    const main = document.querySelector("main");
    const footer = document.querySelector("footer");
    if (open) {
      document.body.style.overflow = "hidden";
      main?.setAttribute("inert", "");
      footer?.setAttribute("inert", "");
    } else {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
    }
    return () => {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
    };
  }, [open]);

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
          {links.map((link, _i) => {
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

      {/* Mobile backdrop */}
      {visible && (
        <div
          className="lg:hidden fixed inset-0 top-20 bg-black/40 z-40"
          style={{ animation: open ? "nav-fade-in 0.2s ease forwards" : "nav-fade-out 0.18s ease forwards" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu — fade + clip animation on open/close */}
      {visible && (
        <div
          className="lg:hidden fixed top-20 left-0 right-0 z-50 border-t border-[#e4dfd5] bg-[#faf9f6] shadow-lg px-8 py-6 flex flex-col gap-1"
          style={{
            animation: open
              ? "nav-menu-in 0.28s cubic-bezier(0.16,1,0.3,1) forwards"
              : "nav-menu-out 0.18s ease-in forwards",
          }}
        >
          {links.map((link, i) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`text-base py-3 transition-colors ${i < links.length - 1 ? "border-b border-[#e8e2d9]" : ""} ${
                  active
                    ? "text-[#006644] font-semibold"
                    : "text-[#1a1a1a] font-normal"
                }`}
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="pt-4 flex flex-col gap-3">
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
