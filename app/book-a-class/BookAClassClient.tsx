"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { ClassSession } from "@/lib/types";

export default function BookAClassClient({ sessions }: { sessions: ClassSession[] }) {
  const [activeClass, setActiveClass] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<"grid" | "list">("grid");

  const classLabels = useMemo(() => {
    const labels = Array.from(new Set(sessions.map((s) => s.classLabel)));
    return labels;
  }, [sessions]);

  const filtered = useMemo(() => {
    let result = activeClass === "All" ? sessions : sessions.filter((s) => s.classLabel === activeClass);
    result = [...result].sort((a, b) =>
      sortOrder === "asc" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    );
    return result;
  }, [sessions, activeClass, sortOrder]);

  if (sessions.length === 0) {
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
      <div className="flex flex-row items-center gap-3 mb-8">
        {/* Left: class filter + sort + view toggle */}
        <div className="flex items-center gap-2">
          <div className="relative w-auto">
            <select
              value={activeClass}
              onChange={(e) => setActiveClass(e.target.value)}
              className="appearance-none bg-white border border-[#e4dfd5] rounded-full pl-4 pr-9 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#006644] cursor-pointer transition-colors h-[38px]"
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

          {/* Grid / List toggle */}
          <div className="flex items-center border border-[#e4dfd5] rounded-full overflow-hidden bg-white h-[38px]">
            <button
              onClick={() => setView("grid")}
              className={`px-3 h-full transition-colors ${view === "grid" ? "text-[#006644]" : "text-[#c8c0b4] hover:text-[#6b7280]"}`}
              aria-label="Grid view"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <div className="w-px h-4 bg-[#e4dfd5]" />
            <button
              onClick={() => setView("list")}
              className={`px-3 h-full transition-colors ${view === "list" ? "text-[#006644]" : "text-[#c8c0b4] hover:text-[#6b7280]"}`}
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
            className="flex items-center gap-2 bg-white border border-[#e4dfd5] rounded-full pl-4 pr-4 text-sm text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644] transition-colors shrink-0 h-[38px]"
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
            <span className="hidden min-[480px]:inline">{sortOrder === "asc" ? "Earliest first" : "Latest first"}</span>
          </button>
        </div>

      </div>

      {/* ── Session cards ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[#6b7280] text-sm">No sessions for this class type.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s) => <SessionCard key={s.id} s={s} view="grid" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((s) => <SessionCard key={s.id} s={s} view="list" />)}
        </div>
      )}
    </div>
  );
}

function SessionCard({ s, view }: { s: import("@/lib/types").ClassSession; view: "grid" | "list" }) {
  const isFull = s.spotsLeft === 0;
  const spotsPercent = Math.round(((s.maxSpots - s.spotsLeft) / s.maxSpots) * 100);

  if (view === "list") {
    return (
      <Link
        href={isFull ? "#" : `/book-a-class/${s.id}`}
        aria-disabled={isFull}
        className={isFull ? "pointer-events-none" : ""}
      >
        <article
          className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
            isFull
              ? "bg-[#f0ece4] opacity-60 cursor-not-allowed"
              : "bg-white border border-[#e8e2d9] hover:border-[#006644] hover:shadow-[0_8px_32px_rgba(0,102,68,0.10)] cursor-pointer"
          }`}
        >
          <div className={`h-1 w-full ${isFull ? "bg-[#c8c0b4]" : "bg-[#006644]"}`} />
          <div className="px-6 py-4 flex items-center gap-6">
            {/* Name + label */}
            <div className="flex-1 min-w-0">
              <span className="text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-[#006644]">{s.classLabel}</span>
              <h3 className="text-[#1a1a1a] text-base font-medium leading-snug truncate" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                {s.sessionName || s.classLabel}
              </h3>
            </div>
            {/* Meta */}
            <div className="hidden sm:flex items-center gap-5 text-sm text-[#6b7280] shrink-0">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {s.date}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s.time}
              </span>
            </div>
            {/* Price + badge */}
            <div className="flex items-center gap-4 shrink-0">
              {!isFull ? (
                <span className="text-[0.65rem] font-medium text-[#6b7280] bg-[#f5f2ed] rounded-full px-2.5 py-1">{s.spotsLeft} left</span>
              ) : (
                <span className="text-[0.65rem] font-medium text-red-400 bg-red-50 rounded-full px-2.5 py-1">Full</span>
              )}
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
        </article>
      </Link>
    );
  }

  return (
    <Link
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
        <div className={`h-1 w-full ${isFull ? "bg-[#c8c0b4]" : "bg-[#006644]"}`} />
        <div className="p-5 flex flex-col gap-4 flex-1">
          <div className="flex items-start justify-between gap-4">
            <span className="text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-[#006644]">{s.classLabel}</span>
            {!isFull ? (
              <span className="text-[0.65rem] font-medium tracking-wide text-[#6b7280] bg-[#f5f2ed] rounded-full px-2.5 py-1 shrink-0">{s.spotsLeft} left</span>
            ) : (
              <span className="text-[0.65rem] font-medium tracking-wide text-red-400 bg-red-50 rounded-full px-2.5 py-1 shrink-0">Full</span>
            )}
          </div>
          <div>
            <h3 className="text-[#1a1a1a] text-base font-medium leading-snug mb-1" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              {s.sessionName || s.classLabel}
            </h3>
            {s.description && <p className="text-[#9ca3af] text-sm leading-relaxed line-clamp-2">{s.description}</p>}
          </div>
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
          {!isFull && (
            <div className="h-0.5 bg-[#f0ece4] rounded-full overflow-hidden">
              <div className="h-full bg-[#006644] rounded-full" style={{ width: `${spotsPercent}%` }} />
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-[#1a1a1a] text-xl font-semibold leading-none" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>${s.price}</p>
              <p className="text-[#c8c0b4] text-xs mt-0.5">per person</p>
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
