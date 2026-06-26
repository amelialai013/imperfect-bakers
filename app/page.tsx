import Link from "next/link";
import Testimonials from "@/components/testimonials";

const features = [
  {
    number: "01",
    title: "Fun First",
    desc: "Every class is built around laughter, creativity, and enjoying the moment together.",
  },
  {
    number: "02",
    title: "No Judgement Zone",
    desc: "Burnt edges? Wonky shapes? We celebrate every attempt — that's where the magic is.",
  },
  {
    number: "03",
    title: "Build Confidence",
    desc: "Leave each class knowing you can make something amazing, entirely by yourself.",
  },
  {
    number: "04",
    title: "Real Skills",
    desc: "From knife techniques to flavour pairing — practical skills you'll use every single day.",
  },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative h-screen min-h-[640px] flex flex-col justify-end"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1800&auto=format&fit=crop&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />


        {/* Hero content */}
        <div className="relative z-10 px-8 pb-16 md:pb-24 max-w-5xl">
          {/* Gold rule */}
          <div className="w-12 h-px bg-[#006644] mb-8" />

          <h1
            className="text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-8 tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Messy hands,<br />
            <em className="not-italic text-white">delicious</em> food
          </h1>

          <p className="text-white/60 text-base md:text-lg max-w-md leading-relaxed mb-10">
            A joyful, hands-on cooking school where kids and adults build real kitchen confidence — one imperfect dish at a time.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/classes">
              <button className="btn-outline-white">
                Explore Classes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
            <Link href="/interest">
              <button className="btn-outline-white">Register Interest</button>
            </Link>
          </div>
        </div>

      </section>

      {/* ── WHY IMPERFECT BAKERS ──────────────────────────────── */}
      <section className="py-28 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">

          {/* Section header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div>
              <span className="section-label">Our Philosophy</span>
              <h2
                className="text-4xl md:text-5xl text-[#006644] leading-tight"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Why Imperfect Bakers?
              </h2>
            </div>
            <div className="flex items-end">
              <p className="text-[#6b7280] text-base leading-relaxed max-w-sm">
                We believe the kitchen should be a place of joy, not stress. Here&apos;s what makes us different from every other cooking school.
              </p>
            </div>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e4dfd5]">
            {features.map((f) => (
              <div key={f.title} className="bg-[#faf9f6] p-8 lg:p-10">
                <span className="text-xs tracking-[0.2em] text-[#006644] mb-6 block">{f.number}</span>
                <h3
                  className="text-xl text-[#006644] mb-4 leading-snug"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  {f.title}
                </h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{f.desc}</p>
                <div className="w-6 h-px bg-[#006644] mt-8" />
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ── CTA BAND ──────────────────────────────────────────── */}
      <section className="py-16 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#006644] rounded-2xl px-12 py-16 flex flex-col items-center text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/5" />
            <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5" />

            <h2
              className="text-4xl md:text-5xl text-white leading-tight mb-8 relative z-10"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Ready to get messy?
            </h2>
            <Link href="/interest" className="relative z-10">
              <button className="bg-white text-[#006644] font-semibold px-8 py-3 rounded-full flex items-center gap-2 hover:bg-white/90 transition-colors">
                Register Interest
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <Testimonials />
    </>
  );
}
