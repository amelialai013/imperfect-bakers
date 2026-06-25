import Link from "next/link";

export const metadata = {
  title: "Classes | Imperfect Bakers",
};

const classes = [
  {
    title: "Sweet Food",
    desc: "Dive into the wonderful world of cakes, cookies, pastries and sweet treats. Learn to bake with confidence and creativity.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&auto=format&fit=crop&q=80",
    emoji: "🧁",
  },
  {
    title: "Savoury Food",
    desc: "Pasta, pizza, and more. Master the art of making meals that bring everyone to the table.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&auto=format&fit=crop&q=80",
    emoji: "🍝",
  },
  {
    title: "Knife Skills",
    desc: "Chop, dice, julienne: learn safe and impressive knife techniques that'll make you feel like a pro in the kitchen.",
    age: "Ages 12+",
    image: "https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=800&auto=format&fit=crop&q=80",
    emoji: "🔪",
  },
  {
    title: "Dietary Requirement Food",
    desc: "Gluten-free, vegan, nut-free and more. Delicious food that everyone can enjoy, no matter the dietary need.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
    emoji: "🌿",
  },
  {
    title: "Kids Lead Parents",
    desc: "Flip the script! In this class, the kids are the head chefs and parents are the sous chefs. Prepare for chaos, laughter, and something delicious.",
    age: "Families",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    title: "Random Kitchen Fun",
    desc: "Mystery ingredients, wild challenges, and creative experiments. You never know what you'll make, but you'll always have fun.",
    age: "All ages",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80",
    emoji: "🎲",
  },
  {
    title: "Private Group Class",
    desc: "Celebrate in style! Whether it's a birthday party, hens do, or any special occasion — we'll create a custom class just for your group.",
    age: "Groups & celebrations",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80",
    emoji: "🎉",
  },
];

export default function ClassesPage() {
  return (
    <>
      <section className="bg-[#f7f5f0] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Our Classes</h1>
          <p className="text-gray-500 text-lg">
            From beginners to budding foodies, there&apos;s a class for everyone. Pick your adventure!
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            <div key={c.title} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div
                className="w-full h-48"
                style={{
                  backgroundImage: `url('${c.image}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{c.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{c.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#2d5a3d] bg-[#e8f0ea] px-3 py-1 rounded-full">
                    {c.age}
                  </span>
                  <Link href="/book-a-class">
                    <button className="px-4 py-2 bg-[#2d5a3d] text-white rounded-full text-xs font-medium hover:bg-[#3a7050] transition-colors">
                      Book a class
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
