"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClassSession } from "@/lib/types";

// Group sessions by classLabel
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

  // Merge hardcoded class types with any extra classes from KV
  const kvLabels = Object.keys(grouped);
  const allLabels = [
    ...CLASS_ORDER,
    ...kvLabels.filter((l) => !CLASS_ORDER.includes(l)),
  ];

  if (sessions.length === 0) {
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

        return (
          <div key={label} className={i > 0 ? "border-t border-[#e4dfd5]" : ""}>
            <button
              onClick={() => setActiveClass(isOpen ? null : label)}
              className="w-full group text-left py-7 flex items-center justify-between transition-colors"
            >
              <div>
                <p
                  className={`text-lg font-medium leading-snug transition-colors ${
                    isOpen ? "text-[#006644]" : "text-[#1a1a1a] group-hover:text-[#006644]"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  {label}
                </p>
                {sub && <p className="text-[#6b7280] text-sm mt-1">{sub}</p>}
              </div>
              <div className="flex items-center gap-5 shrink-0 ml-8">
                {classSessions.length > 0 && (
                  <span className="text-[0.6875rem] tracking-[0.15em] uppercase text-[#006644] hidden sm:block">
                    {classSessions.length} {classSessions.length === 1 ? "session" : "sessions"}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 transition-all duration-300 ${
                    isOpen
                      ? "text-[#006644] rotate-90"
                      : "text-[#c8c0b4] group-hover:text-[#006644] group-hover:translate-x-1"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="pb-8">
                {classSessions.length === 0 ? (
                  <p className="text-[#6b7280] text-sm py-2">
                    No upcoming sessions scheduled.{" "}
                    <Link href="/interest" className="text-[#006644] underline underline-offset-2 hover:opacity-80 transition-opacity">
                      Register your interest
                    </Link>{" "}
                    and we&apos;ll let you know when one opens up.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classSessions.map((s) => {
                      const isFull = s.spotsLeft === 0;
                      return (
                        <Link key={s.id} href={isFull ? "#" : `/book-a-class/${s.id}`} aria-disabled={isFull}>
                          <div
                            className={`group border rounded-[8px] p-6 h-full flex flex-col justify-between gap-6 transition-all duration-200 ${
                              isFull
                                ? "bg-[#faf9f6] border-[#e4dfd5] opacity-60 cursor-not-allowed"
                                : "bg-white border-[#e4dfd5] hover:border-[#006644] hover:shadow-sm cursor-pointer"
                            }`}
                          >
                            <div>
                              {s.sessionName && (
                                <p className="text-[0.6875rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-2">
                                  {s.sessionName}
                                </p>
                              )}
                              <p
                                className="text-[#1a1a1a] font-medium text-base leading-snug mb-1"
                                style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                              >
                                {s.date}
                              </p>
                              <p className="text-[#6b7280] text-sm">{s.time}</p>
                              <p className="text-[#6b7280] text-sm mt-3">{s.location}</p>
                            </div>
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-[#1a1a1a] font-semibold text-lg">
                                  ${s.price}{" "}
                                  <span className="text-[#6b7280] text-sm font-normal">/ person</span>
                                </p>
                                <p
                                  className={`text-[0.6875rem] tracking-[0.1em] uppercase mt-1 ${
                                    isFull ? "text-red-400" : "text-[#006644]"
                                  }`}
                                >
                                  {isFull ? "Fully booked" : `${s.spotsLeft} spot${s.spotsLeft === 1 ? "" : "s"} left`}
                                </p>
                              </div>
                              {!isFull && (
                                <div className="w-9 h-9 rounded-full border border-[#006644]/30 flex items-center justify-center group-hover:bg-[#006644] group-hover:border-[#006644] transition-colors">
                                  <svg
                                    className="w-3.5 h-3.5 text-[#006644] group-hover:text-white transition-colors"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
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
            )}
          </div>
        );
      })}
      <div className="border-t border-[#e4dfd5]" />
    </div>
  );
}
