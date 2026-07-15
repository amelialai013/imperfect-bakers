import Link from "next/link";
import { getClassConfigs } from "@/lib/data";
import { DEFAULT_CLASS_CONFIGS } from "@/lib/classDefaults";
import type { ClassConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Classes | Imperfect Bakers",
};

const LONG_TITLE_KEYS = ["Dietary Requirement Food"];

export default async function ClassesPage() {
  // Fetch class configs from admin (falls back to defaults)
  let classes: ClassConfig[] = DEFAULT_CLASS_CONFIGS;
  try {
    classes = (await getClassConfigs()).filter((c) => !c.hidden);
  } catch {
    // KV not configured — use defaults
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
            What we <em className="not-italic text-[#006644]">offer</em>
          </h1>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs md:text-right pb-1 text-balance">
            From beginners to budding foodies, there&apos;s a class for everyone.
          </p>
        </div>
      </section>

      {/* ── CLASSES GRID ─────────────────────────────────────── */}
      <section className="py-12 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <Link href={`/book-class?class=${encodeURIComponent(c.key)}`} key={c.key}>
              <div className="group relative overflow-hidden cursor-pointer h-[292px] rounded-[8px]">
                {/* Background image — no transform animation: scale() creates a
                    GPU compositing layer in Safari that can persist and block clicks */}
                <div
                  className="absolute inset-0 bg-cover"
                  style={{ backgroundImage: `url('${c.imageUrl}')`, backgroundPosition: "center" }}
                />
                {/* Overlay — transition-colors only (no transform/opacity transitions) */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/85 to-[#1a1a1a]/65 md:from-[#1a1a1a]/80 md:via-[#1a1a1a]/50 md:to-[#1a1a1a]/20 group-hover:from-[#1a1a1a] group-hover:via-[#1a1a1a]/85 group-hover:to-[#1a1a1a]/65 transition-colors duration-500" />

                {/* Content — top aligned */}
                <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
                  <div>
                    <span className="text-[0.6875rem] tracking-[0.2em] font-semibold text-white/50 mb-3 block uppercase">
                      {c.ages}
                    </span>
                    <h2
                      className="text-white leading-tight text-2xl md:text-3xl"
                      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                    >
                      {c.title}
                    </h2>
                    <p className={`text-white/70 text-sm leading-relaxed mt-4 max-w-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 ${LONG_TITLE_KEYS.includes(c.key) ? "line-clamp-2" : "line-clamp-3"} md:line-clamp-none`}>
                      {c.description}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* ── GOOGLE REVIEWS CTA ───────────────────────────────── */}
      {(() => {
        const GOOGLE_REVIEW_URL = "https://g.page/r/Cb4c_UFoAOGvEBM/review";
        return (
          <section className="pt-12 pb-24 bg-[#faf9f6]">
            <div className="max-w-3xl mx-auto px-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.5z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.8 14.8 48 24 48z"/>
                  <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.7-2.9-.7-4.8s.3-3.3.7-4.8v-6.2H2.7C1 16.4 0 20.1 0 24s1 7.6 2.7 11z"/>
                  <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.1 30.5 0 24 0 14.8 0 6.7 5.2 2.7 13l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
                </svg>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className="text-base text-[#FBBC05]">★</span>
                  ))}
                </div>
              </div>
              <h2
                className="text-3xl md:text-4xl text-[#006644] leading-tight mb-6"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Loved your class?
              </h2>
              <p className="text-[#6b7280] text-base leading-relaxed mb-10 max-w-sm mx-auto">
                Your review helps other families discover Imperfect Bakers — and means the world to us.
              </p>
              <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Write a review
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>
        );
      })()}

      {/* ── PRIVATE BOOKINGS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Photo half */}
        <div
          className="bg-cover bg-center min-h-[200px] md:min-h-[256px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=900&auto=format&fit=crop&q=85')" }}
        />
        {/* Text half */}
        <div className="bg-[#006644] flex flex-col justify-center pl-8 lg:pl-12 cta-edge-pad-r py-10 md:py-12 gap-8">
          <div>
            <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-4">Private bookings</span>
            <h2
              className="text-3xl md:text-4xl text-white leading-snug"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Looking for something{" "}
              <br className="hidden md:block" />
              more personal?
            </h2>
            <p className="text-white/70 text-sm leading-relaxed mt-4">
              We love doing private sessions — birthdays, team days, hens parties, and more. We&apos;re very happy to come to you, just tell us what you have in mind.
            </p>
          </div>
          <Link href="/interest" className="btn-tertiary group self-start">
            Request private class
            <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
