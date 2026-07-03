"use client";

import { useEffect, useRef, useState } from "react";

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

export default function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible so cards always render — the observer adds the staggered
  // fade-in animation as a progressive enhancement on browsers that support it.
  const [visible, setVisible] = useState(true);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Temporarily hide so the entrance animation can play
    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    // Hard fallback: show after 600ms regardless
    const fallback = setTimeout(() => { setVisible(true); observer.disconnect(); }, 600);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#e4dfd5]">
      {features.map((f, i) => (
        <div
          key={f.title}
          className="bg-[#faf9f6] p-8 lg:p-10 transition-all duration-700 ease-out"
          style={{
            transitionDelay: animated ? `${i * 100}ms` : "0ms",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
          }}
        >
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
  );
}
