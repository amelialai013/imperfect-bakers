import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";
import { r2List, r2Del } from "@/lib/r2";

export const dynamic = "force-dynamic";

export interface GalleryPhoto {
  id: string;
  url: string;
  createdAt: string;
  // Real pixel dimensions, when known — lets the gallery grid size each tile
  // to its true aspect ratio *before* the image itself has loaded, so tiles
  // never resize once the photo arrives. Optional because photos uploaded
  // before dimension tracking was added won't have a stored value.
  width?: number;
  height?: number;
  // Tiny base64-encoded blurred preview of this exact photo, shown while the
  // full image loads and crossfaded away once it arrives. Optional for the
  // same reason as width/height — only present once generated at upload time.
  blurDataURL?: string;
  // A resized (~800px), compressed copy of this photo — what the grid
  // actually displays. Originals are full-resolution camera files (4-6MB
  // each); serving those for small grid tiles was burning through Blob's
  // bandwidth allowance for no visual benefit. `url` (the original) is
  // still used for the full-screen lightbox view. Optional for the same
  // reason as the fields above.
  thumbUrl?: string;
}

interface Dims {
  width: number;
  height: number;
  blurDataURL?: string;
  thumbUrl?: string;
}

// ── GET: list all photos ──────────────────────────────────────────────────────
export async function GET() {
  try {
    const objects = await r2List("gallery/");
    const sorted = objects.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
    const dims = await Promise.all(sorted.map((obj) => kv.get<Dims>(`gallery-dims:${obj.pathname}`)));
    const photos: GalleryPhoto[] = sorted.map((obj, i) => ({
      id: obj.pathname,
      url: obj.url,
      createdAt: obj.uploadedAt.toISOString(),
      ...(dims[i]
        ? { width: dims[i].width, height: dims[i].height, blurDataURL: dims[i].blurDataURL, thumbUrl: dims[i].thumbUrl }
        : {}),
    }));
    return NextResponse.json(photos);
  } catch (e) {
    console.error("Gallery list error:", e);
    return NextResponse.json([]);
  }
}

// ── DELETE: remove a photo (admin only) ───────────────────────────────────────
export async function DELETE(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url, id } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  // Delete the original, its thumbnail object, and its KV metadata. `id` is
  // the object's pathname (e.g. "gallery/172...-photo.jpg") — used both as
  // the KV key and to look up the thumbnail's URL.
  try { await r2Del(url); } catch { /* object may already be gone */ }
  if (id) {
    const dims = await kv.get<Dims>(`gallery-dims:${id}`).catch(() => null);
    if (dims?.thumbUrl) {
      await r2Del(dims.thumbUrl).catch(() => {});
    }
    await kv.del(`gallery-dims:${id}`).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
