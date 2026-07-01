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
      <section className="bg-[#faf9f6] px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-[#e4dfd5] pt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-2">Private bookings</p>
              <p className="text-[#1a1a1a] text-base" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Want something more personal?
              </p>
              <p className="text-[#6b7280] text-sm mt-1">Custom classes at your place or ours.</p>
            </div>
            <Link href="/interest" className="shrink-0">
              <button className="btn-secondary group">
                Request a class
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
