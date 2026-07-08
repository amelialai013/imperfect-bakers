import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { put } from "@vercel/blob";
import { checkAdminToken } from "@/lib/auth";
import type { GalleryPhoto } from "../route";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    return NextResponse.json({ error: `Failed to parse form: ${e}` }, { status: 400 });
  }

  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });

  let blob: { url: string };
  try {
    blob = await put(`gallery/${Date.now()}-${file.name}`, file, { access: "public" });
  } catch (e) {
    return NextResponse.json({ error: `Blob upload failed: ${e}` }, { status: 500 });
  }

  const id = crypto.randomUUID();
  const photo: GalleryPhoto = { id, url: blob.url, createdAt: new Date().toISOString() };
  await kv.set(`gallery:${id}`, photo);
  await kv.rpush("gallery:all", id);

  return NextResponse.json(photo);
}
