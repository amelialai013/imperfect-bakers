import Link from "next/link";
import { getAllSessions } from "@/lib/data";
import type { ClassSession } from "@/lib/types";
import BookAClassClient from "./BookAClassClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Class | Imperfect Bakers",
};

export default async function BookAClassPage() {
  let sessions: ClassSession[] = [];
  try {
    sessions = await getAllSessions();
  } catch {
    // KV not yet configured — show empty state
  }

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#006644] px-8 pt-16 pb-14">
        <div className="max-w-7xl mx-auto">
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Reserve your spot</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12" style={{ alignItems: "last baseline" }}>
            <h1
              className="text-4xl md:text-5xl text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              <em className="not-italic text-white/50">Class</em> bookings
            </h1>
            <div className="md:ml-auto">
              <p className="text-white/50 text-base leading-relaxed max-w-sm">
                Browse upcoming sessions and secure your spot in the kitchen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLASS BROWSER ────────────────────────────────────── */}
      <section className="pt-10 pb-20 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <BookAClassClient sessions={sessions} />

        </div>
      </section>

      {/* ── PRIVATE BOOKINGS CTA ─────────────────────────────── */}
      <section className="px-8 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <div className="border border-[#e4dfd5] rounded-[12px] bg-white px-10 py-10 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-0 justify-between">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-full bg-[#006644]/8 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4.5 h-4.5 text-[#006644]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-1">Private bookings</p>
                <p className="text-[#1a1a1a] font-medium text-base" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                  Looking for something more personal?
                </p>
                <p className="text-[#6b7280] text-sm mt-1 leading-relaxed max-w-sm">
                  Custom classes at your place or ours — birthdays, team events, or a private night in.
                </p>
              </div>
            </div>
            <Link href="/interest" className="shrink-0 sm:ml-10">
              <button className="group inline-flex items-center gap-2.5 border border-[#006644] text-[#006644] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#006644] hover:text-white transition-colors whitespace-nowrap">
                Request a class
                <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
