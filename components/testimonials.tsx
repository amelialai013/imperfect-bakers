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
    <section className="bg-[#faf9f6] py-24 px-8 border-t border-[#e4dfd5]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="block text-xs tracking-[0.2em] uppercase text-[#8bbfb0] mb-4">
              Testimonials
            </span>
            <h2
              className="text-4xl md:text-5xl text-[#006644] leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              What Our Bakers Say
            </h2>
          </div>
          <p className="text-[#6b7280] text-sm max-w-xs md:text-right leading-relaxed">
            Real stories from real kitchens.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className="bg-white border border-[#e4dfd5] rounded-sm p-8 flex flex-col justify-between gap-8">

              {/* Quote mark + text */}
              <div>
                <span className="text-4xl text-[#8bbfb0] leading-none block mb-4" aria-hidden>&ldquo;</span>
                <p className="text-[#1a1a1a] text-base leading-relaxed">
                  {t.quote}
                </p>
              </div>

              {/* Attribution */}
              <div className="flex items-center gap-3 pt-6 border-t border-[#e4dfd5]">
                <div className="w-8 h-8 rounded-full bg-[#006644]/10 flex items-center justify-center text-[#006644] text-xs font-bold shrink-0">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[#006644] text-sm font-semibold">{t.name}</p>
                  <p className="text-[#6b7280] text-xs tracking-wide">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
