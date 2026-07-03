import Link from "next/link";
import { getAllSessions } from "@/lib/data";
import type { ClassSession } from "@/lib/types";
import BookAClassClient from "./BookAClassClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book a Class | Imperfect Bakers",
};

export default async function BookAClassPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const { class: initialClass } = await searchParams;
  let sessions: ClassSession[] = [];
  try {
    sessions = await getAllSessions();
  } catch {
    // KV not yet configured — show empty state
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
            Class <em className="not-italic text-[#1a1a1a]">bookings</em>
          </h1>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs md:text-right pb-1 text-balance">
            Browse upcoming sessions and secure your spot in the kitchen.
          </p>
        </div>
      </section>

      {/* ── CLASS BROWSER ────────────────────────────────────── */}
      <section className="pt-10 pb-20 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-8">
          <BookAClassClient sessions={sessions} initialClass={initialClass} />

        </div>
      </section>

      {/* ── PRIVATE BOOKINGS CTA ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Text half */}
        <div className="bg-[#ede8df] flex flex-col justify-center px-12 py-10 md:py-12 gap-8">
          <div>
            <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">Private bookings</span>
            <h2
              className="text-3xl md:text-4xl text-[#1a1a1a] leading-snug"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Can&apos;t find what you&apos;re looking for?
            </h2>
          </div>
          <Link href="/interest" className="btn-primary group self-start">
            Request private class
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {/* Photo half */}
        <div
          className="bg-cover min-h-[200px] md:min-h-[256px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&auto=format&fit=crop&q=85')", backgroundPosition: "center 25%" }}
        />
      </div>
    </>
  );
}
