const testimonials = [
  {
    quote: "My daughter came home beaming and immediately wanted to cook dinner. She's never been so excited about food before. Absolutely incredible experience.",
    name: "Sarah M.",
    role: "Parent",
  },
  {
    quote: "I always thought I was terrible at cooking. After just two classes, I made a three-course meal for my family. The confidence boost is real!",
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
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">What Our Bakers Say</h2>
        <p className="text-gray-500 mb-12">Real stories from real kitchens.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[#f7f5f0] rounded-2xl p-7">
              <p className="text-gray-700 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                <p className="text-gray-400 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
