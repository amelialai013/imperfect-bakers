import Link from "next/link";
import Testimonials from "@/components/testimonials";

const features = [
  {
    icon: "😊",
    title: "Fun First",
    desc: "Every class is built around laughter, creativity, and enjoying the moment together.",
  },
  {
    icon: "🎯",
    title: "No Judgement Zone",
    desc: "Burnt edges? Wonky shapes? We celebrate every attempt — that's where the magic is.",
  },
  {
    icon: "💪",
    title: "Build Confidence",
    desc: "Leave each class knowing you can make something amazing, all by yourself.",
  },
  {
    icon: "🔪",
    title: "Real Skills",
    desc: "From knife techniques to flavour pairing — practical skills you'll use every day.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative h-[85vh] min-h-[500px] flex items-end"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&auto=format&fit=crop&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 px-8 pb-20 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
            Messy hands,<br />delicious food
          </h1>
          <div className="flex flex-wrap gap-4">
            <Link href="/classes">
              <button className="px-6 py-3 rounded-full border-2 border-white/70 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                Explore Classes
              </button>
            </Link>
            <Link href="/interest">
              <button className="px-6 py-3 rounded-full border-2 border-white/70 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                Register Interest
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Imperfect Bakers */}
      <section className="py-20 px-6 bg-[#f7f5f0]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Imperfect Bakers?</h2>
          <p className="text-gray-500 mb-12">
            We believe the kitchen should be a place of joy, not stress. Here&apos;s what makes us different.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-7 shadow-sm">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-[#e8ede9]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            Ready to get messy?
          </h2>
          <Link href="/interest">
            <button className="px-8 py-3 rounded-full border-2 border-gray-600 text-gray-700 font-medium hover:bg-white transition-colors">
              Register Interest →
            </button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />
    </>
  );
}
