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
      <section className="bg-[#faf9f6] px-8 pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1
            className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Register <em className="not-italic text-[#006644]">interest</em>
          </h1>
          <p className="text-[#9ca3af] text-sm leading-relaxed max-w-xs md:text-right pb-1 text-balance">
            Tell us what you&apos;d like to learn — we&apos;ll reach out when a spot opens up.
          </p>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <section className="bg-[#faf9f6] px-8 pt-10 pb-12 md:pt-12 md:pb-16">
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
                  Phone
                </label>
                <input type="tel" placeholder="0400 000 000" className="input-underline" />
              </div>
              <div>
                <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">
                  Experience Level
                </label>
                <select className="input-underline text-[#1a1a1a]">
                  <option value="">Select your level</option>
                  <option value="complete_beginner">Complete beginner</option>
                  <option value="some_experience">Some experience</option>
                  <option value="confident_cook">Confident cook</option>
                </select>
              </div>
            </div>

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

            {/* Notes */}
            <div>
              <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">
                Anything else?
              </label>
              <textarea
                rows={2}
                placeholder="Allergies, group sizes, special occasions..."
                className="input-underline resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10 pt-4">
              <button type="submit" className="btn-primary group shrink-0 self-start">
                Register interest
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="text-left sm:text-right">
                <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#c4bdb3] mb-1">Or reach out directly</span>
                <a
                  href="mailto:imperfectbakers@outlook.com"
                  className="text-sm text-[#1a1a1a] hover:text-[#006644] transition-colors duration-200"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  imperfectbakers@outlook.com
                </a>
              </div>
            </div>

          </form>
        </div>
      </section>
    </>
  );
}
