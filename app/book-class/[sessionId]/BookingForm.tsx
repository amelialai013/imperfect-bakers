"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { ClassSession } from "@/lib/types";

type Counts = { child: number; youngAdult: number; adult: number };

const inputClass =
  "w-full bg-transparent border-0 border-b border-[#c8c0b4] px-0 py-3 text-sm text-[#1a1a1a] placeholder-[#6b7280] focus:outline-none focus:border-[#006644] transition-colors";

const inputErrorClass =
  "w-full bg-transparent border-0 border-b border-red-400 px-0 py-3 text-sm text-[#1a1a1a] placeholder-[#6b7280] focus:outline-none focus:border-red-500 transition-colors";

const scrollbarStyle = {
  scrollbarWidth: "thin" as const,
  scrollbarColor: "#c8c0b4 transparent",
} as React.CSSProperties;

function Counter({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm text-[#1a1a1a]">{label}</p>
        <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <div
          role="button"
          tabIndex={0}
          onPointerDown={() => onChange(Math.max(0, value - 1))}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onChange(Math.max(0, value - 1)); }}
          className="w-11 h-11 bg-[#f5f2ed] rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#006644] hover:text-white transition-colors text-base cursor-pointer select-none"
        >
          −
        </div>
        <span className="w-6 text-center text-base font-semibold text-[#1a1a1a] tabular-nums">{value}</span>
        <div
          role="button"
          tabIndex={0}
          onPointerDown={() => onChange(value + 1)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onChange(value + 1); }}
          className="w-11 h-11 bg-[#f5f2ed] rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#006644] hover:text-white transition-colors text-base cursor-pointer select-none"
        >
          +
        </div>
      </div>
    </div>
  );
}

