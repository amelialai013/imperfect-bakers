import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";

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
}

interface Dims {
  width: number;
  height: number;
  blurDataURL?: string;
}

const isDev = process.env.NODE_ENV === "development";

// ── GET: list all photos ──────────────────────────────────────────────────────
export async function GET() {
  // Try blob store first (works in production and in local dev with VERCEL_OIDC_TOKEN)
  try {
    const { blobs } = await list({ prefix: "gallery/" });
    const sorted = blobs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    const dims = await Promise.all(sorted.map((blob) => kv.get<Dims>(`gallery-dims:${blob.pathname}`)));
    const photos: GalleryPhoto[] = sorted.map((blob, i) => ({
      id: blob.pathname,
      url: blob.url,
      createdAt: blob.uploadedAt.toISOString(),
      ...(dims[i] ? { width: dims[i].width, height: dims[i].height, blurDataURL: dims[i].blurDataURL } : {}),
    }));
    return NextResponse.json(photos);
  } catch {
    // Fallback: local dev without cloud credentials — scan public/gallery/
    if (isDev) {
      try {
        const { readdir, readFile } = await import("fs/promises");
        const path = await import("path");
        const { imageSize } = await import("image-size");
        const sharp = (await import("sharp")).default;
        const dir = path.join(process.cwd(), "public", "gallery");
        const files = await readdir(dir).catch(() => [] as string[]);
        const names = files.filter((f) => /\.(jpe?g|png|webp|gif|heic)$/i.test(f)).sort().reverse();
        const photos: GalleryPhoto[] = await Promise.all(
          names.map(async (f) => {
            let dims: Dims | undefined;
            try {
              const bytes = await readFile(path.join(dir, f));
              const { width, height } = imageSize(bytes);
              const blurBuf = await sharp(bytes).resize(20).jpeg({ quality: 50 }).toBuffer();
              dims = { width, height, blurDataURL: `data:image/jpeg;base64,${blurBuf.toString("base64")}` };
            } catch { /* unreadable — falls back to placeholder ratio client-side */ }
            return { id: f, url: `/gallery/${f}`, createdAt: "", ...dims };
          })
        );
        return NextResponse.json(photos);
      } catch {
        return NextResponse.json([]);
      }
    }
    return NextResponse.json([]);
  }
}

// ── DELETE: remove a photo (admin only) ───────────────────────────────────────
export async function DELETE(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  if (isDev) {
    // Local dev: derive filename from url and delete file
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      const filename = url.split("/").pop()!;
      await unlink(path.join(process.cwd(), "public", "gallery", filename));
    } catch { /* already gone */ }
    return NextResponse.json({ ok: true });
  }

  // Production: delete from blob store
  try { await del(url); } catch { /* blob may already be gone */ }
  return NextResponse.json({ ok: true });
}
