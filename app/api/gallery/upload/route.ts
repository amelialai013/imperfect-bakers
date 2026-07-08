import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { put } from "@vercel/blob";
import { checkAdminToken } from "@/lib/auth";
import type { GalleryPhoto } from "../route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });

  const blob = await put(`gallery/${Date.now()}-${file.name}`, file, { access: "public" });

  const id = crypto.randomUUID();
  const photo: GalleryPhoto = { id, url: blob.url, createdAt: new Date().toISOString() };
  await kv.set(`gallery:${id}`, photo);
  await kv.rpush("gallery:all", id);

  return NextResponse.json(photo);
}
