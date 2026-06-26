const testimonials = [
  {
    quote: "My daughter came home beaming and immediately wanted to cook dinner. She's never been so excited about food before. Absolutely incredible experience.",
    name: "Sarah M.",
    role: "Parent",
  },
  {
    quote: "I always thought I was terrible at cooking. After just two classes, I made a three-course meal for my family. The confidence boost is real.",
    name: "James R.",
    role: "Adult Student",
  },
  {
    quote: "The kids lead parents class was a total game-changer. My son taught me how to make pasta from scratch. I'll never forget his little face.",
    name: "Laura K.",
    role: "Parent",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#1a3228] py-24 px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="block text-xs tracking-[0.2em] uppercase text-[#c9a96e] mb-4">
              Testimonials
            </span>
            <h2
              className="text-4xl md:text-5xl text-white leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              What Our Bakers Say
            </h2>
          </div>
          <p className="text-white/40 text-sm max-w-xs md:text-right leading-relaxed">
            Real stories from real kitchens.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
          {testimonials.map((t, i) => (
            <div key={t.name} className="bg-[#1a3228] p-10 relative">
              {/* Large quote mark */}
              <span
                className="absolute top-6 right-8 text-7xl text-white/5 leading-none select-none pointer-events-none"
                style={{ fontFamily: "Georgia, serif" }}
                aria-hidden
              >
                &ldquo;
              </span>

              {/* Number */}
              <span className="text-xs tracking-[0.2em] text-[#c9a96e]/60 mb-6 block">
                0{i + 1}
              </span>

              <p className="text-white/70 text-sm leading-relaxed mb-8 relative z-10">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-6 h-px bg-[#c9a96e]" />
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-white/40 text-xs tracking-wide">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
