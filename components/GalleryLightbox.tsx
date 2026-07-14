"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { GalleryPhoto } from "@/app/api/gallery/route";

// Fallback for photos without stored dimensions (shouldn't happen going
// forward — see the upload route) so the packing math below still has a
// number to work with.
const FALLBACK_RATIO = 1; // square

// Minimum horizontal drag (px) to count as a swipe, and how much more
// horizontal than vertical the drag must be so a scroll-ish gesture doesn't
// accidentally page through photos.
const SWIPE_THRESHOLD = 50;

// Matches the columns-1/sm/lg/xl breakpoints this grid used to rely on via
// CSS `columns-*`. We compute layout in JS now (see below), so the column
// count needs to be known here instead of left to the browser.
const COLUMN_BREAKPOINTS = [
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];

function getColumnCount(): number {
  if (typeof window === "undefined") return 4; // SSR guess; corrected on mount below
  const w = window.innerWidth;
  return COLUMN_BREAKPOINTS.find((b) => w >= b.minWidth)!.columns;
}

// Real masonry — like Pinterest, not CSS `columns-*`. `columns-*` fills each
// column completely (in DOM order) before moving to the next, balancing
// *total* column height; with photos this varied in aspect ratio (6000x2590
// panoramics next to 3438x5157 portraits) that balancing left visible gaps
// wherever a tall photo got pushed whole into the next column. This instead
// walks the photos in order and drops each one into whichever column is
// currently shortest — the standard masonry packing algorithm, which can't
// produce a gap by construction.
function packColumns(photos: GalleryPhoto[], columnCount: number) {
  const heights = new Array(columnCount).fill(0);
  const columns: { photo: GalleryPhoto; index: number }[][] = Array.from({ length: columnCount }, () => []);
  photos.forEach((photo, index) => {
    const heightRatio = photo.width && photo.height ? photo.height / photo.width : FALLBACK_RATIO;
    let shortest = 0;
    for (let c = 1; c < columnCount; c++) {
      if (heights[c] < heights[shortest]) shortest = c;
    }
    columns[shortest].push({ photo, index });
    heights[shortest] += heightRatio;
  });
  return columns;
}

export default function GalleryLightbox({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  // Always starts at the same value the server rendered (4 — see
  // getColumnCount's SSR branch), regardless of the client's real screen
  // size. Reading window.innerWidth here instead would make the client's
  // *first* render (which happens synchronously during hydration) disagree
  // with what the server sent, and React can't reconcile that — it would
  // hydration-mismatch on every photo's blurDataURL, since a different
  // photo would land in a different column. The real column count is set
  // a moment later, after hydration, by the effect below.
  const [columnCount, setColumnCount] = useState(4);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onResize = () => setColumnCount(getColumnCount());
    onResize(); // correct to the real column count now that we're safely past hydration
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const columns = useMemo(() => packColumns(photos, columnCount), [photos, columnCount]);

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
      {/* One flex column per masonry column (see packColumns above) instead of
          CSS `columns-*`, so photos keep their real aspect ratio with no gaps. */}
      <div className="flex items-start gap-3">
        {columns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-1 flex-col gap-3">
            {column.map(({ photo, index: i }) => {
              const isLoaded = loaded.has(photo.id);
              const ratio = photo.width && photo.height ? `${photo.width} / ${photo.height}` : "1 / 1";
              return (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl cursor-zoom-in group relative bg-[#efe9de]"
                  style={{ aspectRatio: ratio }}
                  onClick={() => setActiveIndex(i)}
                >
                  {photo.blurDataURL ? (
                    /* Blur-up placeholder: an actual (tiny, blurred) preview of this
                       exact photo, so what you see while it loads is real content,
                       not a generic shape — and the crossfade to the sharp photo
                       reads as the image itself resolving into focus. scale-110 is
                       static (never transitions/animates) — it just pushes the
                       blur filter's soft edge outside the visible crop so the tile
                       boundary stays crisp instead of showing a faint blur halo. */
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photo.blurDataURL}
                      alt=""
                      aria-hidden="true"
                      className={`absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-700 ${
                        isLoaded ? "opacity-0" : "opacity-100"
                      }`}
                    />
                  ) : (
                    !isLoaded && (
                      <div
                        className="gallery-skeleton absolute inset-0"
                        style={{ animationDelay: `-${(i % 6) * 0.4}s` }}
                      />
                    )
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={(el) => { if (el?.complete) markLoaded(photo.id); }}
                    src={photo.url}
                    alt="Gallery photo"
                    onLoad={() => markLoaded(photo.id)}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.02] ${
                      isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
                </div>
              );
            })}
          </div>
        ))}
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
