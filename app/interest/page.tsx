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
      <section className="bg-[#00704d] px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div>
            <span className="section-label">Get in Touch</span>
            <h1
              className="text-5xl md:text-6xl text-white leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Register Your Interest
            </h1>
          </div>
          <div className="flex items-end">
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Tell us what you&apos;d like to learn and we&apos;ll be in touch as soon as spots open up.
            </p>
          </div>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">

          {/* Sidebar */}
          <div className="md:col-span-4">
            <span className="section-label">What to Expect</span>
            <div className="mt-6 space-y-6">
              {[
                { step: "01", text: "Fill in the form with your details and class preferences." },
                { step: "02", text: "We&apos;ll reach out personally when a suitable spot opens up." },
                { step: "03", text: "Confirm your booking and get ready to get messy!" },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <span className="text-xs tracking-[0.2em] text-[#c9a96e] mt-0.5 shrink-0">{s.step}</span>
                  <p className="text-[#6b7280] text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: s.text }} />
                </div>
              ))}
            </div>
            <div className="mt-10 pt-10 border-t border-[#e4dfd5]">
              <p className="text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">Contact us directly</p>
              <a href="mailto:imperfectbakers@outlook.com"
                className="text-sm text-[#6b7280] hover:text-[#00704d] transition-colors">
                imperfectbakers@outlook.com
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-8">
            <form className="space-y-8">
              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">
                    Full Name <span className="text-[#c9a96e]">*</span>
                  </label>
                  <input type="text" placeholder="Jamie Oliver" className="input-elegant" />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">
                    Email <span className="text-[#c9a96e]">*</span>
                  </label>
                  <input type="email" placeholder="jamie@email.com" className="input-elegant" />
                </div>
              </div>

              {/* Phone + Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">
                    Phone <span className="text-[#b0a898]">(optional)</span>
                  </label>
                  <input type="tel" placeholder="07700 900000" className="input-elegant" />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">
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
                <p className="text-xs tracking-[0.15em] uppercase text-[#00704d] mb-1">
                  Classes of Interest <span className="text-[#c9a96e]">*</span>
                </p>
                <p className="text-xs text-[#b0a898] mb-4 tracking-wide">Select as many as you like</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e4dfd5]">
                  {classOptions.map((c) => {
                    const active = selected.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggle(c.name)}
                        className={`flex items-start justify-between px-6 py-4 text-left transition-colors group ${
                          active
                            ? "bg-[#00704d]"
                            : "bg-white hover:bg-[#faf9f6]"
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-medium transition-colors ${
                            active ? "text-white" : "text-[#00704d]"
                          }`}>
                            {c.name}
                          </p>
                          <p className={`text-xs mt-0.5 tracking-wide ${
                            active ? "text-white/40" : "text-[#6b7280]"
                          }`}>
                            {c.sub}
                          </p>
                        </div>
                        <div className={`w-4 h-4 border flex items-center justify-center shrink-0 mt-0.5 ml-4 transition-colors ${
                          active
                            ? "bg-[#c9a96e] border-[#c9a96e]"
                            : "border-[#e4dfd5] group-hover:border-[#00704d]"
                        }`}>
                          {active && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">
                  Anything else we should know?
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about allergies, group sizes, birthday parties, or anything at all..."
                  className="input-elegant resize-none"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full sm:w-auto justify-center">
                  Send My Interest
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
