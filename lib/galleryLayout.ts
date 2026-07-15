import type { GalleryPhoto } from "@/app/api/gallery/route";

// Shared between the public gallery (components/GalleryLightbox.tsx) and the
// admin gallery (app/admin/page.tsx) so the admin grid previews the exact
// same masonry layout visitors see — same breakpoints, same packing.

export const FALLBACK_RATIO = 1; // square, for photos without stored dimensions

export const COLUMN_BREAKPOINTS = [
  { minWidth: 1280, columns: 4 },
  { minWidth: 1024, columns: 3 },
  { minWidth: 640, columns: 2 },
  { minWidth: 0, columns: 1 },
];

export function getColumnCount(): number {
  if (typeof window === "undefined") return 4; // SSR guess; corrected on mount
  const w = window.innerWidth;
  return COLUMN_BREAKPOINTS.find((b) => w >= b.minWidth)!.columns;
}

// Real masonry — like Pinterest, not CSS `columns-*`. Walks photos in order
// and drops each one into whichever column is currently shortest, so varied
// aspect ratios pack without gaps. See GalleryLightbox for the full rationale.
export function packColumns(photos: GalleryPhoto[], columnCount: number) {
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
