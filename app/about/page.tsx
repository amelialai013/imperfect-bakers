import Link from "next/link";
import Testimonials from "@/components/testimonials";

export const metadata = {
  title: "About | Imperfect Bakers",
};

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-[#f7f5f0] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            About Imperfect Bakers
          </h1>
          <p className="text-gray-500 text-lg">
            Getting messy, learning heaps, and having a great time along the way.
          </p>
        </div>
      </section>

      {/* Team photo */}
      <section className="px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="w-full h-72 md:h-96 rounded-2xl object-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#2d5a3d] font-semibold text-sm uppercase tracking-wider mb-3">
            Our Vision
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Building confidence in the kitchen, one imperfect dish at a time.
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            At Imperfect Bakers, we believe cooking should be fun, accessible, and a little bit chaotic. Our mission is to create a space where people of all ages feel welcome and empowered to try new things, make mistakes, and grow.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We celebrate the slightly overbaked biscuits and embrace the unexpected moments that happen along the way — because that&apos;s where the real learning (and laughter) lives.
          </p>
        </div>
      </section>

      {/* Meet the Chef */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-[#2d5a3d] font-semibold text-sm uppercase tracking-wider mb-3">
            Meet the Chef
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">Chef Sarah</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Sarah grew up in Williamstown, Melbourne. She has always loved the way food brings people together, and that passion is at the heart of everything she does at Imperfect Bakers.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                She holds a{" "}
                <strong>Bachelor of Education (Honours)</strong> and a{" "}
                <strong>Certificate III in Patisserie</strong> — the perfect combination for someone who loves teaching people how to make delicious food.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Outside the kitchen, Sarah enjoys an active and creative life. She is a keen tennis player, has achieved her black belt in karate, and loves to travel for food and inspiration.
              </p>
            </div>
            <div>
              <div
                className="w-full h-72 rounded-2xl"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=800&auto=format&fit=crop&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }}
              />
              <blockquote className="mt-6 bg-[#f7f5f0] rounded-xl p-5 text-gray-700 italic text-sm leading-relaxed">
                &ldquo;I love teaching, whether it&apos;s a group of school kids, a bunch of friends around a kitchen bench, or a family trying something new together. The kitchen is the best classroom.&rdquo;
                <footer className="mt-3 text-gray-500 not-italic font-medium">— Chef Sarah</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Review form */}
      <section className="py-16 px-6 bg-[#f7f5f0]">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#2d5a3d] font-semibold text-sm uppercase tracking-wider mb-2">
            Leave a Review
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Share Your Experience</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Jamie"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your experience..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] bg-white resize-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#2d5a3d] text-white rounded-full text-sm font-medium hover:bg-[#3a7050] transition-colors"
            >
              Submit Review
            </button>
          </form>

          <div className="mt-10">
            <h3 className="font-semibold text-gray-900 mb-2">What Others Say</h3>
            <p className="text-gray-400 text-sm">No reviews yet — be the first to leave one!</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to cook with us?</h2>
        <p className="text-gray-500 mb-8">
          Browse upcoming classes or register your interest — we&apos;d love to have you.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/classes">
            <button className="px-6 py-3 bg-[#2d5a3d] text-white rounded-full text-sm font-medium hover:bg-[#3a7050] transition-colors">
              See Our Classes
            </button>
          </Link>
          <Link href="/interest">
            <button className="px-6 py-3 bg-[#2d5a3d] text-white rounded-full text-sm font-medium hover:bg-[#3a7050] transition-colors">
              I&apos;m Interested!
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
