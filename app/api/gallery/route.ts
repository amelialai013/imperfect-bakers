import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";
import { checkAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export interface GalleryPhoto {
  id: string;
  url: string;
  createdAt: string;
}

const isDev = process.env.NODE_ENV === "development";

// ── GET: list all photos ──────────────────────────────────────────────────────
export async function GET() {
  if (isDev) {
    // Local dev: scan public/gallery/ folder directly
    try {
      const { readdir } = await import("fs/promises");
      const path = await import("path");
      const dir = path.join(process.cwd(), "public", "gallery");
      const files = await readdir(dir).catch(() => [] as string[]);
      const photos: GalleryPhoto[] = files
        .filter((f) => /\.(jpe?g|png|webp|gif|heic)$/i.test(f))
        .sort()
        .reverse()
        .map((f) => ({ id: f, url: `/gallery/${f}`, createdAt: "" }));
      return NextResponse.json(photos);
    } catch {
      return NextResponse.json([]);
    }
  }

  // Production: list blobs directly from the blob store (no KV needed)
  try {
    const { blobs } = await list({ prefix: "gallery/" });
    const photos: GalleryPhoto[] = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map((blob) => ({
        id: blob.pathname,
        url: blob.url,
        createdAt: blob.uploadedAt.toISOString(),
      }));
    return NextResponse.json(photos);
  } catch (e) {
    console.error("Gallery GET error:", e);
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
