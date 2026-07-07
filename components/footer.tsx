"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const DEFAULT_TAGLINE =
  "Building confidence in the kitchen, one imperfect masterpiece at a time. Because the best food is made with love — and a little chaos.";
const DEFAULT_SOCIAL_BLURB =
  "Follow along on social for behind-the-scenes kitchen moments.";

export default function Footer() {
  const [tagline, setTagline] = useState(DEFAULT_TAGLINE);
  const [socialBlurb, setSocialBlurb] = useState(DEFAULT_SOCIAL_BLURB);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.footerTagline) setTagline(data.footerTagline);
        if (data.footerSocialBlurb) setSocialBlurb(data.footerSocialBlurb);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-8 pt-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-white/10">

          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#006644]">
                <img src="/logo.png" alt="" className="w-5 h-5 object-contain" style={{ filter: "invert(1)", mixBlendMode: "screen" }} />
              </span>
              <span className="font-bold text-lg tracking-tight"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Imperfect Bakers
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {tagline}
            </p>
            <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white">@imperfectbakers</p>
          </div>

          {/* Spacer */}
          <div className="md:col-span-1" />

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-5">Navigate</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Home",              href: "/" },
                { label: "About",             href: "/about" },
                { label: "Our classes",       href: "/classes" },
                { label: "Book a class",      href: "/book-class" },
                { label: "Register interest", href: "/interest" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/60 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="mt-[28px] md:mt-0 md:col-span-3">
            <h4 className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-5">Get in touch</h4>
            <a
              href="mailto:imperfectbakers@gmail.com"
              className="text-sm text-white/60 hover:text-white transition-colors block mb-4 break-all"
            >
              imperfectbakers@gmail.com
            </a>
            <p className="text-xs text-white/40 leading-relaxed">
              {socialBlurb}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 Imperfect Bakers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
