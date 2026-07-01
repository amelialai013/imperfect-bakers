"use client";
import React, { useState } from "react";

const testimonials = [
  {
    quote: "My daughter came home beaming and immediately wanted to cook dinner. She's never been so excited about food before. Absolutely incredible experience.",
    name: "Sarah M.",
    role: "Knife Skills",
  },
  {
    quote: "I always thought I was terrible at cooking. After just two classes, I made a three-course meal for my family. The confidence boost is real.",
    name: "James R.",
    role: "Savoury Food",
  },
  {
    quote: "The random kitchen fun class was a total game-changer. My son taught me how to make pasta from scratch. I'll never forget his little face.",
    name: "Laura K.",
    role: "Random Kitchen Fun",
  },
];

export default function Testimonials() {
  const [featured, ...rest] = testimonials;
  const [active, setActive] = useState(0);
  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) setActive((a) => Math.min(a + 1, rest.length - 1));
      else setActive((a) => Math.max(a - 1, 0));
    }
    touchStartX.current = null;
  };

  return (
    <section className="bg-[#006644] py-24">
      <div className="max-w-7xl mx-auto px-8">

        {/* Label */}
        <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-12">
          Testimonials
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">

          {/* Featured quote — large */}
          <div className="flex flex-col justify-between">
            <p
              className="text-white text-2xl md:text-3xl leading-relaxed mb-7"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              &ldquo;{featured.quote}&rdquo;
            </p>
            <div className="flex items-center gap-4 mt-4">
              <p className="text-white/70 text-sm tracking-wide font-medium">
                {featured.name} · {featured.role}
              </p>
            </div>
          </div>

          {/* Secondary quotes — carousel on mobile, stacked on desktop */}
          <div>
            {/* Mobile carousel */}
            <div className="md:hidden relative overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${active * 100}%)` }}
              >
                {rest.map((t) => (
                  <div key={t.name} className="w-full shrink-0">
                    <p className="text-white/70 text-base leading-relaxed mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="text-white/50 text-xs tracking-wide">
                      {t.name} · {t.role}
                    </p>
                  </div>
                ))}
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-2 mt-8">
                {rest.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setActive(i)}
                    className={`transition-all duration-300 rounded-full ${
                      i === active
                        ? "w-6 h-1.5 bg-white"
                        : "w-1.5 h-1.5 bg-white/30"
                    }`}
                    aria-label={`Go to ${t.name}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop stacked */}
            <div className="hidden md:flex md:flex-col">
              {rest.map((t, i) => (
                <React.Fragment key={t.name}>
                  {i > 0 && (
                    <div className="w-full border-t border-white/10 my-8" />
                  )}
                  <div>
                    <p className="text-white/70 text-base leading-relaxed mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <p className="text-white/50 text-xs tracking-wide">
                      {t.name} · {t.role}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
