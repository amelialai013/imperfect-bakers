import { list } from "@vercel/blob";
import { kv } from "@vercel/kv";

export async function GET() {
  const { blobs } = await list({ prefix: "gallery/", limit: 100 });
  const results = [];
  for (const blob of blobs) {
    const id = crypto.randomUUID();
    const photo = { id, url: blob.url, createdAt: blob.uploadedAt.toISOString() };
    await kv.set(`gallery:${id}`, photo);
    await kv.rpush("gallery:all", id);
    results.push(photo);
  }
  return Response.json({ recovered: results.length, photos: results });
}
