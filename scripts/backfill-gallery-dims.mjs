// One-time backfill: computes and stores pixel dimensions in KV for gallery
// photos uploaded before dimension tracking existed. Safe to re-run — it
// only ever writes gallery-dims:* keys, never touches anything else in KV.
// Run with: node --env-file=.env.local scripts/backfill-gallery-dims.mjs
import { list } from "@vercel/blob";
import { kv } from "@vercel/kv";
import { imageSize } from "image-size";

const { blobs } = await list({ prefix: "gallery/" });
console.log(`Found ${blobs.length} blob(s).`);

let updated = 0;
let skipped = 0;
let failed = 0;

for (const blob of blobs) {
  const key = `gallery-dims:${blob.pathname}`;
  const existing = await kv.get(key);
  if (existing) {
    skipped++;
    continue;
  }
  try {
    const res = await fetch(blob.url);
    const bytes = new Uint8Array(await res.arrayBuffer());
    const { width, height } = imageSize(bytes);
    await kv.set(key, { width, height });
    updated++;
    console.log(`  ${blob.pathname} -> ${width}x${height}`);
  } catch (e) {
    failed++;
    console.error(`  FAILED ${blob.pathname}:`, e.message);
  }
}

console.log(`Done. updated=${updated} skipped=${skipped} failed=${failed}`);
