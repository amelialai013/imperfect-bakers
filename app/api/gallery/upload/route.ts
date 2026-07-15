import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";
import { getPhotoAssets } from "@/lib/image";
import { r2Put } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<NextResponse> {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Not an image" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const assets = await getPhotoAssets(bytes);
  const { thumbBuffer, ...dims } = assets ?? {};
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  try {
    const pathname = `gallery/${Date.now()}-${safeName}`;
    const blob = await r2Put(pathname, Buffer.from(bytes), file.type);
    let thumbUrl: string | undefined;
    if (thumbBuffer) {
      const thumbBlob = await r2Put(`gallery-thumbs/${Date.now()}-${safeName}`, thumbBuffer, "image/jpeg");
      thumbUrl = thumbBlob.url;
    }
    await kv.set(`gallery-dims:${blob.pathname}`, { ...dims, thumbUrl });
    return NextResponse.json({ id: blob.pathname, url: blob.url, createdAt: new Date().toISOString(), ...dims, thumbUrl });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
