"use client";

import { useState } from "react";
import Link from "next/link";

export default function BookAClassPage() {
  const [activeFilter, setActiveFilter] = useState("Browse by Class Type");
  const [activeClass, setActiveClass] = useState<string | null>(null);

  const filters = ["Browse by Class Type", "Browse by Date", "Browse by Age", "Class at My Home"];

  const classTypes = [
    { label: "Sweet Food 🧁", sessions: "1 session" },
    { label: "Savoury Food 🍝", sessions: "2 sessions" },
    { label: "Knife Skills 🔪", sessions: null },
    { label: "Dietary Requirement Food 🌿", sessions: null },
    { label: "Kids Lead Parents 👨‍👩‍👧‍👦", sessions: null },
    { label: "Random Kitchen Fun 🎲", sessions: null },
    { label: "Private Group Class 🎉", sessions: null },
  ];

  return (
    <>
      <section className="bg-[#f7f5f0] py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Book a Class</h1>
          <p className="text-gray-500 text-lg">Browse upcoming sessions and secure your spot.</p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-3 mb-10">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-colors ${
                  activeFilter === f
                    ? "bg-[#2d5a3d] text-white border-[#2d5a3d]"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#2d5a3d] hover:text-[#2d5a3d]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Class list */}
          <div className="space-y-3">
            {classTypes.map((c) => (
              <button
                key={c.label}
                onClick={() => setActiveClass(activeClass === c.label ? null : c.label)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border text-left transition-colors ${
                  activeClass === c.label
                    ? "bg-[#2d5a3d] text-white border-[#2d5a3d]"
                    : "bg-white border-gray-200 hover:border-[#2d5a3d] text-gray-800"
                }`}
              >
                <span className="font-medium">{c.label}</span>
                {c.sessions && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      activeClass === c.label
                        ? "bg-white/20 text-white"
                        : "bg-[#e8f0ea] text-[#2d5a3d]"
                    }`}
                  >
                    {c.sessions}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Custom class CTA */}
          <div className="mt-16 bg-[#f7f5f0] rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Don&apos;t see what you&apos;re looking for?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Request a private or custom class — at your place or ours.
            </p>
            <Link href="/interest">
              <button className="px-6 py-3 bg-[#2d5a3d] text-white rounded-full text-sm font-medium hover:bg-[#3a7050] transition-colors">
                Request a class
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
