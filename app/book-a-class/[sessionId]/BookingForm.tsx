"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClassSession } from "@/lib/types";

type Counts = { child: number; youngAdult: number; adult: number };

const inputClass =
  "w-full bg-[#f5f2ed] rounded-lg px-4 py-3.5 text-sm text-[#1a1a1a] placeholder-[#b8b0a6] focus:outline-none focus:bg-[#eeeae4] transition-colors";

function SectionNumber({ n }: { n: string }) {
  return (
    <span className="text-[0.6rem] font-semibold tracking-[0.25em] text-[#c8c0b4]">{n}</span>
  );
}

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
        <p className="text-xs text-[#9ca3af] mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 bg-[#f5f2ed] rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#006644] hover:text-white transition-all text-base"
        >
          −
        </button>
        <span className="w-6 text-center text-base font-semibold text-[#1a1a1a] tabular-nums">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 bg-[#f5f2ed] rounded-lg flex items-center justify-center text-[#6b7280] hover:bg-[#006644] hover:text-white transition-all text-base"
        >
          +
        </button>
      </div>
    </div>
  );
}

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
      <div className="max-w-xl">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-[#006644] mb-6">Booking received</p>
        <h2 className="text-3xl text-[#1a1a1a] mb-4 leading-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
          You&apos;re on the list.
        </h2>
        <p className="text-[#6b7280] text-sm leading-relaxed mb-10 max-w-sm">
          We confirm classes once we have enough students signed up. A confirmation email will be on its way shortly.
        </p>
        <Link href="/book-a-class"><button className="btn-secondary">Browse more classes</button></Link>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="max-w-xl">
        <p className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-[#9ca3af] mb-6">Session full</p>
        <h2 className="text-3xl text-[#1a1a1a] mb-4" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
          No spots left.
        </h2>
        <p className="text-[#6b7280] text-sm mb-10 leading-relaxed max-w-sm">
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16 lg:gap-20 items-start">

      {/* ── Form ── */}
      <form onSubmit={handleSubmit}>

        {/* 01 — Your details */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <SectionNumber n="01" />
            <div className="flex-1 h-px bg-[#e8e2d9]" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">Your details</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <input required name="name" type="text" placeholder="Full name *" className={inputClass} />
            </div>
            <input required name="email" type="email" placeholder="Email *" className={inputClass} />
            <input name="phone" type="tel" placeholder="Phone (optional)" className={inputClass} />
          </div>
        </div>

        {/* 02 — Number of people */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <SectionNumber n="02" />
            <div className="flex-1 h-px bg-[#e8e2d9]" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">
              Attendees
              <span className="ml-3 font-normal text-[#9ca3af] normal-case tracking-normal">
                {totalPeople > 0 ? `${totalPeople} of ${session.spotsLeft} spots` : `${session.spotsLeft} spots available`}
              </span>
            </p>
          </div>
          <div className="divide-y divide-[#f0ece4]">
            <Counter label="Child" sub="7–17 yrs" value={counts.child} onChange={(v) => setCount("child", v)} />
            <Counter label="Young Adult" sub="18–34 yrs" value={counts.youngAdult} onChange={(v) => setCount("youngAdult", v)} />
            <Counter label="Adult" sub="35+ yrs" value={counts.adult} onChange={(v) => setCount("adult", v)} />
          </div>
        </div>

        {/* 03 — Payment */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <SectionNumber n="03" />
            <div className="flex-1 h-px bg-[#e8e2d9]" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">Payment</p>
          </div>
          <div className="bg-[#f5f2ed] rounded-lg px-5 py-4 mb-5 text-sm">
            <p className="text-[#1a1a1a] mb-1">
              Transfer to <span className="font-semibold">Sarah Jasper</span>
            </p>
            <p className="text-[#6b7280]">
              BSB <span className="font-medium text-[#1a1a1a]">733-100</span>
              <span className="mx-2 text-[#d4cfc8]">·</span>
              Account <span className="font-medium text-[#1a1a1a]">759127</span>
            </p>
            <p className="text-xs text-[#9ca3af] mt-3 pt-3 border-t border-[#e8e2d9]">
              Include your name and class name in the payment reference.
            </p>
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
                className={`px-4 py-2.5 text-sm rounded-lg transition-all duration-200 ${
                  paymentStatus === opt.value
                    ? "bg-[#006644] text-white"
                    : "bg-[#f5f2ed] text-[#1a1a1a] hover:bg-[#eeeae4]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input type="radio" name="payment-status" required value={paymentStatus} checked={!!paymentStatus} onChange={() => {}} className="sr-only" />
        </div>

        {/* 04 — Notes */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <SectionNumber n="04" />
            <div className="flex-1 h-px bg-[#e8e2d9]" />
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">Anything else?</p>
          </div>
          <textarea
            name="notes"
            rows={3}
            placeholder="Dietary requirements, allergies, questions…"
            className={inputClass + " resize-none"}
          />
        </div>

        {error && <p className="text-sm text-red-500 mb-6">{error}</p>}

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <button type="submit" disabled={submitting} className="btn-primary group self-start">
            {submitting ? "Requesting…" : "Request my spot"}
            {!submitting && (
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          <p className="text-xs text-[#9ca3af] leading-relaxed max-w-xs">
            We confirm classes once enough students sign up — you&apos;ll hear from us soon.
          </p>
        </div>

      </form>

      {/* ── Sidebar ── */}
      <div className="lg:sticky lg:top-28">
        <div className="bg-[#006644] rounded-2xl p-8 text-white">
          <p className="text-[0.6rem] font-semibold tracking-[0.25em] uppercase text-white/40 mb-3">{session.classLabel}</p>
          <p className="text-xl font-medium leading-snug mb-8" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
            {session.sessionName || session.classLabel}
          </p>
          <div className="space-y-4 text-sm border-t border-white/10 pt-6">
            <div className="flex items-start gap-3">
              <svg className="w-3.5 h-3.5 mt-0.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-white/90">{session.date}</p>
                <p className="text-white/40 text-xs mt-0.5">{session.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-3.5 h-3.5 mt-0.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-white/60">{session.location}</p>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-3.5 h-3.5 mt-0.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-white/60">{session.ages}</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 flex items-baseline justify-between">
            <p className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              ${session.price}
            </p>
            <p className="text-xs text-white/40">per person</p>
          </div>
          <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-white/40 mt-2">
            {session.spotsLeft} {session.spotsLeft === 1 ? "spot" : "spots"} remaining
          </p>
        </div>
      </div>

    </div>
  );
}
