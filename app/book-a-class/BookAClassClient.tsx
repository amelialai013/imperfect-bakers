"use client";

import Link from "next/link";
import type { ClassSession } from "@/lib/types";

export default function BookAClassClient({ sessions }: { sessions: ClassSession[] }) {
  if (sessions.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#6b7280] text-base">No sessions currently available.</p>
        <p className="text-[#6b7280] text-sm mt-2">Check back soon or register your interest below.</p>
      </div>
    );
  }

  // Sort by date string proximity — show soonest first
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {sorted.map((s) => {
        const isFull = s.spotsLeft === 0;
        const spotsPercent = Math.round(((s.maxSpots - s.spotsLeft) / s.maxSpots) * 100);

        return (
          <Link
            key={s.id}
            href={isFull ? "#" : `/book-a-class/${s.id}`}
            aria-disabled={isFull}
            className={isFull ? "pointer-events-none" : ""}
          >
            <article
              className={`group relative rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 ${
                isFull
                  ? "bg-[#f0ece4] opacity-60 cursor-not-allowed"
                  : "bg-white border border-[#e8e2d9] hover:border-[#006644] hover:shadow-[0_8px_32px_rgba(0,102,68,0.10)] cursor-pointer"
              }`}
            >
              {/* Colour strip */}
              <div className={`h-1 w-full ${isFull ? "bg-[#c8c0b4]" : "bg-[#006644]"}`} />

              <div className="p-7 flex flex-col gap-6 flex-1">
                {/* Top: class label + spots badge */}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-[#006644]">
                    {s.classLabel}
                  </span>
                  {!isFull && (
                    <span className="text-[0.65rem] font-medium tracking-wide text-[#6b7280] bg-[#f5f2ed] rounded-full px-2.5 py-1 shrink-0">
                      {s.spotsLeft} left
                    </span>
                  )}
                  {isFull && (
                    <span className="text-[0.65rem] font-medium tracking-wide text-red-400 bg-red-50 rounded-full px-2.5 py-1 shrink-0">
                      Full
                    </span>
                  )}
                </div>

                {/* Session name / headline */}
                <div>
                  <h3
                    className="text-[#1a1a1a] text-xl font-medium leading-snug mb-1"
                    style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                  >
                    {s.sessionName || s.classLabel}
                  </h3>
                  {s.description && (
                    <p className="text-[#9ca3af] text-sm leading-relaxed line-clamp-2">{s.description}</p>
                  )}
                </div>

                {/* Meta */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2.5 text-sm text-[#6b7280]">
                    <svg className="w-3.5 h-3.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{s.date}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-[#6b7280]">
                    <svg className="w-3.5 h-3.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{s.time}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-[#6b7280]">
                    <svg className="w-3.5 h-3.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{s.location}</span>
                  </div>
                </div>

                {/* Spots progress bar */}
                {!isFull && (
                  <div>
                    <div className="h-0.5 bg-[#f0ece4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#006644] rounded-full transition-all"
                        style={{ width: `${spotsPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer: price + CTA */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[#1a1a1a] text-2xl font-semibold leading-none" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                      ${s.price}
                    </p>
                    <p className="text-[#c8c0b4] text-xs mt-0.5">per person</p>
                  </div>
                  {!isFull && (
                    <div className="flex items-center gap-1.5 text-[#006644] text-sm font-medium group-hover:gap-2.5 transition-all duration-200">
                      <span>Book</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
