import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";
import { getPhotoAssets } from "@/lib/image";

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

  const isDev = process.env.NODE_ENV === "development";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  if (isDev) {
    // Local dev: save the original to public/gallery/ and the thumbnail
    // (if generated) alongside it under public/gallery/thumbs/.
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "public", "gallery");
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}-${safeName}`;
    await writeFile(path.join(dir, filename), bytes);
    let thumbUrl: string | undefined;
    if (thumbBuffer) {
      const thumbDir = path.join(dir, "thumbs");
      await mkdir(thumbDir, { recursive: true });
      await writeFile(path.join(thumbDir, filename), thumbBuffer);
      thumbUrl = `/gallery/thumbs/${filename}`;
    }
    return NextResponse.json({ id: filename, url: `/gallery/${filename}`, createdAt: new Date().toISOString(), ...dims, thumbUrl });
  }

  // Production: upload the original and (if generated) the thumbnail directly
  // to Vercel Blob using put() (works with OIDC auth).
  try {
    const pathname = `gallery/${Date.now()}-${safeName}`;
    const blob = await put(pathname, Buffer.from(bytes), { access: "public", contentType: file.type });
    let thumbUrl: string | undefined;
    if (thumbBuffer) {
      const thumbBlob = await put(`gallery-thumbs/${Date.now()}-${safeName}`, thumbBuffer, {
        access: "public",
        contentType: "image/jpeg",
      });
      thumbUrl = thumbBlob.url;
    }
    await kv.set(`gallery-dims:${blob.pathname}`, { ...dims, thumbUrl });
    return NextResponse.json({ id: blob.pathname, url: blob.url, createdAt: new Date().toISOString(), ...dims, thumbUrl });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
