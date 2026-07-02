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

const inputClass =
  "w-full bg-[#f5f2ed] rounded-lg px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#b8b0a6] focus:outline-none focus:bg-[#eeeae4] transition-colors";

const inputErrorClass =
  "w-full rounded-lg px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#b8b0a6] focus:outline-none transition-colors bg-red-50 border border-red-300 focus:border-red-400";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function InterestPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const email = (fd.get("email") as string).trim();
    const phone = (fd.get("phone") as string).trim();

    const errors: FieldErrors = {};
    if (!name) errors.name = "Please enter your full name";
    if (!email) errors.email = "Please enter your email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Please enter a valid email address";
    if (!phone) errors.phone = "Please enter your phone number";
    else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(phone))
      errors.phone = "Please enter a valid phone number";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    // TODO: submit form
  }

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
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs md:text-right pb-1 text-balance">
            Tell us what you&apos;d like to learn — we&apos;ll reach out when a spot opens up.
          </p>
        </div>
      </section>

      {/* ── FORM ─────────────────────────────────────────────── */}
      <section className="bg-[#faf9f6] px-8 pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-2xl mx-auto">
          <form className="space-y-8" onSubmit={handleSubmit} noValidate>

            {/* Contact Details */}
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-8">Contact details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="sm:col-span-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    className={fieldErrors.name ? inputErrorClass : inputClass}
                    onChange={() => fieldErrors.name && setFieldErrors((p) => ({ ...p, name: undefined }))}
                  />
                  {fieldErrors.name && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.name}</p>}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className={fieldErrors.email ? inputErrorClass : inputClass}
                    onChange={() => fieldErrors.email && setFieldErrors((p) => ({ ...p, email: undefined }))}
                  />
                  {fieldErrors.email && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.email}</p>}
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    className={fieldErrors.phone ? inputErrorClass : inputClass}
                    onChange={() => fieldErrors.phone && setFieldErrors((p) => ({ ...p, phone: undefined }))}
                  />
                  {fieldErrors.phone && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.phone}</p>}
                </div>

                <div className="sm:col-span-2 mt-4">
                  <div className="relative inline-flex">
                    <select name="experience" className="appearance-none bg-white border border-[#e4dfd5] rounded-full pl-4 pr-9 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#006644] cursor-pointer transition-colors h-[46px]">
                      <option value="">Experience level</option>
                      <option value="complete_beginner">Complete beginner</option>
                      <option value="some_experience">Some experience</option>
                      <option value="confident_cook">Confident cook</option>
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

            {/* Class interests */}
            <div className="mt-[60px]">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-8">Classes of interest</p>
              <div className="flex flex-wrap gap-2.5 mt-3">
                {classOptions.map((name) => {
                  const active = selected.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggle(name)}
                      className={`px-5 py-2.5 text-sm font-medium rounded-full border transition-all duration-200 ${
                        active
                          ? "bg-[#006644] border-[#006644] text-white"
                          : "bg-white border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
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
            <div className="mt-[60px]">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-8">Anything else?</p>
              <textarea
                name="notes"
                rows={3}
                placeholder="Dietary requirements, allergies, questions…"
                className={`${inputClass} resize-none`}
                style={{ scrollbarWidth: "thin", scrollbarColor: "#c8c0b4 transparent" } as React.CSSProperties}
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 pt-2">
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
