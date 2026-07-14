// One-time backfill: computes and stores pixel dimensions + a tiny blurred
// preview in KV for gallery photos uploaded before this tracking existed.
// Safe to re-run — only ever writes gallery-dims:* keys, and skips anything
// that already has both fields, never touches anything else in KV.
// Run with: node --env-file=.env.local scripts/backfill-gallery-dims.mjs
import { list } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { imageSize } from "image-size";
import sharp from "sharp";

const { blobs } = await list({ prefix: "gallery/" });
console.log(`Found ${blobs.length} blob(s).`);

let updated = 0;
let skipped = 0;
let failed = 0;

for (const blob of blobs) {
  const key = `gallery-dims:${blob.pathname}`;
  const existing = await kv.get(key);
  if (existing?.blurDataURL) {
    skipped++;
    continue;
  }
  try {
    const res = await fetch(blob.url);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const { width, height } = imageSize(bytes);
    const blurBuf = await sharp(bytes).resize(20).jpeg({ quality: 50 }).toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
    await kv.set(key, { width, height, blurDataURL });
    updated++;
    console.log(`  ${blob.pathname} -> ${width}x${height}, blur ${blurBuf.length}b`);
  } catch (e) {
    failed++;
    console.error(`  FAILED ${blob.pathname}:`, e.message);
  }
}

console.log(`Done. updated=${updated} skipped=${skipped} failed=${failed}`);
