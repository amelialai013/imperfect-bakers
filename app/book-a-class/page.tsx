"use client";

import { useState } from "react";
import Link from "next/link";
import { classTypeList, getSessionsByClass } from "./sessions-data";

export default function BookAClassPage() {
  const [activeClass, setActiveClass] = useState<string | null>(null);

  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#006644] px-8 pt-16 pb-14">
        <div className="max-w-7xl mx-auto">
          <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Reserve your spot</span>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-12" style={{ alignItems: "last baseline" }}>
            <h1
              className="text-4xl md:text-5xl text-white leading-tight tracking-tight"
              style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
            >
              <em className="not-italic text-white/50">Class</em> bookings
            </h1>
            <div className="md:ml-auto">
              <p className="text-white/50 text-base leading-relaxed max-w-sm">
                Browse upcoming sessions and secure your spot in the kitchen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLASS BROWSER ────────────────────────────────────── */}
      <section className="pt-10 pb-20 px-8 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">

          {/* Class list */}
          <div>
            {classTypeList.map((c, i) => {
              const sessions = getSessionsByClass(c.label);
              const sessionCount = sessions.length;
              const isOpen = activeClass === c.label;

              return (
                <div key={c.label} className={i > 0 ? "border-t border-[#e4dfd5]" : ""}>
                  <button
                    onClick={() => setActiveClass(isOpen ? null : c.label)}
                    className="w-full group text-left py-7 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-baseline gap-7">
                      <div>
                        <p
                          className={`text-lg font-medium leading-snug transition-colors ${
                            isOpen ? "text-[#006644]" : "text-[#1a1a1a] group-hover:text-[#006644]"
                          }`}
                          style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                        >
                          {c.label}
                        </p>
                        <p className="text-[#6b7280] text-sm mt-1 leading-relaxed">{c.sub}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0 ml-8">
                      {sessionCount > 0 && (
                        <span className="text-[0.6875rem] tracking-[0.15em] uppercase text-[#006644] hidden sm:block">
                          {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 transition-all duration-300 ${
                          isOpen
                            ? "text-[#006644] rotate-90"
                            : "text-[#c8c0b4] group-hover:text-[#006644] group-hover:translate-x-1"
                        }`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded sessions */}
                  {isOpen && (
                    <div className="pb-8">
                      {sessions.length === 0 ? (
                        <p className="text-[#6b7280] text-sm leading-relaxed py-4">
                          No upcoming sessions scheduled.{" "}
                          <Link href="/interest" className="text-[#006644] underline underline-offset-2 hover:opacity-80 transition-opacity">
                            Register your interest
                          </Link>{" "}
                          and we&apos;ll let you know when one opens up.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {sessions.map((s) => (
                            <Link key={s.id} href={`/book-a-class/${s.id}`}>
                              <div className="group bg-white border border-[#e4dfd5] rounded-[8px] p-6 hover:border-[#006644] hover:shadow-sm transition-all duration-200 cursor-pointer h-full flex flex-col justify-between gap-6">
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
                                    <p className="text-[#1a1a1a] font-semibold text-lg">${s.price} <span className="text-[#6b7280] text-sm font-normal">/ person</span></p>
                                    <p className="text-[0.6875rem] tracking-[0.1em] uppercase text-[#006644] mt-1">
                                      {s.spotsLeft} {s.spotsLeft === 1 ? "spot" : "spots"} left
                                    </p>
                                  </div>
                                  <div className="w-9 h-9 rounded-full border border-[#006644]/30 flex items-center justify-center group-hover:bg-[#006644] group-hover:border-[#006644] transition-colors">
                                    <svg className="w-3.5 h-3.5 text-[#006644] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="border-t border-[#e4dfd5]" />
          </div>

          {/* Private bookings CTA */}
          <div className="mt-10 pt-10">
            <div className="flex flex-col md:flex-row md:items-end gap-10 md:gap-24">
              <div className="flex-1">
                <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-4">Private bookings</span>
                <h2
                  className="text-2xl md:text-3xl text-[#1a1a1a] leading-snug mb-3"
                  style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
                >
                  Don&apos;t see what you&apos;re looking for?
                </h2>
                <p className="text-[#6b7280] text-sm leading-relaxed max-w-sm">
                  Request a private or custom class — at your place or ours. We&apos;ll tailor everything just for you.
                </p>
              </div>
              <Link href="/interest" className="shrink-0">
                <button className="btn-secondary group">
                  Request a class
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
