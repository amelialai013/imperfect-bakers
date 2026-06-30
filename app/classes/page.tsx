import Link from "next/link";

export const metadata = {
  title: "Classes | Imperfect Bakers",
};

const classes = [
  {
    title: "Sweet Food",
    desc: "Dive into the wonderful world of cakes, cookies, pastries and sweet treats. Learn to bake with confidence and creativity.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Savoury Food",
    desc: "Pasta, pizza, and more. Master the art of making meals that bring everyone to the table.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Knife Skills",
    desc: "Chop, dice, julienne: learn safe and impressive knife techniques that'll make you feel like a professional.",
    age: "Ages 12+",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Dietary Requirement Food",
    desc: "Gluten-free, vegan, nut-free and more. Delicious food that everyone can enjoy, no matter the dietary need.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Random Kitchen Fun",
    desc: "Mystery ingredients, wild challenges, and creative experiments. You never know what you'll make, but you'll always have fun.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Private Group Class",
    desc: "Celebrate in style. Whether it's a birthday party, hens do, or any special occasion — we'll create a custom class just for your group.",
    age: "Groups & celebrations",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&auto=format&fit=crop&q=85",
  },
];

export default function ClassesPage() {
  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="px-8 pt-16 pb-14 bg-[#faf9f6] border-b border-[#e4dfd5]">
        <div className="max-w-7xl mx-auto">
          <span className="section-label">What we offer</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12" style={{ alignItems: "last baseline" }}>
            <h1
              className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Our <em className="not-italic text-[#006644]">classes</em>
            </h1>
            <p className="text-[#6b7280] text-base leading-relaxed max-w-sm">
              From beginners to budding foodies, there&apos;s a class for everyone. Pick your adventure.
            </p>
          </div>
        </div>
      </section>

      {/* ── CLASSES GRID ─────────────────────────────────────── */}
      <section className="py-12 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c, i) => (
            <Link href="/book-a-class" key={c.title} className={i === 0 ? "md:col-span-2" : ""}>
              <div
                className={`group relative overflow-hidden cursor-pointer h-[360px] ${i === 0 ? "md:h-[520px]" : ""}`}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${c.image}')` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/10 transition-all duration-300" />

                {/* Content — top aligned */}
                <div className="absolute inset-0 flex flex-col justify-start p-8 md:p-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[0.6875rem] tracking-[0.2em] font-semibold text-white/50 mb-3 block uppercase">
                        {String(i + 1).padStart(2, "0")} · {c.age}
                      </span>
                      <h2
                        className={`text-white leading-tight ${i === 0 ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}
                        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                      >
                        {c.title}
                      </h2>
                      <p className="text-white/70 text-sm leading-relaxed mt-4 max-w-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        {c.desc}
                      </p>
                    </div>
                    <div className="shrink-0 ml-6">
                      <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 px-8 bg-[#f0ede6]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <span className="section-label">Private Bookings</span>
            <h2
              className="text-3xl md:text-4xl text-[#006644] leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Can&apos;t find the right class?
            </h2>
            <p className="text-[#6b7280] text-sm mt-3">
              We create bespoke experiences for private groups, birthdays, and special occasions.
            </p>
          </div>
          <Link href="/interest">
            <button className="btn-primary shrink-0">Request a private class</button>
          </Link>
        </div>
      </section>
    </>
  );
}