export default function BookingForm({ session }: { session: ClassSession }) {
  const [counts, setCounts] = useState<Counts>({ child: 0, youngAdult: 0, adult: 0 });
  const [paymentStatus, setPaymentStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string; email?: string; phone?: string;
    attendees?: string; payment?: string; paymentOther?: string;
  }>({});

  // Refs to read input values without FormData (avoids Safari <form> bugs)
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const paymentOtherRef = useRef<HTMLInputElement>(null);

  const totalPeople = counts.child + counts.youngAdult + counts.adult;
  const isFull = session.spotsLeft === 0;

  function setCount(key: keyof Counts, value: number) {
    const otherTotal = Object.entries(counts)
      .filter(([k]) => k !== key)
      .reduce((sum, [, v]) => sum + v, 0);
    const clamped = Math.min(value, session.spotsLeft - otherTotal);
    setCounts((prev) => ({ ...prev, [key]: Math.max(0, clamped) }));
    if (fieldErrors.attendees) setFieldErrors((prev) => ({ ...prev, attendees: undefined }));
  }

  async function handleSubmit() {
    const name = nameRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    const phone = phoneRef.current?.value.trim() ?? "";
    const notes = notesRef.current?.value.trim() ?? "";
    const paymentOther = paymentOtherRef.current?.value.trim() ?? "";

    const errors: typeof fieldErrors = {};
    if (!name) errors.name = "Please enter your full name";
    if (!email) errors.email = "Please enter your email address";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address";
    if (!phone) errors.phone = "Please enter your phone number";
    else if (!/^[\d\s\+\-\(\)]{7,15}$/.test(phone)) errors.phone = "Please enter a valid phone number";
    if (totalPeople < 1) errors.attendees = "Please add at least one person";
    if (totalPeople > session.spotsLeft) errors.attendees = `Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left — you requested ${totalPeople}`;
    if (!paymentStatus) errors.payment = "Please select a payment status";
    if (paymentStatus === "other" && !paymentOther) errors.paymentOther = "Please add a note";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        name,
        email,
        phone,
        counts,
        totalPeople,
        paymentStatus,
        paymentOther: paymentStatus === "other" ? paymentOther : "",
        notes,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setFieldErrors({ name: data.error ?? "Something went wrong. Please try again." });
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="max-w-xl">
        <h2 className="text-3xl text-[#1a1a1a] mb-4 leading-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
          You&apos;re on the list!
        </h2>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-10 max-w-sm">
          We confirm classes once we have enough students signed up. A confirmation email will be on its way shortly.
        </p>
        <Link href="/book-class" className="btn-secondary">Browse more classes</Link>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="max-w-xl">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-[#6b7280] mb-6">Session full</p>
        <h2 className="text-3xl text-[#1a1a1a] mb-4" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
          No spots left.
        </h2>
        <p className="text-[#6b7280] text-sm mb-10 leading-relaxed max-w-sm">
          Register your interest and we&apos;ll let you know when a new session opens up.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link href="/interest" className="btn-primary">Register interest</Link>
          <Link href="/book-class" className="btn-secondary">Browse other classes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[60px] lg:gap-20 items-start">

      {/* ── Form — no <form> element to avoid Safari desktop event bugs ── */}
      <div>

        {/* 01 — Your details */}
        <div className="mb-12">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-4">Your details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input
                ref={nameRef}
                type="text"
                placeholder="Full name"
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
                className={fieldErrors.phone ? inputErrorClass : inputClass}
                onChange={() => fieldErrors.phone && setFieldErrors((p) => ({ ...p, phone: undefined }))}
              />
              {fieldErrors.phone && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.phone}</p>}
            </div>
          </div>
        </div>

        {/* 02 — Attendees */}
        <div className="mt-[60px] mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">Attendees</p>
            <span className="text-sm text-[#1a1a1a]">{totalPeople} / {session.spotsLeft}</span>
          </div>
          {(() => {
            const types = session.attendeeTypes?.length ? session.attendeeTypes : ["child", "youngAdult", "adult"];
            const rows = [
              { key: "child" as const, label: "Child", sub: "7–17 yrs" },
              { key: "youngAdult" as const, label: "Young Adult", sub: "18–34 yrs" },
              { key: "adult" as const, label: "Adult", sub: "35+ yrs" },
            ].filter((r) => types.includes(r.key));
            return (
              <div className={`divide-y divide-[#f0ece4] ${fieldErrors.attendees ? "rounded-lg ring-1 ring-red-300 bg-red-50/40 px-2" : ""}`}>
                {rows.map((r) => (
                  <Counter key={r.key} label={r.label} sub={r.sub} value={counts[r.key]} onChange={(v) => setCount(r.key, v)} />
                ))}
              </div>
            );
          })()}
          {fieldErrors.attendees && <p className="text-xs text-red-500 mt-2">{fieldErrors.attendees}</p>}

          {totalPeople > 0 && (
            <div className="mt-6 flex items-center justify-between rounded-xl bg-[#006644]/8 px-5 py-4">
              <p className="text-sm text-[#1a1a1a]">{totalPeople} {totalPeople === 1 ? "person" : "people"} × ${session.price}</p>
              <p className="text-2xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                ${(totalPeople * session.price).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* 03 — Payment */}
        <div className="mt-[60px] mb-12">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-8">Payment</p>
          <div className="mb-8">
            <p className="text-xs text-[#6b7280] mb-2">Include your name and class name in the reference</p>
            <p className="text-sm text-[#1a1a1a]">Transfer to <span className="font-semibold">Sarah Jasper</span></p>
            <p className="text-sm text-[#1a1a1a] mt-0.5">BSB <span className="font-medium">733-100</span></p>
            <p className="text-sm text-[#1a1a1a] mt-0.5">Account <span className="font-medium">759127</span></p>
          </div>
          <p className="text-xs text-[#6b7280] mb-3">Payment status</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "completed", label: "Paid" },
              { value: "within-week", label: "Paying this week" },
              { value: "other", label: "Other" },
            ].map((opt) => (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onPointerDown={() => { setPaymentStatus(opt.value); setFieldErrors((p) => ({ ...p, payment: undefined })); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setPaymentStatus(opt.value); setFieldErrors((p) => ({ ...p, payment: undefined })); } }}
                className={`px-5 py-2.5 text-sm font-medium border transition-colors duration-200 rounded-full cursor-pointer select-none ${
                  paymentStatus === opt.value
                    ? "bg-[#006644] border-[#006644] text-white"
                    : fieldErrors.payment
                    ? "bg-red-50 border-red-300 text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                    : "bg-white border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                }`}
              >
                {opt.label}
              </div>
            ))}
          </div>
          {paymentStatus === "other" && (
            <div className="mt-3">
              <input
                ref={paymentOtherRef}
                type="text"
                placeholder="Add note"
                className={fieldErrors.paymentOther ? inputErrorClass : inputClass}
                onChange={() => fieldErrors.paymentOther && setFieldErrors((p) => ({ ...p, paymentOther: undefined }))}
              />
              {fieldErrors.paymentOther && <p className="text-xs text-red-500 mt-1.5">{fieldErrors.paymentOther}</p>}
            </div>
          )}
          {fieldErrors.payment && <p className="text-xs text-red-500 mt-2">{fieldErrors.payment}</p>}
        </div>

        {/* 04 — Notes */}
        <div className="mt-[60px]">
          <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-4">Anything else?</p>
          <textarea
            ref={notesRef}
            rows={3}
            placeholder="Dietary requirements, allergies, questions…"
            className={inputClass + " resize-none"}
            style={scrollbarStyle}
          />
        </div>

        <div className="mt-8 pt-2 flex flex-col sm:flex-row sm:items-center gap-6">
          <div
            role="button"
            tabIndex={0}
            onPointerDown={() => { if (!submitting) handleSubmit(); }}
            onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !submitting) handleSubmit(); }}
            className="btn-primary group self-start cursor-pointer select-none"
            aria-disabled={submitting}
          >
            {submitting ? "Requesting…" : "Request reservation"}
            {!submitting && (
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
          <p className="text-xs text-[#6b7280] leading-relaxed max-w-xs">
            We confirm classes once enough students sign up — you&apos;ll hear from us soon.
          </p>
        </div>

      </div>

      {/* ── Sidebar ── */}
      <div className="lg:sticky lg:top-28">
        <div className="bg-[#006644] rounded-2xl p-6 text-white flex flex-col gap-3">
          <div>
            <span className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-white/40">{session.classLabel}</span>
            <h3 className="text-lg font-medium leading-snug mt-1 text-white" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              {session.sessionName || session.classLabel}
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <svg className="w-3 h-3 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{session.date}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <svg className="w-3 h-3 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{session.time}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <svg className="w-3 h-3 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{session.location}</span>
            </div>
          </div>
          <div className="h-px bg-white/10 my-1" />
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold text-white" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              ${session.price}
            </p>
            <p className="text-xs text-white/40">per person</p>
          </div>
        </div>
      </div>

    </div>
  );
}
