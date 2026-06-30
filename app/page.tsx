import Link from "next/link";
import Testimonials from "@/components/testimonials";

const features = [
  {
    number: "01",
    title: "Fun first",
    desc: "Every class is built around laughter, creativity, and enjoying the moment together.",
  },
  {
    number: "02",
    title: "No judgement zone",
    desc: "Burnt edges? Wonky shapes? We celebrate every attempt — that's where the magic is.",
  },
  {
    number: "03",
    title: "Build confidence",
    desc: "Leave each class knowing you can make something amazing, entirely by yourself.",
  },
  {
    number: "04",
    title: "Real skills",
    desc: "From knife techniques to flavour pairing — practical skills you'll use every single day.",
  },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative h-[60vh] min-h-[520px] flex flex-col justify-center md:justify-end"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1800&auto=format&fit=crop&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/90 to-[#faf9f6]/50" />


        {/* Hero content */}
        <div className="relative z-10 px-8 max-w-5xl pb-10">
          <h1
            className="text-4xl md:text-7xl lg:text-8xl text-[#1a1a1a] leading-[1.05] mb-8 tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Messy hands,<br />
            <em className="not-italic text-[#006644]">delicious</em> food
          </h1>

          <p className="text-[#6b7280] text-base md:text-lg max-w-lg leading-relaxed mb-10">
            A joyful, hands-on cooking school where you build real kitchen confidence — one imperfect dish at a time.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/classes">
              <button className="btn-primary group">
                Explore classes
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
            <Link href="/interest">
              <button className="btn-secondary">Register interest</button>
            </Link>
          </div>
        </div>

      </section>

      {/* ── WHY IMPERFECT BAKERS ──────────────────────────────── */}
      <section className="py-28 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <span className="section-label block">Our philosophy</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12 mb-12" style={{ alignItems: "last baseline" }}>
            <h2
              className="text-4xl md:text-5xl text-[#006644] leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Why <span className="text-[#1a1a1a]">Imperfect</span> Bakers?
            </h2>
            <p className="text-[#6b7280] text-base leading-relaxed max-w-sm">
              We believe the kitchen should be a place of joy, not stress. Here&apos;s what makes us different from every other cooking school.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e4dfd5]">
            {features.map((f) => (
              <div key={f.title} className="bg-[#faf9f6] p-8 lg:p-10">
                <span className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-6 block">{f.number}</span>
                <h3
                  className="text-xl text-[#006644] mb-4 leading-snug"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <Testimonials />
    </>
  );
}
