import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { imageSize } from "image-size";
import { checkAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Reads pixel dimensions from the raw bytes without decoding the full image —
// stored so the gallery grid can size each tile correctly before the photo
// itself has loaded. Non-fatal if it fails (e.g. an unsupported format):
// the tile just falls back to a placeholder aspect ratio client-side.
function tryGetDims(bytes: Uint8Array): { width: number; height: number } | null {
  try {
    const { width, height } = imageSize(bytes);
    return { width, height };
  } catch {
    return null;
  }
}

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
  const dims = tryGetDims(bytes);

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Local dev: save to public/gallery/
    const { writeFile, mkdir } = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "public", "gallery");
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json({ id: filename, url: `/gallery/${filename}`, createdAt: new Date().toISOString(), ...dims });
  }

  // Production: upload directly to Vercel Blob using put() (works with OIDC auth)
  try {
    const pathname = `gallery/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const blob = await put(pathname, Buffer.from(bytes), { access: "public", contentType: file.type });
    if (dims) await kv.set(`gallery-dims:${blob.pathname}`, dims);
    return NextResponse.json({ id: blob.pathname, url: blob.url, createdAt: new Date().toISOString(), ...dims });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
