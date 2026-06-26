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
      <section className="bg-[#006644] px-8 pt-20 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
          <div>
            <span className="section-label">What We Offer</span>
            <h1
              className="text-5xl md:text-6xl text-white leading-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              Our Classes
            </h1>
          </div>
          <div className="flex items-end">
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              From beginners to budding foodies, there&apos;s a class for everyone. Pick your adventure.
            </p>
          </div>
        </div>
      </section>

      {/* ── CLASSES GRID ─────────────────────────────────────── */}
      <section className="py-20 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e4dfd5]">
            {classes.map((c, i) => (
              <div key={c.title} className="bg-[#faf9f6] group hover:bg-white transition-colors flex flex-col">
                {/* Image */}
                <div
                  className="w-full h-56 overflow-hidden"
                  style={{
                    backgroundImage: `url('${c.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <span className="text-xs tracking-[0.2em] text-[#c9a96e] mb-3 block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2
                    className="text-2xl text-[#006644] mb-3 leading-snug"
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                  >
                    {c.title}
                  </h2>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-6 flex-1">{c.desc}</p>

                  <div className="flex items-center justify-between pt-5 border-t border-[#e4dfd5]">
                    <span className="text-xs tracking-[0.12em] uppercase text-[#006644]/60">
                      {c.age}
                    </span>
                    <Link href="/book-a-class">
                      <button className="text-xs tracking-[0.12em] uppercase text-[#006644] hover:text-[#c9a96e] transition-colors flex items-center gap-2">
                        Book
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <button className="btn-primary shrink-0">Request a Private Class</button>
          </Link>
        </div>
      </section>
    </>
  );
}
