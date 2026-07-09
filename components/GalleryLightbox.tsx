"use client";

import { useState, useEffect, useCallback } from "react";
import type { GalleryPhoto } from "@/app/api/gallery/route";

export default function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const prev = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]);

  const next = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, prev, next]);

  return (
    <>
      {/* ── GRID ─────────────────────────────────────────────── */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="break-inside-avoid overflow-hidden rounded-xl cursor-zoom-in group relative"
            onClick={() => setActiveIndex(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Gallery photo"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
          </div>
        ))}
      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────────── */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          style={{ display: "grid", gridTemplateRows: "5rem 1fr 5rem" }}
          onClick={close}
        >
          {/* ── Row 1: top bar (counter + close) ── */}
          <div className="flex items-center justify-between px-6">
            <div className="absolute left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tabular-nums select-none pointer-events-none">
              {activeIndex + 1} / {photos.length}
            </div>
            <button
              className="ml-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={close}
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Row 2: image (fills exactly the space between the two bars) ── */}
          <div
            className="flex items-center justify-center px-16 sm:px-20 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev arrow */}
            <button
              className="absolute left-2 sm:left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[activeIndex].url}
              alt="Gallery photo"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
              draggable={false}
            />

            {/* Next arrow */}
            <button
              className="absolute right-2 sm:right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* ── Row 3: bottom bar (same height as top = perfect symmetry) ── */}
          <div />
        </div>
      )}
    </>
  );
}
