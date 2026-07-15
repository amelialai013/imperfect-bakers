// One-time migration: moves gallery photos from Vercel Blob to Cloudflare R2.
// Downloads each original from the old Vercel Blob store, computes its real
// (EXIF-aware) dimensions + blur preview + thumbnail via the same logic as
// lib/image.ts, uploads the original and thumbnail to R2 under the SAME
// pathname, and points gallery-dims:<pathname> in KV at the new R2 URLs.
// Keeping the same pathname means the KV key doesn't change — only the
// blob/thumbUrl values do.
//
// Currently blocked: Vercel's Blob store is returning 403 "Your store is
// blocked" on public reads (see conversation), so the fetch(blob.url) below
// will fail until that's resolved. Safe to re-run — skips anything already
// present in R2 under the same pathname.
//
// Run with: node --env-file=.env.local scripts/migrate-to-r2.mjs
import { list as blobList } from "@vercel/blob";
import { kv } from "@vercel/kv";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function existsInR2(key) {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function putR2(key, body, contentType) {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return `${PUBLIC_URL}/${key}`;
}

const { blobs } = await blobList({ prefix: "gallery/" });
console.log(`Found ${blobs.length} blob(s) in Vercel Blob.`);

let migrated = 0;
let skipped = 0;
let failed = 0;

for (const blob of blobs) {
  if (await existsInR2(blob.pathname)) {
    skipped++;
    continue;
  }
  try {
    const res = await fetch(blob.url);
    if (!res.ok) throw new Error(`fetch ${res.status}: ${await res.text()}`);
    const bytes = new Uint8Array(await res.arrayBuffer());

    const meta = await sharp(bytes).metadata();
    if (!meta.width || !meta.height) throw new Error("no dimensions in metadata");
    const rotated = meta.orientation != null && meta.orientation >= 5;
    const width = rotated ? meta.height : meta.width;
    const height = rotated ? meta.width : meta.height;

    const blurBuf = await sharp(bytes).rotate().resize(20).jpeg({ quality: 50 }).toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
    const thumbBuf = await sharp(bytes).rotate().resize(800).jpeg({ quality: 78 }).toBuffer();

    await putR2(blob.pathname, Buffer.from(bytes), blob.contentType ?? "image/jpeg");
    const thumbKey = `gallery-thumbs/${blob.pathname.split("/").pop()}`;
    const thumbUrl = await putR2(thumbKey, thumbBuf, "image/jpeg");

    await kv.set(`gallery-dims:${blob.pathname}`, { width, height, blurDataURL, thumbUrl });
    migrated++;
    console.log(`  ${blob.pathname} -> R2 (${width}x${height}, thumb ${thumbBuf.length}b)`);
  } catch (e) {
    failed++;
    console.error(`  FAILED ${blob.pathname}:`, e.message);
  }
}

console.log(`Done. migrated=${migrated} skipped=${skipped} failed=${failed}`);
if (failed > 0) {
  console.log(`\n${failed} failed — if these are all "Your store is blocked", Vercel Blob's public reads are still blocked. Safe to re-run this script once that clears.`);
}
