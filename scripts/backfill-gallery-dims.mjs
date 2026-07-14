// One-time backfill: computes and stores pixel dimensions (EXIF-orientation-
// aware — see lib/image.ts, whose logic this mirrors since a plain node
// script can't use the "@/" TS path alias), a tiny blurred preview, and a
// resized (~800px) thumbnail blob in KV for gallery photos uploaded before
// this tracking existed. Safe to re-run — skips anything that already has
// a thumbUrl, only ever writes gallery-dims:* keys and gallery-thumbs/*
// blobs, never touches anything else.
// Run with: node --env-file=.env.local scripts/backfill-gallery-dims.mjs
import { list, put } from "@vercel/blob";
import { kv } from "@vercel/kv";
import sharp from "sharp";

const { blobs } = await list({ prefix: "gallery/" });
console.log(`Found ${blobs.length} blob(s).`);

let updated = 0;
let skipped = 0;
let failed = 0;

for (const blob of blobs) {
  const key = `gallery-dims:${blob.pathname}`;
  const existing = await kv.get(key);
  if (existing?.blurDataURL && existing?.thumbUrl) {
    skipped++;
    continue;
  }
  try {
    const res = await fetch(blob.url);
    if (!res.ok) throw new Error(`fetch ${res.status}: ${await res.text()}`);
    const bytes = new Uint8Array(await res.arrayBuffer());

    const meta = await sharp(bytes).metadata();
    if (!meta.width || !meta.height) throw new Error("no dimensions in metadata");
    // EXIF orientation 5-8 means a 90-or-270-degree rotation is needed to
    // display correctly, which swaps which raw dimension is "width" — see
    // lib/image.ts for the full explanation.
    const rotated = meta.orientation != null && meta.orientation >= 5;
    const width = rotated ? meta.height : meta.width;
    const height = rotated ? meta.width : meta.height;

    const blurBuf = await sharp(bytes).rotate().resize(20).jpeg({ quality: 50 }).toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
    const thumbBuf = await sharp(bytes).rotate().resize(800).jpeg({ quality: 78 }).toBuffer();
    const thumbBlob = await put(`gallery-thumbs/${blob.pathname.split("/").pop()}`, thumbBuf, {
      access: "public",
      contentType: "image/jpeg",
    });
    await kv.set(key, { width, height, blurDataURL, thumbUrl: thumbBlob.url });
    updated++;
    console.log(`  ${blob.pathname} -> ${width}x${height}, blur ${blurBuf.length}b, thumb ${thumbBuf.length}b`);
  } catch (e) {
    failed++;
    console.error(`  FAILED ${blob.pathname}:`, e.message);
  }
}

console.log(`Done. updated=${updated} skipped=${skipped} failed=${failed}`);
