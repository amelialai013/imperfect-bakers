import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { GalleryPhoto } from "../route";

export const dynamic = "force-dynamic";

// POST — called twice by the client upload flow:
//   1. { type: "blob.generate-client-token" } → returns a short-lived upload token
//   2. { type: "blob.upload-completed" }     → saves metadata to KV
export async function POST(req: Request) {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // clientPayload contains the admin token sent from the browser
        const expected = process.env.ADMIN_PASSWORD ?? "";
        if (!expected || clientPayload !== expected) {
          throw new Error("Unauthorized");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"],
          maximumSizeInBytes: 20 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Fires after the browser finishes uploading directly to blob storage
        const id = crypto.randomUUID();
        const photo: GalleryPhoto = { id, url: blob.url, createdAt: new Date().toISOString() };
        await kv.set(`gallery:${id}`, photo);
        await kv.rpush("gallery:all", id);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}
