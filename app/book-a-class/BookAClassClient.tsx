"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClassSession } from "@/lib/types";

function groupByClass(sessions: ClassSession[]): Record<string, ClassSession[]> {
  return sessions.reduce<Record<string, ClassSession[]>>((acc, s) => {
    if (!acc[s.classLabel]) acc[s.classLabel] = [];
    acc[s.classLabel].push(s);
    return acc;
  }, {});
}

const CLASS_ORDER = [
  "Sweet Food",
  "Savoury Food",
  "Knife Skills",
  "Dietary Requirement Food",
  "Random Kitchen Fun",
  "Private Group Class",
];

const CLASS_SUBS: Record<string, string> = {
  "Sweet Food": "Cakes, cookies & pastries",
  "Savoury Food": "Pasta, pizza & hearty meals",
  "Knife Skills": "Ages 12+ · Precision techniques",
  "Dietary Requirement Food": "Inclusive & allergen-aware",
  "Random Kitchen Fun": "All ages · Surprise challenges",
  "Private Group Class": "Groups & special occasions",
};

export default function BookAClassClient({ sessions }: { sessions: ClassSession[] }) {
  const [activeClass, setActiveClass] = useState<string | null>(null);

  const grouped = groupByClass(sessions);

  // Only show class types that have at least one session
  const kvLabels = Object.keys(grouped);
  const allLabels = [
    ...CLASS_ORDER,
    ...kvLabels.filter((l) => !CLASS_ORDER.includes(l)),
  ].filter((label) => (grouped[label]?.length ?? 0) > 0);

  if (allLabels.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-[#6b7280] text-base">No sessions currently available.</p>
        <p className="text-[#6b7280] text-sm mt-2">Check back soon or register your interest below.</p>
      </div>
    );
  }

  return (
    <div>
      {allLabels.map((label, i) => {
        const classSessions = grouped[label] ?? [];
        const isOpen = activeClass === label;
        const sub = CLASS_SUBS[label] ?? "";
        const availableCount = classSessions.filter((s) => s.spotsLeft > 0).length;

        return (
          <div key={label}>
            {/* Divider */}
            <div className={`h-px bg-[#e4dfd5] ${i === 0 ? "" : "mt-0"}`} />

            <button
              onClick={() => setActiveClass(isOpen ? null : label)}
              className="w-full group text-left py-8 flex items-center justify-between gap-8 transition-colors"
            >
              {/* Left: label + sub */}
              <div className="flex items-baseline gap-5 min-w-0">
                <p
                  className={`text-xl font-medium leading-none tracking-tight transition-colors shrink-0 ${
                    isOpen ? "text-[#006644]" : "text-[#1a1a1a] group-hover:text-[#006644]"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  {label}
                </p>
                {sub && (
                  <p className="text-[#9ca3af] text-sm hidden sm:block truncate">{sub}</p>
                )}
              </div>

              {/* Right: session pill + chevron */}
              <div className="flex items-center gap-4 shrink-0">
                <span
                  className={`text-[0.6875rem] font-semibold tracking-[0.15em] uppercase transition-colors ${
                    availableCount > 0 ? "text-[#006644]" : "text-[#c8c0b4]"
                  }`}
                >
                  {classSessions.length} {classSessions.length === 1 ? "session" : "sessions"}
                </span>
                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    isOpen
                      ? "border-[#006644] bg-[#006644]"
                      : "border-[#e4dfd5] group-hover:border-[#006644]"
                  }`}
                >
                  <svg
                    className={`w-3 h-3 transition-all duration-300 ${
                      isOpen ? "text-white rotate-90" : "text-[#c8c0b4] group-hover:text-[#006644]"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded session cards */}
            {isOpen && (
              <div className="pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classSessions.map((s) => {
                    const isFull = s.spotsLeft === 0;
                    return (
                      <Link
                        key={s.id}
                        href={isFull ? "#" : `/book-a-class/${s.id}`}
                        aria-disabled={isFull}
                      >
                        <div
                          className={`border rounded-xl p-6 flex flex-col gap-4 transition-all duration-200 h-full ${
                            isFull
                              ? "bg-[#faf9f6] border-[#e4dfd5] opacity-50 cursor-not-allowed"
                              : "bg-white border-[#e4dfd5] hover:border-[#006644] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] cursor-pointer"
                          }`}
                        >
                          {/* Top */}
                          <div>
                            {s.sessionName && (
                              <p className="text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-2">
                                {s.sessionName}
                              </p>
                            )}
                            <p
                              className="text-[#1a1a1a] font-medium text-base leading-snug"
                              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                            >
                              {s.date}
                            </p>
                            <p className="text-[#6b7280] text-sm mt-0.5">{s.time}</p>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-[#f0ece4]" />

                          {/* Bottom */}
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-[#1a1a1a] font-semibold text-lg leading-none">
                                ${s.price}
                                <span className="text-[#9ca3af] text-xs font-normal ml-1">/ person</span>
                              </p>
                              <p className={`text-[0.6875rem] tracking-[0.08em] uppercase mt-1.5 ${isFull ? "text-red-400" : "text-[#006644]"}`}>
                                {isFull ? "Fully booked" : `${s.spotsLeft} spot${s.spotsLeft === 1 ? "" : "s"} left`}
                              </p>
                            </div>
                            {!isFull && (
                              <div className="w-8 h-8 rounded-full bg-[#006644] flex items-center justify-center">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div className="h-px bg-[#e4dfd5]" />
    </div>
  );
}
