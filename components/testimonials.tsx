const testimonials = [
  {
    quote: "My daughter came home beaming and immediately wanted to cook dinner. She's never been so excited about food before. Absolutely incredible experience.",
    name: "Sarah M.",
    role: "Sweet Food",
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

  return (
    <section className="bg-[#006644] py-24 px-8">
      <div className="max-w-7xl mx-auto pl-8 lg:pl-10">

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
              <div className="w-8 h-px bg-white/30" />
              <p className="text-white/70 text-sm tracking-wide font-medium">
                {featured.name} · {featured.role}
              </p>
            </div>
          </div>

          {/* Stacked secondary quotes */}
          <div className="flex flex-col divide-y divide-white/10">
            {rest.map((t) => (
              <div key={t.name} className="py-8 first:pt-0 last:pb-0">
                <p className="text-white/70 text-base leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-white/30" />
                  <p className="text-white/50 text-xs tracking-wide">
                    {t.name} · {t.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
