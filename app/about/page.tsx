import Link from "next/link";
import Testimonials from "@/components/testimonials";

export const metadata = {
  title: "About | Imperfect Bakers",
};

export default function AboutPage() {
  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#00704d] px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div>
            <span className="section-label">Our Story</span>
            <h1
              className="text-5xl md:text-6xl text-white leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              About Imperfect Bakers
            </h1>
          </div>
          <div className="flex items-end">
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
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
          <div className="md:col-span-4">
            <span className="section-label">Our Vision</span>
            <div className="w-8 h-px bg-[#e4dfd5] mt-2" />
          </div>
          <div className="md:col-span-8">
            <h2
              className="text-3xl md:text-4xl text-[#00704d] mb-8 leading-snug"
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
                className="text-4xl md:text-5xl text-[#00704d] mb-8 leading-tight"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Chef Sarah
              </h2>

              <div className="space-y-5 text-[#6b7280] text-base leading-relaxed mb-10">
                <p>
                  Sarah grew up in Williamstown, Melbourne. She has always loved the way food brings people together, and that passion is at the heart of everything she does at Imperfect Bakers.
                </p>
                <p>
                  She holds a <strong className="text-[#00704d] font-medium">Bachelor of Education (Honours)</strong> and a <strong className="text-[#00704d] font-medium">Certificate III in Patisserie</strong> — the perfect combination for someone who loves teaching people how to make delicious food.
                </p>
                <p>
                  Outside the kitchen, Sarah is a keen tennis player, holds a black belt in karate, and loves to travel for food and inspiration.
                </p>
              </div>

              {/* Pull quote */}
              <blockquote className="border-l-2 border-[#c9a96e] pl-6">
                <p
                  className="text-xl text-[#00704d] leading-relaxed italic mb-4"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  &ldquo;The kitchen is the best classroom — and every messy moment is a lesson worth learning.&rdquo;
                </p>
                <footer className="text-xs tracking-[0.15em] uppercase text-[#c9a96e]">— Chef Sarah</footer>
              </blockquote>
            </div>

            {/* Image */}
            <div className="md:col-span-6 order-1 md:order-2">
              <div
                className="w-full aspect-[4/5] object-cover"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=900&auto=format&fit=crop&q=85')",
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
      <section className="py-24 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-4">
            <span className="section-label">Leave a Review</span>
            <h2
              className="text-3xl md:text-4xl text-[#00704d] leading-tight mt-2"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Share Your Experience
            </h2>
            <div className="w-8 h-px bg-[#c9a96e] mt-6" />
            <p className="text-[#6b7280] text-sm leading-relaxed mt-6">
              Your feedback means the world to us and helps other families find their way to the kitchen.
            </p>
          </div>

          <div className="md:col-span-8">
            <form className="space-y-6">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">
                  Your Name <span className="text-[#c9a96e]">*</span>
                </label>
                <input type="text" placeholder="Jamie" className="input-elegant" />
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-3">
                  Rating <span className="text-[#c9a96e]">*</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      className="text-2xl text-[#e4dfd5] hover:text-[#c9a96e] transition-colors leading-none">
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-[#00704d] mb-2">
                  Your Review <span className="text-[#c9a96e]">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us about your experience..."
                  className="input-elegant resize-none"
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit Review
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-[#e4dfd5]">
              <p className="text-xs tracking-[0.15em] uppercase text-[#6b7280]">What Others Say</p>
              <p className="text-[#b0a898] text-sm mt-3">No reviews yet — be the first to leave one!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-8 bg-[#f0ede6]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <span className="section-label">Join Us</span>
            <h2
              className="text-3xl md:text-4xl text-[#00704d] leading-tight"
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
              <button className="btn-outline">I&apos;m Interested</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
