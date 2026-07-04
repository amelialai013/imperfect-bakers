"use client";

import { useState, useRef, useEffect } from "react";

type ExperienceLevel = { value: string; label: string };

const DEFAULT_LEVELS: ExperienceLevel[] = [
  { value: "beginner", label: "New to cooking — please guide me through everything" },
  { value: "intermediate", label: "Some experience — happy to receive tips along the way" },
  { value: "expert", label: "Confident cook — only step in if I ask" },
];

const classOptions = [
  "Sweet Food",
  "Savoury Food",
  "Knife Skills",
  "Dietary Requirement Food",
  "Random Kitchen Fun",
  "Private Group Class",
];

const inputClass =
  "w-full bg-transparent border-0 border-b border-[#c8c0b4] px-0 py-3 text-sm text-[#1a1a1a] placeholder-[#6b7280] focus:outline-none focus:border-[#006644] transition-colors";

const inputErrorClass =
  "w-full bg-transparent border-0 border-b border-red-400 px-0 py-3 text-sm text-[#1a1a1a] placeholder-[#6b7280] focus:outline-none focus:border-red-500 transition-colors";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

export default function InterestPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [levels, setLevels] = useState<ExperienceLevel[]>(DEFAULT_LEVELS);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Refs — avoids FormData / form-submit event bugs on Safari desktop
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const experienceRef = useRef<HTMLSelectElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (submitted) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [submitted]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { if (data.experienceLevels?.length) setLevels(data.experienceLevels); })
      .catch(() => {});
  }, []);

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  async function handleSubmit() {
    const name = nameRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    const phone = phoneRef.current?.value.trim() ?? "";
    const experience = experienceRef.current?.value ?? "";
    const notes = notesRef.current?.value.trim() ?? "";

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
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, experience, classes: selected, notes }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSubmitError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <>
        <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
          <div className="max-w-7xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Register <em className="not-italic text-[#1a1a1a]">interest</em>
            </h1>
          </div>
        </section>
        <section className="bg-[#faf9f6] pt-14 pb-32">
          <div className="max-w-2xl mx-auto px-8">
            <h2 className="text-3xl text-[#006644] mb-4 leading-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              We&apos;ll be in touch!
            </h2>
            <p className="text-[#6b7280] text-sm leading-relaxed mb-3 max-w-sm">
              Thanks for registering your interest. We&apos;ll reach out as soon as a relevant session opens up.
            </p>
            <p className="text-[#1a1a1a] text-sm leading-relaxed mb-10 max-w-sm font-semibold">
              Can&apos;t find the email? Check your spam or junk folder.
            </p>
            <a href="/classes" className="btn-secondary">Browse our classes</a>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1
            className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Register <em className="not-italic text-[#1a1a1a]">interest</em>
          </h1>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs md:text-right pb-1 text-balance">
            Tell us what you&apos;d like to learn — we&apos;ll reach out when a spot opens up.
          </p>
        </div>
      </section>

      {/* ── FORM — no <form> element to avoid Safari desktop event bugs ── */}
      <section className="bg-[#faf9f6] pt-10 pb-12 md:pt-12 md:pb-16">
        <div className="max-w-2xl mx-auto px-8 space-y-8">

          {/* Contact Details */}
          <div>
            <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-4">Contact details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              <div className="sm:col-span-2">
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Full name"
                  autoComplete="name"
                  className={fieldErrors.name ? inputErrorClass : inputClass}
                  onChange={() => fieldErrors.name && setFieldErrors((p) => ({ ...p, name: undefined }))}
                />
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.name}</p>}
              </div>

              <div>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  className={fieldErrors.email ? inputErrorClass : inputClass}
                  onChange={() => fieldErrors.email && setFieldErrors((p) => ({ ...p, email: undefined }))}
                />
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.email}</p>}
              </div>

              <div>
                <input
                  ref={phoneRef}
                  type="tel"
                  placeholder="Phone"
                  autoComplete="tel"
                  className={fieldErrors.phone ? inputErrorClass : inputClass}
                  onChange={() => fieldErrors.phone && setFieldErrors((p) => ({ ...p, phone: undefined }))}
                />
                {fieldErrors.phone && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.phone}</p>}
              </div>

              <div className="sm:col-span-2 mt-4">
                <div className="relative inline-flex">
                  <select
                    ref={experienceRef}
                    className="appearance-none bg-white border border-[#e4dfd5] rounded-full pl-5 pr-9 text-sm font-medium text-[#1a1a1a] focus:outline-none focus:border-[#006644] cursor-pointer transition-colors h-[46px]"
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                  >
                    <option value="">Experience level</option>
                    {levels.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
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
            <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-8">Classes of interest</p>
            <div className="flex flex-wrap gap-2.5 mt-3">
              {classOptions.map((name) => {
                const active = selected.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggle(name)}
                    className={`px-5 py-2.5 text-sm font-medium rounded-full border transition-colors duration-200 ${
                      active
                        ? "bg-[#006644] border-[#006644] text-white"
                        : "bg-white border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                    }`}
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif", WebkitAppearance: "none", appearance: "none", touchAction: "manipulation", position: "relative", zIndex: 1 }}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-[60px]">
            <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-4">Anything else?</p>
            <textarea
              ref={notesRef}
              rows={3}
              placeholder="Dietary requirements, allergies, questions…"
              className={`${inputClass} resize-none`}
              style={{ scrollbarWidth: "thin", scrollbarColor: "#c8c0b4 transparent" } as React.CSSProperties}
            />
          </div>

          {/* Submit */}
          {submitError && <p className="text-sm text-red-500 mt-2">{submitError}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 pt-2">
            <button
              type="button"
              onClick={() => { if (!submitting) handleSubmit(); }}
              disabled={submitting}
              className="btn-primary group shrink-0 self-start"
              style={{ WebkitAppearance: "none", appearance: "none", touchAction: "manipulation", position: "relative", zIndex: 1 }}
            >
              {submitting ? "Submitting…" : "Register interest"}
              {!submitting && (
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            <div className="text-left sm:text-right">
              <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-1">Or reach out directly</span>
              <a
                href="mailto:imperfectbakers@gmail.com"
                className="text-sm text-[#1a1a1a] hover:text-[#006644] transition-colors duration-200"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                imperfectbakers@gmail.com
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
