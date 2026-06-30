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
    image: "https://images.unsplash.com/photo-1542010589005-d1eacc3918f2?w=900&auto=format&fit=crop&q=85",
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
      <section className="px-8 pt-16 pb-14 bg-[#faf9f6]">
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
                className={`group relative overflow-hidden cursor-pointer h-[280px] ${i === 0 ? "md:h-[400px]" : ""}`}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url('${c.image}')` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/50 to-black/30 md:from-black/70 md:via-black/30 md:to-black/10 group-hover:from-black/85 group-hover:via-black/50 group-hover:to-black/30 transition-all duration-500" />

                {/* Content — top aligned */}
                <div className="absolute inset-0 flex flex-col justify-start p-8 md:p-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[0.6875rem] tracking-[0.2em] font-semibold text-white/50 mb-3 block uppercase">
                        {c.age}
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

      {/* ── PRIVATE BOOKINGS ─────────────────────────────────── */}
      <section className="py-16 px-8 bg-[#006644]">
        <div className="max-w-7xl mx-auto">
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Private Bookings</span>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-16">
            <div>
              <h2
                className="text-2xl md:text-3xl text-white leading-snug mb-2"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Can&apos;t find the right class?
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                We create bespoke experiences for private groups, birthdays, and special occasions.
              </p>
            </div>
            <Link href="/interest" className="shrink-0">
              <button className="btn-tertiary">Request a private class</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS CTA ───────────────────────────────── */}
      {/* TODO: Replace GOOGLE_REVIEW_URL with your Google Business Profile review link */}
      {(() => {
        const GOOGLE_REVIEW_URL = "https://g.page/r/YOUR_PLACE_ID/review";
        return (
          <section className="py-24 px-8 bg-[#faf9f6]">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#4285F4" d="M47.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.5z"/>
                  <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.1 0-11.3-4.1-13.2-9.7H2.7v6.2C6.7 42.8 14.8 48 24 48z"/>
                  <path fill="#FBBC05" d="M10.8 28.8c-.5-1.4-.7-2.9-.7-4.8s.3-3.3.7-4.8v-6.2H2.7C1 16.4 0 20.1 0 24s1 7.6 2.7 11z"/>
                  <path fill="#EA4335" d="M24 9.5c3.4 0 6.5 1.2 8.9 3.5l6.7-6.7C35.9 2.1 30.5 0 24 0 14.8 0 6.7 5.2 2.7 13l8.1 6.2C12.7 13.6 17.9 9.5 24 9.5z"/>
                </svg>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className="text-base text-[#FBBC05]">★</span>
                  ))}
                </div>
                <span className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644]/50">Google Reviews</span>
              </div>
              <div className="w-12 h-px bg-[#006644]/20 mx-auto mb-10" />
              <h2
                className="text-4xl md:text-5xl text-[#006644] leading-tight mb-6"
                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
              >
                Loved your class?
              </h2>
              <p className="text-[#6b7280] text-base leading-relaxed mb-10 max-w-sm mx-auto">
                Your review helps other families discover Imperfect Bakers — and means the world to us.
              </p>
              <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer">
                <button className="btn-primary">
                  Write a review
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </a>
            </div>
          </section>
        );
      })()}
    </>
  );
}
