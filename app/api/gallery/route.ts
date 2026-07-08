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

// ── GET: list all photos (public) ─────────────────────────────────────────────
export async function GET() {
  try {
    const ids = (await kv.lrange("gallery:all", 0, -1)) as string[];
    if (!ids.length) return NextResponse.json([]);
    const photos = await Promise.all(ids.map((id) => kv.get<GalleryPhoto>(`gallery:${id}`)));
    return NextResponse.json(photos.filter(Boolean).reverse()); // newest first
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

  // Delete from blob storage
  try { await del(url); } catch { /* blob may already be gone */ }

  // Remove from KV
  await kv.lrem("gallery:all", 0, id);
  await kv.del(`gallery:${id}`);

  return NextResponse.json({ ok: true });
}
