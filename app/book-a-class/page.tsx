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
          <div className="relative overflow-hidden rounded-[12px] bg-[#006644] px-10 md:px-14 py-12 flex flex-col md:flex-row md:items-center gap-8 md:gap-0 md:justify-between">
            {/* Subtle decorative ring */}
            <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-6 -top-6 w-40 h-40 rounded-full border border-white/10" />
            <div>
              <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-4">
                Private bookings
              </span>
              <p
                className="text-white text-2xl md:text-3xl leading-snug tracking-tight mb-2"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Something more personal<br className="hidden md:block" />
                <span className="text-white/50"> in mind?</span>
              </p>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm mt-3">
                Custom classes at your place or ours — birthdays, team events, or a private night in.
              </p>
            </div>
            <Link href="/interest" className="shrink-0 md:ml-16">
              <button className="group inline-flex items-center gap-3 bg-white text-[#006644] font-semibold text-sm px-6 py-3.5 rounded-full hover:bg-[#faf9f6] transition-colors whitespace-nowrap">
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
