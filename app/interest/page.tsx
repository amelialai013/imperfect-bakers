"use client";

import { useState } from "react";

const classOptions = [
  "Sweet Food",
  "Savoury Food",
  "Knife Skills",
  "Dietary Requirement Food",
  "Random Kitchen Fun",
  "Private Group Class",
];

export default function InterestPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#006644] px-8 pt-16 pb-14">
        <div className="max-w-7xl mx-auto">
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Get in touch</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12" style={{ alignItems: "last baseline" }}>
            <h1
              className="text-4xl md:text-5xl text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              <em className="not-italic text-white/50">Register your</em> interest
            </h1>
            <div className="md:ml-auto">
              <p className="text-white/50 text-base leading-relaxed max-w-sm">
                Tell us what you'd like to learn — we'll reach out when a spot opens up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <section className="bg-white px-8 py-20 md:py-28">
        <div className="max-w-2xl mx-auto">
          <form className="space-y-12">

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
              <div>
                <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">
                  Full Name
                </label>
                <input type="text" placeholder="Jamie Oliver" className="input-underline" />
              </div>
              <div>
                <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">
                  Email
                </label>
                <input type="email" placeholder="jamie@email.com" className="input-underline" />
              </div>
              <div>
                <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">
                  Phone <span className="text-[#c4bdb3] normal-case font-normal tracking-normal text-xs ml-1">optional</span>
                </label>
                <input type="tel" placeholder="07700 900000" className="input-underline" />
              </div>
              <div>
                <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">
                  Experience Level
                </label>
                <select className="input-underline text-[#1a1a1a]">
                  <option value="">Select your level</option>
                  <option value="complete_beginner">Complete Beginner</option>
                  <option value="some_experience">Some Experience</option>
                  <option value="confident_cook">Confident Cook</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#e4dfd5]" />

            {/* Class interests */}
            <div>
              <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-6">
                Classes of interest
              </label>
              <div className="flex flex-wrap gap-2.5">
                {classOptions.map((name) => {
                  const active = selected.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggle(name)}
                      className={`px-5 py-2.5 text-sm border transition-all duration-200 ${
                        active
                          ? "bg-[#006644] border-[#006644] text-white"
                          : "bg-transparent border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                      }`}
                      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#e4dfd5]" />

            {/* Notes */}
            <div>
              <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">
                Anything else?
              </label>
              <textarea
                rows={3}
                placeholder="Allergies, group sizes, special occasions..."
                className="input-underline resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <button type="submit" className="btn-primary group shrink-0">
                Send my interest
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <p className="text-sm text-[#b0a898] leading-relaxed">
                Or email us at{" "}
                <a href="mailto:imperfectbakers@outlook.com" className="text-[#006644] hover:underline transition-colors">
                  imperfectbakers@outlook.com
                </a>
              </p>
            </div>

          </form>
        </div>
      </section>
    </>
  );
}
