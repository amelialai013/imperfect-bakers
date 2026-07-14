"use client";

import { useState, useEffect, useCallback } from "react";
import type { GalleryPhoto } from "@/app/api/gallery/route";

const BAR = "5rem"; // top and bottom bar height — equal for symmetry

// Varied placeholder ratios so the loading skeleton already looks like a masonry grid
const PLACEHOLDER_RATIOS = ["4 / 5", "1 / 1", "3 / 4", "5 / 4", "4 / 3"];

export default function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());

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
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            display: "flex", flexDirection: "column",
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(4px)",
          }}
        >
          {/* Top bar — fixed height, click closes */}
          <div
            style={{ height: BAR, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", position: "relative" }}
          >
            {/* Counter */}
            <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", fontVariantNumeric: "tabular-nums", pointerEvents: "none", userSelect: "none" }}>
              {activeIndex + 1} / {photos.length}
            </span>
            {/* Close button */}
            <button
              onClick={close}
              aria-label="Close"
              style={{ marginLeft: "auto", width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "9999px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", cursor: "pointer" }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Image zone — fills all remaining space, overflow hidden keeps image inside */}
          <div
            style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4rem" }}
          >
            {/* Prev */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous photo"
              style={{ position: "absolute", left: "0.5rem", width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "9999px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", cursor: "pointer", zIndex: 1 }}
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
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: "0.5rem", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", userSelect: "none" }}
            />

            {/* Next */}
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next photo"
              style={{ position: "absolute", right: "0.5rem", width: "2.5rem", height: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "9999px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", cursor: "pointer", zIndex: 1 }}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Bottom bar — same height as top bar = perfect symmetry, click closes */}
          <div style={{ height: BAR, flexShrink: 0 }} />
        </div>
      )}
    </>
  );
}
