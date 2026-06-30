"use client";

import { useState } from "react";

const classOptions = [
  { name: "Sweet Food",               sub: "Cakes, cookies & treats" },
  { name: "Savoury Food",             sub: "Meals & hearty cooking" },
  { name: "Knife Skills",             sub: "Precision techniques" },
  { name: "Dietary Requirement Food", sub: "Inclusive & allergen-free" },
  { name: "Kids Lead Parents",        sub: "Family role-reversal fun" },
  { name: "Random Kitchen Fun",       sub: "Surprise challenges" },
  { name: "Private Group Class",      sub: "Exclusive class for your group" },
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
                Tell us what you'd like to learn and we'll be in touch as soon as spots open up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <section className="bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12">

          {/* Sidebar */}
          <div className="md:col-span-4 px-8 py-16 md:py-20 border-b md:border-b-0 md:border-r border-[#e4dfd5]">
            <span className="section-label">What to expect</span>
            <div className="mt-8 space-y-10">
              {[
                { step: "01", title: "Tell us about yourself", text: "Fill in your details and let us know which classes interest you most." },
                { step: "02", title: "We'll reach out", text: "We reach out personally when a suitable spot opens up — no automated emails." },
                { step: "03", title: "Get messy", text: "Confirm your booking and come ready to cook, laugh, and have a great time." },
              ].map((s) => (
                <div key={s.step} className="flex gap-5">
                  <span className="text-[0.6875rem] font-semibold tracking-[0.2em] text-[#006644]/40 mt-0.5 shrink-0">{s.step}</span>
                  <div>
                    <p className="text-sm font-medium text-[#1a1a1a] mb-1"
                      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                      {s.title}
                    </p>
                    <p className="text-sm text-[#6b7280] leading-relaxed">{s.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-[#e4dfd5]">
              <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644]/60 mb-3">Contact us directly</p>
              <a href="mailto:imperfectbakers@outlook.com"
                className="text-sm text-[#6b7280] hover:text-[#006644] transition-colors">
                imperfectbakers@outlook.com
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-8 px-8 md:px-16 py-16 md:py-20">
            <form className="space-y-10">

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3">
                    Full Name <span className="text-[#006644]">*</span>
                  </label>
                  <input type="text" placeholder="Jamie Oliver" className="input-elegant" />
                </div>
                <div>
                  <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3">
                    Email <span className="text-[#006644]">*</span>
                  </label>
                  <input type="email" placeholder="jamie@email.com" className="input-elegant" />
                </div>
              </div>

              {/* Phone + Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3">
                    Phone <span className="text-[#b0a898] normal-case font-normal tracking-normal text-xs">(optional)</span>
                  </label>
                  <input type="tel" placeholder="07700 900000" className="input-elegant" />
                </div>
                <div>
                  <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3">
                    Experience Level
                  </label>
                  <select className="input-elegant text-[#1a1a1a]">
                    <option value="">Select your level</option>
                    <option value="complete_beginner">Complete Beginner</option>
                    <option value="some_experience">Some Experience</option>
                    <option value="confident_cook">Confident Cook</option>
                  </select>
                </div>
              </div>

              {/* Class interests */}
              <div>
                <div className="mb-5">
                  <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644]">
                    Classes of interest <span className="text-[#006644]">*</span>
                  </p>
                  <p className="text-xs text-[#b0a898] mt-1">Select as many as you like</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {classOptions.map((c) => {
                    const active = selected.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggle(c.name)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 border text-sm transition-all duration-200 ${
                          active
                            ? "bg-[#006644] border-[#006644] text-white"
                            : "bg-white border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-colors ${
                          active ? "bg-white/20 border-white/50" : "border-[#e4dfd5]"
                        }`}>
                          {active && (
                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3">
                  Anything else we should know?
                </label>
                <textarea
                  rows={4}
                  placeholder="Allergies, group sizes, birthday parties, or anything at all..."
                  className="input-elegant resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <button type="submit" className="btn-primary group">
                  Send my interest
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="text-xs text-[#b0a898] leading-relaxed">
                  We'll never share your details with anyone else.
                </p>
              </div>

            </form>
          </div>
        </div>
      </section>
    </>
  );
}
