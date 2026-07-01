"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClassSession } from "@/lib/types";

type Counts = { child: number; youngAdult: number; adult: number };

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
    <div className="flex items-center justify-between py-5 border-b border-[#f0ece4] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">{label}</p>
        <p className="text-xs text-[#9ca3af] mt-0.5 tracking-wide">{sub}</p>
      </div>
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 flex items-center justify-center text-[#9ca3af] hover:text-[#006644] transition-colors text-lg leading-none"
        >
          −
        </button>
        <span className="w-5 text-center text-base font-medium text-[#1a1a1a] tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-7 h-7 flex items-center justify-center text-[#9ca3af] hover:text-[#006644] transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-transparent border-0 border-b border-[#e4dfd5] pb-2 pt-1 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] transition-colors";

const labelClass =
  "block text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3";

export default function BookingForm({ session }: { session: ClassSession }) {
  const [counts, setCounts] = useState<Counts>({ child: 0, youngAdult: 0, adult: 0 });
  const [paymentStatus, setPaymentStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const totalPeople = counts.child + counts.youngAdult + counts.adult;
  const isFull = session.spotsLeft === 0;

  function setCount(key: keyof Counts, value: number) {
    setCounts((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (totalPeople < 1) { setError("Please add at least one person."); return; }
    if (totalPeople > session.spotsLeft) {
      setError(`Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} left — you requested ${totalPeople}.`);
      return;
    }

    const fd = new FormData(e.currentTarget);
    setSubmitting(true);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone") ?? "",
        counts,
        totalPeople,
        paymentStatus,
        notes: fd.get("notes") ?? "",
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="max-w-2xl">
        <div className="border-l-2 border-[#006644] pl-6 mb-10">
          <p className="text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-1">{session.classLabel}</p>
          <p className="text-[#1a1a1a] font-medium text-base">{session.date} · {session.time}</p>
          <p className="text-[#9ca3af] text-sm mt-0.5">{session.location}</p>
        </div>
        <h2 className="text-3xl text-[#1a1a1a] mb-4" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
          You&apos;re on the list
        </h2>
        <p className="text-[#6b7280] text-base leading-relaxed mb-8 max-w-md">
          A confirmation email will be sent once the class is confirmed — we run classes once we have enough students signed up. We&apos;ll be in touch soon.
        </p>
        <Link href="/book-a-class"><button className="btn-secondary">Browse more classes</button></Link>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="max-w-2xl">
        <div className="border-l-2 border-[#006644] pl-6 mb-10">
          <p className="text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-1">{session.classLabel}</p>
          <p className="text-[#1a1a1a] font-medium text-base">{session.date} · {session.time}</p>
          <p className="text-[#9ca3af] text-sm mt-0.5">{session.location}</p>
        </div>
        <p className="text-[#1a1a1a] text-lg mb-3">This session is fully booked.</p>
        <p className="text-[#6b7280] text-sm mb-8 leading-relaxed max-w-sm">
          Register your interest and we&apos;ll let you know when a new session opens up.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link href="/interest"><button className="btn-primary">Register interest</button></Link>
          <Link href="/book-a-class"><button className="btn-secondary">Browse other classes</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-16 lg:gap-24 items-start">

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-14">

        {/* Your details */}
        <div>
          <p className={labelClass}>Your details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
            <div className="sm:col-span-2">
              <label className="block text-xs text-[#9ca3af] mb-2">Full name <span className="text-[#006644]">*</span></label>
              <input required name="name" type="text" placeholder="Jane Smith" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#9ca3af] mb-2">Email <span className="text-[#006644]">*</span></label>
              <input required name="email" type="email" placeholder="jane@example.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-[#9ca3af] mb-2">Phone <span className="text-[#9ca3af]">(optional)</span></label>
              <input name="phone" type="tel" placeholder="04xx xxx xxx" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Number of people */}
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <p className={labelClass}>Number of people</p>
            <span className="text-[0.65rem] text-[#9ca3af]">{totalPeople} / {session.spotsLeft} spots</span>
          </div>
          <Counter label="Child" sub="7–17 yrs" value={counts.child} onChange={(v) => setCount("child", v)} />
          <Counter label="Young Adult" sub="18–34 yrs" value={counts.youngAdult} onChange={(v) => setCount("youngAdult", v)} />
          <Counter label="Adult" sub="35+ yrs" value={counts.adult} onChange={(v) => setCount("adult", v)} />
        </div>

        {/* Payment */}
        <div>
          <p className={labelClass}>Payment</p>
          <div className="mb-6 space-y-1 text-sm text-[#6b7280]">
            <p>Transfer to <span className="text-[#1a1a1a] font-medium">Sarah Jasper</span></p>
            <p>BSB <span className="text-[#1a1a1a] font-medium">733-100</span> · Account <span className="text-[#1a1a1a] font-medium">759127</span></p>
            <p className="text-xs text-[#9ca3af] pt-2">Include your name and class name in the reference.</p>
          </div>
          <p className="text-xs text-[#9ca3af] mb-3">Payment status <span className="text-[#006644]">*</span></p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "completed", label: "Paid" },
              { value: "within-week", label: "Paying this week" },
              { value: "other", label: "Other" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentStatus(opt.value)}
                className={`px-4 py-2 text-sm border transition-all duration-200 rounded-full ${
                  paymentStatus === opt.value
                    ? "bg-[#006644] border-[#006644] text-white"
                    : "bg-transparent border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Hidden radio for form validation */}
          <input type="radio" name="payment-status" required value={paymentStatus} checked={!!paymentStatus} onChange={() => {}} className="sr-only" />
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Anything else?</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Dietary requirements, allergies, questions…"
            className="w-full bg-transparent border-0 border-b border-[#e4dfd5] pb-2 pt-1 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 -mt-6">{error}</p>
        )}

        <div>
          <button type="submit" disabled={submitting} className="btn-primary group">
            {submitting ? "Requesting…" : "Request my spot"}
            {!submitting && (
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          <p className="text-xs text-[#9ca3af] mt-4 leading-relaxed max-w-xs">
            We confirm classes once enough students sign up — you&apos;ll hear from us soon.
          </p>
        </div>

      </form>

      {/* ── Session summary sidebar ── */}
      <div className="lg:sticky lg:top-28">
        <div className="border-l-2 border-[#006644] pl-6 mb-8">
          <p className="text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-2">{session.classLabel}</p>
          <p className="text-[#1a1a1a] font-medium text-lg leading-snug" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
            {session.sessionName || session.classLabel}
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <svg className="w-3.5 h-3.5 mt-0.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-[#1a1a1a]">{session.date}</p>
              <p className="text-[#9ca3af] text-xs mt-0.5">{session.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-3.5 h-3.5 mt-0.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-[#6b7280]">{session.location}</p>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-3.5 h-3.5 mt-0.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-[#6b7280]">{session.ages}</p>
          </div>
        </div>

        <div className="border-t border-[#e8e2d9] mt-8 pt-6 flex items-baseline justify-between">
          <p className="text-2xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
            ${session.price}
          </p>
          <p className="text-xs text-[#9ca3af]">per person</p>
        </div>
        <p className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mt-2">
          {session.spotsLeft} {session.spotsLeft === 1 ? "spot" : "spots"} left
        </p>
      </div>

    </div>
  );
}
