import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { del } from "@vercel/blob";
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
    // Local dev: scan public/gallery/ folder directly (no KV needed)
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

  // Production: read from KV
  try {
    const ids = (await kv.lrange("gallery:all", 0, -1)) as string[];
    if (!ids.length) return NextResponse.json([]);
    const photos = await Promise.all(ids.map((id) => kv.get<GalleryPhoto>(`gallery:${id}`)));
    return NextResponse.json(photos.filter(Boolean).reverse());
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
  const { id, url } = await req.json();
  if (!id || !url) {
    return NextResponse.json({ error: "Missing id or url" }, { status: 400 });
  }

  if (isDev) {
    // Local dev: delete file from public/gallery/
    try {
      const { unlink } = await import("fs/promises");
      const path = await import("path");
      await unlink(path.join(process.cwd(), "public", "gallery", id));
    } catch { /* already gone */ }
    return NextResponse.json({ ok: true });
  }

  // Production: delete from blob + KV
  try { await del(url); } catch { /* blob may already be gone */ }
  await kv.lrem("gallery:all", 0, id);
  await kv.del(`gallery:${id}`);

  return NextResponse.json({ ok: true });
}
