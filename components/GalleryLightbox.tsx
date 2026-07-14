"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { GalleryPhoto } from "@/app/api/gallery/route";

// Varied placeholder ratios so the loading skeleton already looks like a masonry grid
const PLACEHOLDER_RATIOS = ["4 / 5", "1 / 1", "3 / 4", "5 / 4", "4 / 3"];

// Minimum horizontal drag (px) to count as a swipe, and how much more
// horizontal than vertical the drag must be so a scroll-ish gesture doesn't
// accidentally page through photos.
const SWIPE_THRESHOLD = 50;

export default function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const markLoaded = useCallback((id: string) => {
    setLoaded((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]);
  const next = useCallback(() =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) next(); else prev();
  }, [next, prev]);

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
        {photos.map((photo, i) => {
          const isLoaded = loaded.has(photo.id);
          return (
            <div
              key={photo.id}
              className="break-inside-avoid overflow-hidden rounded-xl cursor-zoom-in group relative bg-[#efe9de]"
              style={!isLoaded ? { aspectRatio: PLACEHOLDER_RATIOS[i % PLACEHOLDER_RATIOS.length] } : undefined}
              onClick={() => setActiveIndex(i)}
            >
              {!isLoaded && (
                <div
                  className="gallery-skeleton absolute inset-0"
                  style={{ animationDelay: `-${(i % 6) * 0.4}s` }}
                />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={(el) => { if (el?.complete) markLoaded(photo.id); }}
                src={photo.url}
                alt="Gallery photo"
                onLoad={() => markLoaded(photo.id)}
                className={`w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${
                  isLoaded ? "opacity-100 blur-none" : "absolute inset-0 h-full opacity-0 blur-sm"
                }`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
            </div>
          );
        })}
      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────────── */}
      {activeIndex !== null && (
        /* Clicking the backdrop (this div) closes the lightbox */
        <div
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-[10000] flex flex-col bg-black/90 backdrop-blur-sm"
        >
          {/* Top bar — fixed height, click closes. Compact whenever the viewport is short
              (includes landscape phones, not just narrow ones) so the photo gets more room. */}
          <div className="lightbox-bar lightbox-bar-inner relative flex shrink-0 items-center justify-between">
            {/* Counter */}
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none text-sm text-white/60 [font-variant-numeric:tabular-nums]">
              {activeIndex + 1} / {photos.length}
            </span>
            {/* Close button */}
            <button
              onClick={close}
              aria-label="Close"
              className="lightbox-btn ml-auto flex cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image zone — fills all remaining space; nearly edge-to-edge whenever the viewport
              is short (phones, portrait or landscape), gutters for the nav buttons once there's
              room to spare (real desktop/tablet). */}
          <div className="lightbox-zone relative flex flex-1 min-h-0 items-center justify-center overflow-hidden">
            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
              className="lightbox-btn lightbox-btn-prev absolute z-[1] flex cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[activeIndex].url}
              alt="Gallery photo"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full select-none rounded-lg object-contain shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
            />

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
              className="lightbox-btn lightbox-btn-next absolute z-[1] flex cursor-pointer items-center justify-center rounded-full border-none bg-white/10 text-white"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Bottom bar — same height as top bar = perfect symmetry, click closes */}
          <div className="lightbox-bar shrink-0" />
        </div>
      )}
    </>
  );
}
