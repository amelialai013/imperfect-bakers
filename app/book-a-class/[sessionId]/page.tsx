import { getSession } from "@/lib/data";
import BookingForm from "./BookingForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SessionBookingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  let session = null;
  try {
    session = await getSession(sessionId);
  } catch {
    // KV not configured
  }

  if (!session) {
    return (
      <>
        <section className="bg-[#006644] px-8 py-7">
          <div className="max-w-7xl mx-auto">
            <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-2">Reserve your spot</span>
            <h1 className="text-3xl md:text-4xl text-white leading-tight tracking-tight mt-3" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Session not found
            </h1>
          </div>
        </section>
        <section className="px-8 pt-14 pb-32 bg-[#faf9f6]">
          <div className="max-w-2xl mx-auto">
            <p className="text-[#6b7280] mb-8">This session doesn&apos;t exist or may have been removed.</p>
            <Link href="/book-a-class"><button className="btn-primary">View all classes</button></Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#006644] px-8 py-7">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/book-a-class"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
          >
            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
            All classes
          </Link>
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-2">
            {session.classLabel}
          </span>
          <h1
            className="text-3xl md:text-4xl text-white leading-tight tracking-tight mt-3"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            {session.sessionName || session.classLabel}
          </h1>
        </div>
      </section>

      {/* ── BOOKING FORM ─────────────────────────────────────── */}
      <section className="px-8 pt-10 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <BookingForm session={session} />
        </div>
      </section>
    </>
  );
}
