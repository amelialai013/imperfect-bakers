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
    image: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Dietary Requirement Food",
    desc: "Gluten-free, vegan, nut-free and more. Delicious food that everyone can enjoy, no matter the dietary need.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&auto=format&fit=crop&q=85",
  },
  {
    title: "Kids Lead Parents",
    desc: "Flip the script! The kids are head chefs and parents are sous chefs. Prepare for chaos, laughter, and something delicious.",
    age: "Families",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&auto=format&fit=crop&q=85",
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

      {/* ── CLASSES LIST ─────────────────────────────────────── */}
      <section className="px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          {classes.map((c, i) => (
            <Link href="/book-a-class" key={c.title}>
              <div className="group border-t border-[#e4dfd5] py-10 grid grid-cols-12 gap-8 items-center hover:bg-white -mx-8 px-8 transition-colors cursor-pointer">

                {/* Number */}
                <span className="col-span-1 text-xs tracking-[0.2em] text-[#006644]/50 self-start pt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Title + desc */}
                <div className="col-span-7 md:col-span-6">
                  <h2
                    className="text-2xl md:text-3xl text-[#006644] leading-snug mb-3"
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                  >
                    {c.title}
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed max-w-md">{c.desc}</p>
                </div>

                {/* Age tag + book */}
                <div className="col-span-2 hidden md:flex flex-col gap-2 items-start">
                  <span className="text-xs tracking-[0.12em] uppercase text-[#006644]/50">{c.age}</span>
                </div>

                {/* Thumbnail */}
                <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-6">
                  <div
                    className="w-24 h-24 md:w-28 md:h-28 rounded-sm overflow-hidden shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundImage: `url('${c.image}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <svg className="w-4 h-4 text-[#006644] shrink-0 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

              </div>
            </Link>
          ))}
          {/* Bottom border */}
          <div className="border-t border-[#e4dfd5]" />
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
