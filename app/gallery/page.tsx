import { Suspense } from "react";
import type { GalleryPhoto } from "@/app/api/gallery/route";
import GalleryLightbox from "@/components/GalleryLightbox";

export const metadata = {
  title: "Gallery | Imperfect Bakers",
};

export const dynamic = "force-dynamic";

// Same ratios GalleryLightbox uses for its own per-image placeholders, so the
// page-level skeleton and the post-fetch skeleton line up without a visible swap.
const SKELETON_RATIOS = ["4 / 5", "1 / 1", "3 / 4", "5 / 4", "4 / 3", "1 / 1", "4 / 5", "3 / 4", "1 / 1", "5 / 4", "4 / 3", "4 / 5"];

function GallerySkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
      {SKELETON_RATIOS.map((ratio, i) => (
        <div
          key={i}
          className="break-inside-avoid overflow-hidden rounded-xl bg-[#efe9de] relative"
          style={{ aspectRatio: ratio }}
        >
          <div
            className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#efe9de] to-[#e2d9cb]"
            style={{ animationDelay: `${(i % 4) * 120}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

async function getPhotos(): Promise<GalleryPhoto[]> {
  try {
    const BASE = process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : (process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.imperfectbakers.com");
    const res = await fetch(`${BASE}/api/gallery`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function GalleryPhotos() {
  const photos = await getPhotos();

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-[#006644]/8 flex items-center justify-center mb-5">
          <svg className="w-7 h-7 text-[#006644]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[#6b7280] text-base">Photos coming soon, check back later!</p>
      </div>
    );
  }

  return <GalleryLightbox photos={photos} />;
}

export default function GalleryPage() {
  return (
    <>
      {/* ── PAGE HEADER ──────────────────────────────────────── */}
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1
            className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
          >
            Our <em className="not-italic text-[#006644]">gallery</em>
          </h1>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs md:text-right pb-1 text-balance">
            A peek at what happens in our kitchen — messy, joyful, delicious.
          </p>
        </div>
      </section>

      {/* ── PHOTOS ───────────────────────────────────────────── */}
      <section className="pt-12 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <Suspense fallback={<GallerySkeleton />}>
            <GalleryPhotos />
          </Suspense>
        </div>
      </section>
    </>
  );
}
