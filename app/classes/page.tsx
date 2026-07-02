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
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${c.imageUrl}')`, backgroundPosition: "center" }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/85 to-[#1a1a1a]/65 md:from-[#1a1a1a]/80 md:via-[#1a1a1a]/50 md:to-[#1a1a1a]/20 group-hover:from-[#1a1a1a] group-hover:via-[#1a1a1a]/85 group-hover:to-[#1a1a1a]/65 transition-all duration-500" />

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
      {/* Hidden until Google Business Profile review link is configured */}

      {/* ── PRIVATE BOOKINGS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Photo half */}
        <div
          className="bg-cover bg-center min-h-[200px] md:min-h-[256px]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=900&auto=format&fit=crop&q=85')" }}
        />
        {/* Text half */}
        <div className="bg-[#006644] flex flex-col justify-center px-12 py-10 md:py-12 gap-8">
          <div>
            <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-4">Private bookings</span>
            <h2
              className="text-3xl md:text-4xl text-white leading-snug"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Looking for something more personal?
            </h2>
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
