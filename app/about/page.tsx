import Link from "next/link";

export const metadata = {
  title: "About | Imperfect Bakers",
};

export default function AboutPage() {
  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="px-8 pt-16 pb-14 bg-[#faf9f6] border-b border-[#e4dfd5]">
        <div className="max-w-7xl mx-auto">
          <span className="section-label">Our Story</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12" style={{ alignItems: "last baseline" }}>
            <h1
              className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Who <em className="not-italic text-[#006644]">we</em> are
            </h1>
            <p className="text-[#6b7280] text-base leading-relaxed max-w-sm ml-auto">
              Get messy, learn heaps, and have a great time along the way.
            </p>
          </div>
        </div>
      </section>

      {/* ── HERO IMAGE ───────────────────────────────────────── */}
      <section
        className="w-full h-[55vh] min-h-[360px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=1600&auto=format&fit=crop&q=85')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />

      {/* ── VISION ───────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
          <div className="md:col-span-4 pt-1">
            <span className="section-label">Our Vision</span>
          </div>
          <div className="md:col-span-8">
            <h2
              className="text-3xl md:text-4xl text-[#006644] mb-8 leading-snug"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Building confidence in the kitchen, one imperfect dish at a time.
            </h2>
            <div className="space-y-5 text-[#6b7280] text-base leading-relaxed">
              <p>
                At Imperfect Bakers, we believe cooking should be fun, accessible, and a little bit chaotic. Our mission is to create a space where people of all ages feel welcome and empowered to try new things, make mistakes, and grow.
              </p>
              <p>
                We celebrate the slightly overbaked biscuits and embrace the unexpected moments that happen along the way — because that&apos;s where the real learning (and laughter) lives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MEET THE CHEF ────────────────────────────────────── */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">

            {/* Text */}
            <div className="md:col-span-6 order-2 md:order-1">
              <span className="section-label">Meet the Chef</span>
              <h2
                className="text-4xl md:text-5xl text-[#006644] mb-8 leading-tight"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Chef Sarah
              </h2>

              <div className="space-y-5 text-[#6b7280] text-base leading-relaxed mb-10">
                <p>
                  Sarah grew up in Williamstown, Melbourne. She has always loved the way food brings people together, and that passion is at the heart of everything she does at Imperfect Bakers.
                </p>
                <p>
                  She holds a <strong className="text-[#006644] font-medium">Bachelor of Education (Honours)</strong> and a <strong className="text-[#006644] font-medium">Certificate III in Patisserie</strong> — the perfect combination for someone who loves teaching people how to make delicious food.
                </p>
                <p>
                  Outside the kitchen, Sarah is a keen tennis player, holds a black belt in karate, and loves to travel for food and inspiration.
                </p>
              </div>

              {/* Pull quote */}
              <blockquote className="border-l-2 border-[#006644] pl-6">
                <p
                  className="text-xl text-[#006644] leading-relaxed italic mb-4"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  &ldquo;The kitchen is the best classroom — and every messy moment is a lesson worth learning.&rdquo;
                </p>
                <footer className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644]">— Chef Sarah</footer>
              </blockquote>
            </div>

            {/* Image */}
            <div className="md:col-span-6 order-1 md:order-2">
              <div
                className="w-full aspect-[4/5] object-cover"
                style={{
                  backgroundImage:
                    "url('/sarah.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-32 px-8 bg-[#006644]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-8">Join Us</span>
          <h2
            className="text-5xl md:text-6xl text-white leading-tight mb-6"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Ready to get your<br />
            <span className="text-white/40">hands dirty?</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm mx-auto mb-12">
            Browse upcoming classes or register your interest — we&apos;d love to have you in the kitchen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/classes">
              <button className="btn-primary-inverse group">
                See our classes
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
            <Link href="/interest">
              <button className="btn-tertiary">I&apos;m interested</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
