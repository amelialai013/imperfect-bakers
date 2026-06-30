import Link from "next/link";
import Testimonials from "@/components/testimonials";

export const metadata = {
  title: "About | Imperfect Bakers",
};

export default function AboutPage() {
  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="px-8 pt-16 pb-14 bg-[#faf9f6] border-b border-[#e4dfd5]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div>
            <span className="section-label">Our Story</span>
            <h1
              className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight mt-3"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              About <em className="not-italic text-[#006644]">Imperfect</em> Bakers
            </h1>
          </div>
          <div className="flex items-end">
            <p className="text-[#6b7280] text-base leading-relaxed max-w-sm">
              Getting messy, learning heaps, and having a great time along the way.
            </p>
          </div>
        </div>
      </section>

      {/* ── HERO IMAGE ───────────────────────────────────────── */}
      <section
        className="w-full h-[55vh] min-h-[360px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&auto=format&fit=crop&q=85')",
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
                <footer className="text-xs tracking-[0.15em] uppercase text-[#006644]">— Chef Sarah</footer>
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

      {/* ── TESTIMONIALS ──────────────────────────────────────── */}
      <Testimonials />

      {/* ── REVIEW FORM ──────────────────────────────────────── */}
      {/* ── GOOGLE REVIEWS CTA ───────────────────────────────── */}
      {/* TODO: Replace GOOGLE_REVIEW_URL with your Google Business Profile review link */}
      {(() => {
        const GOOGLE_REVIEW_URL = "https://g.page/r/YOUR_PLACE_ID/review";
        return (
          <section className="py-24 px-8 bg-[#faf9f6]">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white border border-[#e4dfd5] rounded-2xl px-12 py-16 flex flex-col md:flex-row items-center gap-10">
                {/* Google icon + stars */}
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-14 h-14">
                    <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.5z"/>
                    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.8 14.8 48 24 48z"/>
                    <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.7-2.9-.7-4.8s.3-3.3.7-4.8v-6.2H2.7C1 16.4 0 20.1 0 24s1 7.6 2.7 11z"/>
                    <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.1 30.5 0 24 0 14.8 0 6.7 5.2 2.7 13l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
                  </svg>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="text-2xl text-[#FBBC05]">★</span>
                    ))}
                  </div>
                  <p className="text-xs text-[#6b7280] tracking-wide">Google Reviews</p>
                </div>

                {/* Text */}
                <div className="flex-1 text-center md:text-left">
                  <span className="section-label">Leave a Review</span>
                  <h2
                    className="text-3xl md:text-4xl text-[#006644] leading-tight mt-2 mb-4"
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                  >
                    Share Your Experience
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed max-w-md">
                    Loved your class? Your review helps other families discover Imperfect Bakers and means the world to us.
                  </p>
                </div>

                {/* CTA */}
                <div className="shrink-0">
                  <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
                    <button className="btn-primary">
                      Write a Review
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#f0ede6]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <span className="section-label">Join Us</span>
            <h2
              className="text-3xl md:text-4xl text-[#006644] leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Ready to cook with us?
            </h2>
            <p className="text-[#6b7280] text-sm mt-3 max-w-sm">
              Browse upcoming classes or register your interest — we&apos;d love to have you.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
            <Link href="/classes">
              <button className="btn-primary">See Our Classes</button>
            </Link>
            <Link href="/interest">
              <button className="btn-secondary">I&apos;m Interested</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
