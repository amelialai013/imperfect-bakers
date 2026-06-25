"use client";

import { useState } from "react";

export default function InterestPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const classOptions = [
    { name: "Sweet Food", sub: "Cakes, cookies & treats" },
    { name: "Savoury Food", sub: "Meals & hearty cooking" },
    { name: "Knife Skills", sub: "Precision techniques" },
    { name: "Dietary Requirement Food", sub: "Inclusive & allergen-free" },
    { name: "Kids Lead Parents", sub: "Family role-reversal fun", emoji: "👨‍👩‍👧‍👦" },
    { name: "Random Kitchen Fun", sub: "Surprise challenges" },
    { name: "Private Group Class", sub: "Exclusive class for your group" },
  ];

  return (
    <>
      <section className="bg-[#f7f5f0] py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Register Your Interest
          </h1>
          <p className="text-gray-500 text-lg">
            Tell us what you&apos;d like to learn and we&apos;ll be in touch when spots open up.
          </p>
        </div>
      </section>

      <section className="py-12 px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Jamie Oliver"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="jamie@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                placeholder="07700 900000"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] bg-white text-gray-700">
                <option value="">Select your level</option>
                <option value="complete_beginner">Complete Beginner</option>
                <option value="some_experience">Some Experience</option>
                <option value="confident_cook">Confident Cook</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Which classes interest you? <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-gray-400 mb-3">Select as many as you like!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classOptions.map((c) => {
                  const isSelected = selected.includes(c.name);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggle(c.name)}
                      className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-colors ${
                        isSelected
                          ? "bg-[#2d5a3d] text-white border-[#2d5a3d]"
                          : "bg-white border-gray-200 hover:border-[#2d5a3d] text-gray-800"
                      }`}
                    >
                      <span className="font-medium text-sm">
                        {c.emoji && <span className="mr-1">{c.emoji}</span>}
                        {c.name}
                      </span>
                      <span className={`text-xs mt-0.5 ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                        {c.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anything else you&apos;d like us to know?
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about allergies, group sizes, birthday parties, or anything at all..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5a3d] bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#2d5a3d] text-white rounded-full text-sm font-medium hover:bg-[#3a7050] transition-colors"
            >
              Send My Interest
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
