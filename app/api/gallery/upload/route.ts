import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { checkAdminToken } from "@/lib/auth";
import type { GalleryPhoto } from "../route";

export const dynamic = "force-dynamic";

// ── LOCAL DEV: multipart form upload → save to public/gallery/ ──────────────
async function handleLocalUpload(req: Request): Promise<NextResponse> {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Not an image" }, { status: 400 });

  const { writeFile, mkdir } = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "public", "gallery");
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, filename), Buffer.from(bytes));

  const url = `/gallery/${filename}`;
  return NextResponse.json({ id: filename, url, createdAt: new Date().toISOString() });
}

// ── PRODUCTION: client-side blob token generation ────────────────────────────
async function handleBlobUpload(req: Request): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const expected = process.env.ADMIN_PASSWORD ?? "";
        if (!expected || clientPayload !== expected) throw new Error("Unauthorized");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"],
          maximumSizeInBytes: 20 * 1024 * 1024,
        };
      },
      // NOTE: onUploadCompleted is unreliable — KV registration is done
      // client-side via PUT /api/gallery/upload after upload() resolves.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

// ── PUT: register a completed blob upload into KV (called from client) ───────
export async function PUT(req: Request): Promise<NextResponse> {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const id = crypto.randomUUID();
  const photo: GalleryPhoto = { id, url, createdAt: new Date().toISOString() };
  try {
    await kv.set(`gallery:${id}`, photo);
    await kv.rpush("gallery:all", id);
  } catch (e) {
    return NextResponse.json({ error: `KV save failed: ${e}` }, { status: 500 });
  }
  return NextResponse.json(photo);
}

export async function POST(req: Request): Promise<NextResponse> {
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    return handleLocalUpload(req);
  }
  return handleBlobUpload(req);
}
