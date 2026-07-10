import Link from "next/link";
import Testimonials from "@/components/testimonials";
import FeatureCards from "@/components/FeatureCards";


export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      {/* iOS Safari: 100vh includes browser chrome so we use min-h-screen with svh override in CSS */}
      <section className="relative hero-height min-h-0 sm:min-h-[560px] flex flex-col justify-end pb-12 md:pb-28 overflow-hidden">
        {/* Background image — animates independently so text stays still */}
        <div
          className="absolute inset-0 hero-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1800&auto=format&fit=crop&q=85')",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 hero-overlay bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/90 to-[#faf9f6]/50" />

        {/* Hero content */}
        <div className="relative z-10 w-full px-8 max-w-7xl mx-auto">
          <h1
            className="hero-title text-5xl md:text-7xl lg:text-8xl text-[#1a1a1a] leading-[1.05] mb-8 tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Messy hands,<br />
            <em className="not-italic text-[#006644]">delicious</em> food
          </h1>

          <p className="hero-sub text-[#6b7280] text-base md:text-lg max-w-lg leading-relaxed mb-10">
            A joyful, hands-on cooking school where you build real kitchen confidence — one imperfect dish at a time.
          </p>

          <div className="hero-cta flex flex-wrap gap-4">
            <Link href="/classes" className="btn-primary group">
              Explore classes
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/interest" className="btn-secondary">Register interest</Link>
          </div>
        </div>

      </section>

      {/* ── WHY IMPERFECT BAKERS ──────────────────────────────── */}
      <section className="pt-16 pb-28 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-8">

          {/* Section header */}
          <span className="section-label block">Our philosophy</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12 mb-12" style={{ alignItems: "last baseline" }}>
            <h2
              className="text-4xl md:text-5xl text-[#006644] leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Why <span className="text-[#1a1a1a]">Imperfect</span> Bakers?
            </h2>
            <p className="text-[#6b7280] text-base leading-relaxed max-w-sm md:ml-auto">
              We believe the kitchen should be a place of joy, not stress. Here&apos;s what makes us different from every other cooking school.
            </p>
          </div>

          {/* Feature grid */}
          <FeatureCards />

        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <Testimonials />
    </>
  );
}
