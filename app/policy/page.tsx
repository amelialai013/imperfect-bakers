"use client";

import { useState, useEffect } from "react";

type PolicyItem = { highlight: string; text: string };
type PolicySection = { title: string; body?: string; items?: PolicyItem[] };

const DEFAULT_POLICY_SECTIONS: PolicySection[] = [
  { title: "Who can enrol?", body: "Due to insurance requirements, all participants must be over the age of 18." },
  { title: "Pricing", body: "Current pricing does not reflect future pricing. However, once booked and paid, your price is locked in — no changes will be made." },
  { title: "Confirmation of booking", body: "A confirmation email will be sent before your class begins. Please note — your booking is not confirmed until payment has been received." },
  { title: "Transfers, cancellations & refunds", items: [
    { highlight: "5+ business days before class", text: "Full refund or free transfer to another class — no questions asked." },
    { highlight: "Less than 5 business days", text: "Refunds are not guaranteed. Please get in touch and we'll do our best to help." },
  ]},
  { title: "If we cancel a class", body: "If a class doesn't reach minimum numbers, we may need to cancel it. We'll let you know at least 48 hours in advance and give you the choice of a full refund or a transfer to another session." },
  { title: "What to wear", body: "We recommend closed-toe, soft-soled, flat shoes — comfort over style in the kitchen." },
  { title: "Communications", body: "By booking a class, you agree to receive emails related to your booking. We won't spam you — just the important stuff." },
];

const ICONS = [
  <svg key={0} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  <svg key={1} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key={2} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  <svg key={3} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
  <svg key={4} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 18L18 6M6 6l12 12" /></svg>,
  <svg key={5} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  <svg key={6} className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
];

export default function PolicyPage() {
  const [sections, setSections] = useState<PolicySection[]>(DEFAULT_POLICY_SECTIONS);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.policySections?.length) setSections(data.policySections);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────── */}
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1
            className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Booking <em className="not-italic text-[#006644]">policy</em>
          </h1>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs md:text-right pb-1">
            Everything you need to know<br />before and after you book.
          </p>
        </div>
      </section>

      {/* ── POLICY SECTIONS ────────────────────────────────── */}
      <section className="bg-[#faf9f6] pt-12 pb-24">
        <div className="max-w-2xl mx-auto px-8 space-y-4">
          {sections.map((s, i) => (
            <div key={i} className="bg-white border border-[#e8e2d9] rounded-2xl px-7 py-6">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-[#006644]/8 flex items-center justify-center text-[#006644]">
                  {ICONS[i] ?? ICONS[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-base font-semibold text-[#1a1a1a] mb-2"
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                  >
                    {s.title}
                  </h2>
                  {s.body && (
                    <p className="text-sm text-[#6b7280] leading-relaxed">{s.body}</p>
                  )}
                  {s.items && (
                    <div className="space-y-3 mt-1">
                      {s.items.map((item, j) => (
                        <p key={j} className="text-sm text-[#6b7280] leading-relaxed">
                          <span className="font-medium text-[#1a1a1a]">{item.highlight} — </span>
                          {item.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER CTA ─────────────────────────────────────── */}
      <section className="bg-[#006644] py-16">
        <div className="max-w-2xl mx-auto px-8 text-center">
          <p className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase mb-4">Questions?</p>
          <h2
            className="text-2xl md:text-3xl text-white mb-4 leading-snug"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            We&apos;re always happy to chat.
          </h2>
          <p className="text-white/60 text-sm mb-8 leading-relaxed">
            If something isn&apos;t clear or your situation is a little different, just drop us a line.
          </p>
          <a
            href="mailto:imperfectbakers@gmail.com"
            className="btn btn-tertiary group"
          >
            Contact us
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </>
  );
}
