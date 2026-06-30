"use client";

import { useState } from "react";
import Link from "next/link";

const filters = ["Browse by Class Type", "Browse by Date", "Browse by Age", "Class at My Home"];

const classTypes = [
  { label: "Sweet Food",               sub: "Cakes, cookies & pastries",     sessions: "1 session" },
  { label: "Savoury Food",             sub: "Pasta, pizza & hearty meals",    sessions: "2 sessions" },
  { label: "Knife Skills",             sub: "Ages 12+ · Precision techniques", sessions: null },
  { label: "Dietary Requirement Food", sub: "Inclusive & allergen-aware",      sessions: null },
  { label: "Kids Lead Parents",        sub: "Families · Role-reversal fun",    sessions: null },
  { label: "Random Kitchen Fun",       sub: "All ages · Surprise challenges",  sessions: null },
  { label: "Private Group Class",      sub: "Groups & special occasions",      sessions: null },
];

export default function BookAClassPage() {
  const [activeFilter, setActiveFilter] = useState("Browse by Class Type");
  const [activeClass, setActiveClass] = useState<string | null>(null);

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#006644] px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div>
            <span className="section-label">Reserve Your Spot</span>
            <h1
              className="text-5xl md:text-6xl text-white leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Book a class
            </h1>
          </div>
          <div className="flex items-end">
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Browse upcoming sessions and secure your spot in the kitchen.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-[#faf9f6]">
        <div className="max-w-4xl mx-auto">

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-3 mb-12">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 text-xs tracking-[0.12em] uppercase border transition-colors ${
                  activeFilter === f
                    ? "bg-[#006644] text-white border-[#006644]"
                    : "bg-white text-[#6b7280] border-[#e4dfd5] hover:border-[#006644] hover:text-[#006644]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Class list */}
          <div className="divide-y divide-[#e4dfd5] border border-[#e4dfd5]">
            {classTypes.map((c, i) => (
              <button
                key={c.label}
                onClick={() => setActiveClass(activeClass === c.label ? null : c.label)}
                className={`w-full flex items-center justify-between px-8 py-6 text-left transition-colors group ${
                  activeClass === c.label
                    ? "bg-[#006644]"
                    : "bg-white hover:bg-[#faf9f6]"
                }`}
              >
                <div className="flex items-center gap-6">
                  <span className={`text-[0.6875rem] font-semibold tracking-[0.2em] w-6 shrink-0 ${
                    activeClass === c.label ? "text-[#006644]" : "text-[#006644]"
                  }`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className={`font-medium text-base transition-colors ${
                      activeClass === c.label ? "text-white" : "text-[#006644]"
                    }`}
                      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                    >
                      {c.label}
                    </p>
                    <p className={`text-xs mt-0.5 tracking-wide ${
                      activeClass === c.label ? "text-white/40" : "text-[#6b7280]"
                    }`}>
                      {c.sub}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {c.sessions && (
                    <span className={`text-xs tracking-widest uppercase px-3 py-1 ${
                      activeClass === c.label
                        ? "text-[#006644] border border-[#006644]/30"
                        : "text-[#006644] border border-[#e4dfd5]"
                    }`}>
                      {c.sessions}
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 transition-all ${
                      activeClass === c.label
                        ? "text-[#006644] rotate-45"
                        : "text-[#006644] group-hover:translate-x-1"
                    }`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Custom class CTA */}
          <div className="mt-20 bg-[#006644] p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                <span className="section-label">Private Bookings</span>
                <h2
                  className="text-2xl md:text-3xl text-white mt-1 leading-snug"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  Don&apos;t see what you&apos;re looking for?
                </h2>
                <p className="text-white/50 text-sm mt-3 max-w-sm leading-relaxed">
                  Request a private or custom class — at your place or ours. We&apos;ll tailor everything just for you.
                </p>
              </div>
              <Link href="/interest" className="shrink-0">
                <button className="btn-tertiary">
                  Request a class
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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
