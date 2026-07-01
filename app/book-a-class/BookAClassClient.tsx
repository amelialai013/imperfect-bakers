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
  const allLabels = [
    ...CLASS_ORDER,
    ...Object.keys(grouped).filter((l) => !CLASS_ORDER.includes(l)),
  ].filter((label) => (grouped[label]?.length ?? 0) > 0);

  if (allLabels.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#6b7280] text-base">No sessions currently available.</p>
        <p className="text-[#6b7280] text-sm mt-2">Check back soon or register your interest below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {allLabels.map((label, i) => {
        const classSessions = grouped[label] ?? [];
        const isOpen = activeClass === label;
        const sub = CLASS_SUBS[label] ?? "";
        const num = String(i + 1).padStart(2, "0");

        return (
          <div key={label}>
            <button
              onClick={() => setActiveClass(isOpen ? null : label)}
              className="w-full group text-left py-10 border-t border-[#e4dfd5] flex items-center gap-8 md:gap-16"
            >
              {/* Index number */}
              <span
                className="text-[0.6875rem] font-semibold tracking-[0.2em] text-[#c8c0b4] shrink-0 hidden md:block tabular-nums transition-colors duration-200 group-hover:text-[#006644]"
              >
                {num}
              </span>

              {/* Class name + sub */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-2xl md:text-3xl font-medium tracking-tight leading-none transition-colors duration-200 ${
                    isOpen ? "text-[#006644]" : "text-[#1a1a1a] group-hover:text-[#006644]"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  {label}
                </p>
                <p className="text-[#9ca3af] text-sm mt-2">{sub}</p>
              </div>

              {/* Session count */}
              <span
                className={`text-[0.6875rem] font-semibold tracking-[0.2em] uppercase shrink-0 hidden sm:block transition-colors duration-200 ${
                  isOpen ? "text-[#006644]" : "text-[#c8c0b4] group-hover:text-[#006644]"
                }`}
              >
                {classSessions.length} {classSessions.length === 1 ? "session" : "sessions"}
              </span>

              {/* Chevron */}
              <svg
                className={`w-4 h-4 shrink-0 transition-all duration-300 ${
                  isOpen ? "text-[#006644] rotate-90" : "text-[#c8c0b4] group-hover:text-[#006644] group-hover:translate-x-1"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Session cards */}
            {isOpen && (
              <div className="pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {classSessions.map((s) => {
                  const isFull = s.spotsLeft === 0;
                  return (
                    <Link
                      key={s.id}
                      href={isFull ? "#" : `/book-a-class/${s.id}`}
                      aria-disabled={isFull}
                    >
                      <div
                        className={`rounded-xl p-6 h-full flex flex-col justify-between gap-5 transition-all duration-200 ${
                          isFull
                            ? "bg-[#f5f3ef] border border-[#e4dfd5] opacity-50 cursor-not-allowed"
                            : "bg-white border border-[#e4dfd5] hover:border-[#006644] hover:shadow-[0_4px_20px_rgba(0,102,68,0.08)] cursor-pointer"
                        }`}
                      >
                        <div>
                          {s.sessionName && (
                            <p className="text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-3">
                              {s.sessionName}
                            </p>
                          )}
                          <p
                            className="text-[#1a1a1a] font-medium text-base leading-snug"
                            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                          >
                            {s.date}
                          </p>
                          <p className="text-[#9ca3af] text-sm mt-1">{s.time}</p>
                          <p className="text-[#9ca3af] text-sm mt-0.5">{s.location}</p>
                        </div>

                        <div className="flex items-end justify-between pt-4 border-t border-[#f0ece4]">
                          <div>
                            <p className="text-[#1a1a1a] font-semibold text-xl leading-none">
                              ${s.price}
                              <span className="text-[#c8c0b4] text-xs font-normal ml-1.5">/ person</span>
                            </p>
                            <p className={`text-[0.6875rem] tracking-[0.08em] uppercase mt-1.5 ${isFull ? "text-red-400" : "text-[#006644]"}`}>
                              {isFull ? "Fully booked" : `${s.spotsLeft} spot${s.spotsLeft === 1 ? "" : "s"} left`}
                            </p>
                          </div>
                          {!isFull && (
                            <div className="w-8 h-8 rounded-full bg-[#006644] flex items-center justify-center shrink-0">
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
            )}
          </div>
        );
      })}

      {/* Closing rule */}
      <div className="border-t border-[#e4dfd5]" />
    </div>
  );
}
