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
      <section className="bg-[#faf9f6] px-8 pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1
            className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Class <em className="not-italic text-[#006644]">bookings</em>
          </h1>
          <p className="text-[#9ca3af] text-sm leading-relaxed max-w-xs md:text-right pb-1 text-balance">
            Browse upcoming sessions and secure your spot in the kitchen.
          </p>
        </div>
      </section>

      {/* ── CLASS BROWSER ────────────────────────────────────── */}
      <section className="pt-10 pb-20 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <BookAClassClient sessions={sessions} />

        </div>
      </section>

      {/* ── PRIVATE BOOKINGS CTA ─────────────────────────────── */}
      <section className="bg-[#ede8df] px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[1fr_auto] gap-8 md:gap-16 items-center">
            <div>
              <span className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3 block">Private bookings</span>
              <h2
                className="text-2xl md:text-3xl text-[#1a1a1a] leading-snug tracking-tight mb-3"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-[#6b7280] text-sm leading-relaxed max-w-sm">
                Custom classes at your place or ours — birthdays, team events, or a private night in.
              </p>
            </div>
            <Link href="/interest" className="shrink-0">
              <button className="btn-primary group whitespace-nowrap">
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
