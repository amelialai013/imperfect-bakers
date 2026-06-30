"use client";

import { useState } from "react";
import Link from "next/link";



const classTypes = [
  { label: "Sweet Food",               sub: "Cakes, cookies & pastries",     sessions: "1 session" },
  { label: "Savoury Food",             sub: "Pasta, pizza & hearty meals",    sessions: "2 sessions" },
  { label: "Knife Skills",             sub: "Ages 12+ · Precision techniques", sessions: null },
  { label: "Dietary Requirement Food", sub: "Inclusive & allergen-aware",      sessions: null },
  { label: "Random Kitchen Fun",       sub: "All ages · Surprise challenges",  sessions: null },
  { label: "Private Group Class",      sub: "Groups & special occasions",      sessions: null },
];

export default function BookAClassPage() {
  const [activeClass, setActiveClass] = useState<string | null>(null);

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#006644] px-8 pt-16 pb-14">
        <div className="max-w-7xl mx-auto">
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Reserve your spot</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12" style={{ alignItems: "last baseline" }}>
            <h1
              className="text-4xl md:text-5xl text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              <em className="not-italic text-white/50">Class</em> bookings
            </h1>
          <div className="md:ml-auto">
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Browse upcoming sessions and secure your spot in the kitchen.
            </p>
          </div>
          </div>
        </div>
      </section>

      {/* ── CLASS BROWSER ────────────────────────────────────── */}
      <section className="pt-10 pb-20 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">

          {/* Class list — clean divider rows */}
          <div>
            {classTypes.map((c, i) => (
              <button
                key={c.label}
                onClick={() => setActiveClass(activeClass === c.label ? null : c.label)}
                className={`w-full group text-left py-7 flex items-center justify-between transition-colors ${
                  i > 0 ? "border-t border-[#e4dfd5]" : ""
                }`}
              >
                <div className="flex items-baseline gap-7">
                  <div>
                    <p
                      className={`text-lg font-medium leading-snug transition-colors ${
                        activeClass === c.label ? "text-[#006644]" : "text-[#1a1a1a] group-hover:text-[#006644]"
                      }`}
                      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                    >
                      {c.label}
                    </p>
                    <p className="text-[#6b7280] text-sm mt-1 leading-relaxed">{c.sub}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0 ml-8">
                  {c.sessions && (
                    <span className="text-[0.6875rem] tracking-[0.15em] uppercase text-[#006644] hidden sm:block">
                      {c.sessions}
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 transition-all duration-300 ${
                      activeClass === c.label
                        ? "text-[#006644]"
                        : "text-[#c8c0b4] group-hover:text-[#006644] group-hover:translate-x-1"
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
            <div className="border-t border-[#e4dfd5]" />
          </div>

          {/* Private bookings CTA */}
          <div className="mt-10 pt-10">
            <div className="flex flex-col md:flex-row md:items-end gap-10 md:gap-24">
              <div className="flex-1">
                <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">Private bookings</span>
                <h2
                  className="text-2xl md:text-3xl text-[#1a1a1a] leading-snug mb-3"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  Don&apos;t see what you&apos;re looking for?
                </h2>
                <p className="text-[#6b7280] text-sm leading-relaxed max-w-sm">
                  Request a private or custom class — at your place or ours. We&apos;ll tailor everything just for you.
                </p>
              </div>
              <Link href="/interest" className="shrink-0">
                <button className="btn-secondary">
                  Request a class
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
