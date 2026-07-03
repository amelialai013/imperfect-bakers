"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ClassSession } from "@/lib/types";

const MONTH_INDEX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3,
  May: 4, June: 5, July: 6, August: 7,
  September: 8, October: 9, November: 10, December: 11,
};

// Parse "Saturday 18 July 2026" → Date
// Safari rejects "18 July 2026" passed to new Date(), so we parse manually.
function parseDisplayDate(dateStr: string): Date {
  const parts = dateStr.split(" "); // ["Saturday", "18", "July", "2026"]
  if (parts.length === 4) {
    const month = MONTH_INDEX[parts[2]];
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[3], 10);
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return new Date(dateStr);
}

export default function BookAClassClient({ sessions, initialClass }: { sessions: ClassSession[]; initialClass?: string }) {
  const [activeClass, setActiveClass] = useState<string>(initialClass ?? "All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Filter out past sessions
  const upcomingSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter((s) => parseDisplayDate(s.date) >= today);
  }, [sessions]);

  const classLabels = useMemo(() => {
    return Array.from(new Set(upcomingSessions.map((s) => s.classLabel)));
  }, [upcomingSessions]);

  const filtered = useMemo(() => {
    let result = activeClass === "All"
      ? upcomingSessions
      : upcomingSessions.filter((s) => s.classLabel === activeClass);
    result = [...result].sort((a, b) => {
      const da = parseDisplayDate(a.date).getTime();
      const db = parseDisplayDate(b.date).getTime();
      return sortOrder === "asc" ? da - db : db - da;
    });
    return result;
  }, [upcomingSessions, activeClass, sortOrder]);

  if (upcomingSessions.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-[#6b7280] text-base">No sessions currently available.</p>
        <p className="text-[#6b7280] text-sm mt-2">Check back soon or register your interest below.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Filter & sort bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Class filter */}
        <div className="relative w-auto flex items-center">
          <select
            value={activeClass}
            onChange={(e) => setActiveClass(e.target.value)}
            className="appearance-none bg-white border border-[#e4dfd5] rounded-full text-sm font-medium text-[#1a1a1a] focus:outline-none cursor-pointer transition-colors h-[46px] pl-5 pr-9"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            <option value="All">All classes</option>
            {classLabels.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>


          {/* Grid/List + Sort — grouped so they wrap together */}
          <div className="flex items-center gap-2">

          {/* Grid / List toggle — hidden on mobile */}
          <div className="hidden sm:flex items-center border border-[#e4dfd5] rounded-full overflow-hidden bg-white h-[46px]">
            <button
              onClick={() => setView("grid")}
              className={`px-5 h-full transition-colors ${view === "grid" ? "text-[#006644]" : "text-[#c8c0b4] hover:text-[#6b7280]"}`}
              aria-label="Grid view"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div className="w-px h-4 bg-[#e4dfd5]" />
            <button
              onClick={() => setView("list")}
              className={`px-5 h-full transition-colors ${view === "list" ? "text-[#006644]" : "text-[#c8c0b4] hover:text-[#6b7280]"}`}
              aria-label="List view"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Date sort toggle */}
          <button
            onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
            className="flex items-center gap-2 bg-white border border-[#e4dfd5] rounded-full pl-4 pr-4 text-sm font-medium text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644] transition-colors shrink-0 h-[46px] w-[148px] justify-center"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            {sortOrder === "desc" ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 4l4 4m0 0l4-4m-4 4V8" />
              </svg>
            )}
            <span>{sortOrder === "asc" ? "Earliest first" : "Latest first"}</span>
          </button>

          </div>{/* end grouped */}

      </div>

      {/* ── Session cards ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f0ece4] flex items-center justify-center mx-auto mb-6">
            <svg className="w-6 h-6 text-[#c8c0b4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[#1a1a1a] font-medium mb-2" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
            No upcoming classes for {activeClass !== "All" ? <span className="text-[#006644] font-semibold">{activeClass}</span> : ""}
          </p>
          <p className="text-[#6b7280] text-sm mb-8">Check back soon — new sessions are added regularly.</p>
          {activeClass !== "All" && (
            <button
              onClick={() => setActiveClass("All")}
              className="btn-secondary"
            >
              See all classes
            </button>
          )}
        </div>
      ) : (
        /* Single render — no mobile/desktop split that can cause Safari display bugs */
        <>
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((s) => <SessionCard key={s.id} s={s} view="grid" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((s) => <SessionCard key={s.id} s={s} view="list" />)}
            </div>
          )}
          {activeClass !== "All" && (
            <div className="mt-8">
              <button
                onClick={() => setActiveClass("All")}
                className="text-sm text-[#006644] hover:underline"
              >
                See all classes
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function dateParts(date: string) {
  // "Saturday 18 July 2026" → { dow: "Sat", day: "18", mon: "Jul" }
  const months: Record<string, string> = {
    January: "Jan", February: "Feb", March: "Mar", April: "Apr",
    May: "May", June: "Jun", July: "Jul", August: "Aug",
    September: "Sep", October: "Oct", November: "Nov", December: "Dec",
  };
  const days: Record<string, string> = {
    Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
    Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
  };
  const parts = date.split(" "); // ["Saturday", "18", "July", "2026"]
  if (parts.length === 4) {
    return { dow: days[parts[0]] ?? parts[0], day: parts[1], mon: months[parts[2]] ?? parts[2] };
  }
  return { dow: "", day: "", mon: date };
}

function shortDate(date: string) {
  // "Saturday 18 July 2026" → "18 Jul 2026"
  const months: Record<string, string> = {
    January: "Jan", February: "Feb", March: "Mar", April: "Apr",
    May: "May", June: "Jun", July: "Jul", August: "Aug",
    September: "Sep", October: "Oct", November: "Nov", December: "Dec",
  };
  const parts = date.split(" "); // ["Saturday", "18", "July", "2026"]
  if (parts.length === 4) {
    return `${parts[1]} ${months[parts[2]] ?? parts[2]} ${parts[3]}`;
  }
  return date;
}

function SessionCard({ s, view }: { s: import("@/lib/types").ClassSession; view: "grid" | "list" }) {
  const isFull = s.spotsLeft === 0;

  if (view === "list") {
    return (
      <Link
        href={isFull ? "#" : `/book-class/${s.id}`}
        aria-disabled={isFull}
        className={isFull ? "pointer-events-none" : ""}
      >
        <article
          className={`group relative rounded-2xl overflow-hidden transition-[border-color,box-shadow] duration-300 ${
            isFull
              ? "bg-[#f0ece4] opacity-60 cursor-not-allowed"
              : "bg-white border border-[#e8e2d9] hover:border-[#006644] hover:shadow-[0_8px_32px_rgba(0,102,68,0.10)] cursor-pointer"
          }`}
        >
          <div className={`h-1 w-full ${isFull ? "bg-[#c8c0b4]" : "bg-[#006644]"}`} />
          {/* Desktop layout: single row */}
          <div className="hidden sm:flex px-4 pt-[9px] pb-4 gap-6">
            <div className="flex-1 min-w-0">
              <span className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-[#006644]">{s.classLabel}</span>
              <h3 className="text-[#1a1a1a] text-lg font-medium leading-snug mt-[9.5px]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                {s.sessionName || s.classLabel}
              </h3>
              {s.location && (
                <span className="flex items-center gap-1 mt-1 text-[#6b7280] text-xs">
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {s.location}
                </span>
              )}
            </div>
            <div className="flex items-center gap-5 text-sm text-[#6b7280] shrink-0 self-center mt-[4px]">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="md:hidden">{shortDate(s.date)}</span>
                <span className="hidden md:inline">{s.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s.time}
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-center mt-[4px]">
              {/* Occupancy ring */}
              {(() => {
                const booked = s.maxSpots - s.spotsLeft;
                const pct = s.maxSpots > 0 ? Math.round((booked / s.maxSpots) * 100) : 0;
                const r = 22;
                const circ = 2 * Math.PI * r;
                return (
                  <div className="relative flex items-center justify-center w-14 h-14 shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r={r} fill="none" stroke={isFull ? "#c8c0b4" : "#e8e2d9"} strokeWidth="4" />
                      <circle cx="28" cy="28" r={r} fill="none" stroke={isFull ? "#c8c0b4" : "#006644"} strokeWidth="4"
                        strokeDasharray={circ}
                        strokeDashoffset={circ * (1 - pct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="text-xs font-semibold text-[#1a1a1a] relative z-10">{s.maxSpots - s.spotsLeft}/{s.maxSpots}</span>
                  </div>
                );
              })()}
              <p className="text-[#1a1a1a] text-lg font-semibold" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>${s.price}</p>
              {!isFull && (
                <div className="flex items-center gap-1 text-[#006644] text-sm font-medium">
                  <span className="hidden md:inline">Book</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Mobile layout: grid card style */}
          <div className="sm:hidden p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-[#006644]">{s.classLabel}</span>
              {!isFull ? (
                <span className="text-xs font-medium text-[#6b7280] bg-[#f5f2ed] rounded-full px-3 py-1 shrink-0">{s.spotsLeft} left</span>
              ) : (
                <span className="text-xs font-medium text-red-400 bg-red-50 rounded-full px-3 py-1 shrink-0">Full</span>
              )}
            </div>
            <div className="-mt-[5.5px]">
              <h3 className="text-[#1a1a1a] text-lg font-medium leading-snug mb-1" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                {s.sessionName || s.classLabel}
              </h3>
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                <svg className="w-3 h-3 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{s.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                <svg className="w-3 h-3 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{s.time}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                <svg className="w-3 h-3 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{s.location}</span>
              </div>
            </div>
            {(() => {
              const booked = s.maxSpots - s.spotsLeft;
              const pct = s.maxSpots > 0 ? Math.round((booked / s.maxSpots) * 100) : 0;
              return (
                <div className="my-1">
                  <div className="flex items-center mb-1.5">
                    <p className="text-xs text-[#6b7280]">{`${booked}/${s.maxSpots} reservations`}</p>
                  </div>
                  <div className={`h-1.5 w-full rounded-full ${isFull ? "bg-[#c8c0b4]/30" : "bg-[#e8e2d9]"}`}>
                    <div className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-[#c8c0b4]" : "bg-[#006644]"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })()}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#1a1a1a] text-lg font-semibold leading-none" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>${s.price}</p>
                <p className="text-[#6b7280] text-xs mt-0.5">per person</p>
              </div>
              {!isFull && (
                <div className="flex items-center gap-1.5 text-[#006644] text-sm font-medium">
                  <span>Book</span>
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={isFull ? "#" : `/book-class/${s.id}`}
      aria-disabled={isFull}
      className={isFull ? "pointer-events-none" : ""}
    >
      <article
        className={`group relative rounded-2xl overflow-hidden h-full flex flex-col transition-[border-color,box-shadow] duration-300 ${
          isFull
            ? "bg-[#f0ece4] opacity-60 cursor-not-allowed"
            : "bg-white border border-[#e8e2d9] hover:border-[#006644] hover:shadow-[0_8px_32px_rgba(0,102,68,0.10)] cursor-pointer"
        }`}
      >
        <div className={`h-1 w-full ${isFull ? "bg-[#c8c0b4]" : "bg-[#006644]"}`} />
        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-[#006644]">{s.classLabel}</span>
            {!isFull ? (
              <span className="text-xs font-medium text-[#6b7280] bg-[#f5f2ed] rounded-full px-3 py-1 shrink-0">{s.spotsLeft} left</span>
            ) : (
              <span className="text-xs font-medium text-red-400 bg-red-50 rounded-full px-3 py-1 shrink-0">Full</span>
            )}
          </div>
          <div className="-mt-[5.5px]">
            <h3 className="text-[#1a1a1a] text-lg font-medium leading-snug mb-1" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              {s.sessionName || s.classLabel}
            </h3>
            {s.description && <p className="text-[#6b7280] text-xs leading-relaxed line-clamp-2">{s.description}</p>}
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <svg className="w-3 h-3 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{s.date}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <svg className="w-3 h-3 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{s.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6b7280]">
              <svg className="w-3 h-3 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{s.location}</span>
            </div>
          </div>
          {/* Occupancy bar */}
          {(() => {
            const booked = s.maxSpots - s.spotsLeft;
            const pct = s.maxSpots > 0 ? Math.round((booked / s.maxSpots) * 100) : 0;
            return (
              <div className="mt-1 mb-4">
                <div className="flex items-center mb-1.5">
                  <p className="text-xs text-[#1a1a1a]">{`${s.maxSpots - s.spotsLeft}/${s.maxSpots} reservations`}</p>
                </div>
                <div className={`h-1.5 w-full rounded-full ${isFull ? "bg-[#c8c0b4]/30" : "bg-[#e8e2d9]"}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-[#c8c0b4]" : "bg-[#006644]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#1a1a1a] text-lg font-semibold leading-none" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>${s.price}</p>
              <p className="text-[#6b7280] text-xs mt-0.5">per person</p>
            </div>
            {!isFull && (
              <div className="flex items-center gap-1.5 text-[#006644] text-sm font-medium">
                <span>Book</span>
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
