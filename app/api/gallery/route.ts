import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";
import { getPhotoAssets } from "@/lib/image";

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
      ...(dims[i]
        ? { width: dims[i].width, height: dims[i].height, blurDataURL: dims[i].blurDataURL, thumbUrl: dims[i].thumbUrl }
        : {}),
    }));
    return NextResponse.json(photos);
  } catch {
    // Fallback: local dev without cloud credentials — scan public/gallery/
    if (isDev) {
      try {
        const { readdir, readFile, writeFile, mkdir, access } = await import("fs/promises");
        const path = await import("path");
        const dir = path.join(process.cwd(), "public", "gallery");
        const thumbDir = path.join(dir, "thumbs");
        await mkdir(thumbDir, { recursive: true });
        const files = await readdir(dir).catch(() => [] as string[]);
        const names = files.filter((f) => /\.(jpe?g|png|webp|gif|heic)$/i.test(f)).sort().reverse();
        const photos: GalleryPhoto[] = await Promise.all(
          names.map(async (f) => {
            let dims: Dims | undefined;
            try {
              const bytes = await readFile(path.join(dir, f));
              const assets = await getPhotoAssets(bytes);
              if (assets) {
                const { thumbBuffer, ...rest } = assets;
                const thumbPath = path.join(thumbDir, f);
                const thumbExists = await access(thumbPath).then(() => true).catch(() => false);
                if (thumbBuffer && !thumbExists) await writeFile(thumbPath, thumbBuffer);
                dims = { ...rest, thumbUrl: `/gallery/thumbs/${f}` };
              }
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
  const { url, id } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  if (isDev) {
    // Local dev: derive filename from url and delete the original plus its thumbnail
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      const filename = url.split("/").pop()!;
      await unlink(path.join(process.cwd(), "public", "gallery", filename));
      await unlink(path.join(process.cwd(), "public", "gallery", "thumbs", filename)).catch(() => {});
    } catch { /* already gone */ }
    return NextResponse.json({ ok: true });
  }

  // Production: delete the original, its thumbnail blob, and its KV metadata.
  // `id` is the blob's pathname (e.g. "gallery/172...-photo.jpg") — used both
  // as the KV key and to derive the thumbnail's pathname under gallery-thumbs/.
  try { await del(url); } catch { /* blob may already be gone */ }
  if (id) {
    const dims = await kv.get<Dims>(`gallery-dims:${id}`).catch(() => null);
    if (dims?.thumbUrl) {
      await del(dims.thumbUrl).catch(() => {});
    }
    await kv.del(`gallery-dims:${id}`).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
