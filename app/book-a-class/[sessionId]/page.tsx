"use client";

import { useState } from "react";
import Link from "next/link";
import { use } from "react";
import { getSessionById } from "../sessions-data";

type Counts = { child: number; youngAdult: number; adult: number };

function Counter({ label, sub, value, onChange }: { label: string; sub: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#e4dfd5] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1a1a1a]">{label}</p>
        <p className="text-xs text-[#6b7280] mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full border border-[#e4dfd5] flex items-center justify-center text-[#6b7280] hover:border-[#006644] hover:text-[#006644] transition-colors"
        >
          −
        </button>
        <span className="w-4 text-center text-sm font-medium text-[#1a1a1a]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-[#e4dfd5] flex items-center justify-center text-[#6b7280] hover:border-[#006644] hover:text-[#006644] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function SessionBookingPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const session = getSessionById(sessionId);

  const [counts, setCounts] = useState<Counts>({ child: 0, youngAdult: 0, adult: 0 });
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const totalPeople = counts.child + counts.youngAdult + counts.adult;

  function setCount(key: keyof Counts, value: number) {
    setCounts((prev) => ({ ...prev, [key]: value }));
  }

  if (!session) {
    return (
      <section className="px-8 pt-20 pb-32 bg-[#faf9f6]">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl text-[#1a1a1a] mb-4" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>Session not found</h1>
          <p className="text-[#6b7280] mb-8">This session doesn&apos;t exist or may have been removed.</p>
          <Link href="/book-a-class"><button className="btn-primary">View all classes</button></Link>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <>
        <section className="bg-[#006644] px-8 pt-16 pb-14">
          <div className="max-w-7xl mx-auto">
            <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Spot requested</span>
            <h1 className="text-4xl md:text-5xl text-white leading-tight tracking-tight mt-3" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              You&apos;re on the list!
            </h1>
          </div>
        </section>
        <section className="px-8 pt-14 pb-32 bg-[#faf9f6]">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-[#e4dfd5] rounded-[8px] p-8 mb-8">
              <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-2">{session.classLabel}</p>
              <p className="text-[#1a1a1a] font-medium text-base">{session.date} · {session.time}</p>
              <p className="text-[#6b7280] text-sm mt-1">{session.location}</p>
            </div>
            <p className="text-[#6b7280] text-base leading-relaxed mb-8">
              A confirmation email will be sent once the class is confirmed — we run classes once we have enough students signed up. We&apos;ll be in touch soon!
            </p>
            <Link href="/book-a-class"><button className="btn-secondary">Browse more classes</button></Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#006644] px-8 pt-16 pb-14">
        <div className="max-w-7xl mx-auto">
          <Link href="/book-a-class" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
            All classes
          </Link>
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">{session.classLabel}</span>
          <h1
            className="text-4xl md:text-5xl text-white leading-tight tracking-tight mt-3"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            {session.sessionName ?? session.classLabel}
          </h1>
        </div>
      </section>

      {/* ── BOOKING FORM ─────────────────────────────────────── */}
      <section className="px-8 pt-10 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">

          {/* Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          >
            {/* Personal details */}
            <div className="mb-10">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-6">Your details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Full Name <span className="text-[#006644]">*</span></label>
                  <input required type="text" placeholder="Jane Smith" className="w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Email <span className="text-[#006644]">*</span></label>
                  <input required type="email" placeholder="jane@example.com" className="w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Phone <span className="text-[#6b7280] font-normal">(optional)</span></label>
                  <input type="tel" placeholder="04xx xxx xxx" className="w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="mb-10">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">Number of people</h2>
                <span className="text-xs text-[#6b7280]">{totalPeople} / {session.spotsLeft} max</span>
              </div>
              <div className="bg-white border border-[#e4dfd5] rounded-[8px] px-6">
                <Counter label="Child" sub="7–17 yrs" value={counts.child} onChange={(v) => setCount("child", v)} />
                <Counter label="Young Adult" sub="18–34 yrs" value={counts.youngAdult} onChange={(v) => setCount("youngAdult", v)} />
                <Counter label="Adult" sub="35+ yrs" value={counts.adult} onChange={(v) => setCount("adult", v)} />
              </div>
            </div>

            {/* Payment */}
            <div className="mb-10">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-6">Payment details</h2>
              <div className="bg-white border border-[#e4dfd5] rounded-[8px] p-6 mb-4 text-sm text-[#1a1a1a] space-y-1.5">
                <p>Pay to: <span className="font-medium">Sarah Jasper</span></p>
                <p>BSB: <span className="font-medium">733-100</span></p>
                <p>Account: <span className="font-medium">759127</span></p>
                <p className="text-[#6b7280] text-xs mt-3 pt-3 border-t border-[#e4dfd5]">
                  💡 Please include your name and class in the payment reference.
                </p>
              </div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">Payment status <span className="text-[#006644]">*</span></p>
              <div className="space-y-2">
                {[
                  { value: "completed", label: "✅  Payment completed" },
                  { value: "within-week", label: "📅  I will pay within the week" },
                  { value: "other", label: "💬  Other" },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 bg-white border border-[#e4dfd5] rounded-[6px] px-4 py-3 cursor-pointer hover:border-[#006644] transition-colors">
                    <input
                      required
                      type="radio"
                      name="payment-status"
                      value={opt.value}
                      checked={paymentStatus === opt.value}
                      onChange={() => setPaymentStatus(opt.value)}
                      className="accent-[#006644]"
                    />
                    <span className="text-sm text-[#1a1a1a]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-10">
              <label className="block text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a] mb-3">Anything else you&apos;d like us to know?</label>
              <textarea rows={4} placeholder="Dietary requirements, allergies, questions..." className="w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors resize-none" />
            </div>

            <button type="submit" className="btn-primary w-full sm:w-auto justify-center">
              Request My Spot
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <p className="text-xs text-[#6b7280] mt-4 leading-relaxed max-w-sm">
              A confirmation email will be sent once the class is confirmed — we run classes once we have enough students signed up.
            </p>
          </form>

          {/* Session summary sidebar */}
          <div className="lg:sticky lg:top-28">
            <div className="bg-white border border-[#e4dfd5] rounded-[8px] p-8">
              <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">{session.classLabel}</p>
              <p className="text-[#1a1a1a] font-semibold text-xl mb-5 leading-snug" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                {session.sessionName ?? session.classLabel}
              </p>
              <div className="space-y-3 text-sm border-t border-[#e4dfd5] pt-5">
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#1a1a1a]">{session.date}</p>
                    <p className="text-[#6b7280]">{session.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-[#6b7280]">{session.location}</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-[#6b7280]">{session.ages}</p>
                </div>
              </div>
              <div className="border-t border-[#e4dfd5] mt-5 pt-5 flex items-baseline justify-between">
                <p className="text-2xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                  ${session.price}
                </p>
                <p className="text-xs text-[#6b7280]">per person</p>
              </div>
              <p className="text-[0.6875rem] tracking-[0.1em] uppercase text-[#006644] mt-2">
                {session.spotsLeft} {session.spotsLeft === 1 ? "spot" : "spots"} left
              </p>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
