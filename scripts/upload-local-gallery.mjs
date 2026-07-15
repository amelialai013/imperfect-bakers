// Uploads every image in "New photos/" straight to R2 using the same
// EXIF-aware dimensions + blur preview + thumbnail pipeline as the real
// upload route (mirrors lib/image.ts — see that file for why orientation
// needs handling explicitly). This is how the new gallery set replaces the
// old one: no dependency on the (currently blocked) Vercel Blob store at
// all, since these files are already local.
// Run with: node --env-file=.env.local scripts/upload-local-gallery.mjs
import { readdir, readFile } from "fs/promises";
import path from "path";
import { kv } from "@vercel/kv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
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

async function putR2(key, body, contentType) {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return `${PUBLIC_URL}/${key}`;
}

const dir = path.join(process.cwd(), "New photos");
const files = (await readdir(dir))
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();
console.log(`Found ${files.length} photo(s) in "New photos/".`);

let uploaded = 0;
let failed = 0;

for (const filename of files) {
  try {
    const bytes = await readFile(path.join(dir, filename));

    const meta = await sharp(bytes).metadata();
    if (!meta.width || !meta.height) throw new Error("no dimensions in metadata");
    const rotated = meta.orientation != null && meta.orientation >= 5;
    const width = rotated ? meta.height : meta.width;
    const height = rotated ? meta.width : meta.height;

    const blurBuf = await sharp(bytes).rotate().resize(20).jpeg({ quality: 50 }).toBuffer();
    const blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
    const thumbBuf = await sharp(bytes).rotate().resize(800).jpeg({ quality: 78 }).toBuffer();

    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `gallery/${Date.now()}-${safeName}`;
    await putR2(pathname, bytes, "image/jpeg");
    const thumbUrl = await putR2(`gallery-thumbs/${Date.now()}-${safeName}`, thumbBuf, "image/jpeg");

    await kv.set(`gallery-dims:${pathname}`, { width, height, blurDataURL, thumbUrl });
    uploaded++;
    console.log(`  ${filename} -> ${pathname} (${width}x${height}, thumb ${thumbBuf.length}b)`);

    // Stagger pathnames so createdAt ordering (based on Date.now() in the
    // pathname/KV) doesn't collide when files upload faster than 1ms apart.
    await new Promise((r) => setTimeout(r, 2));
  } catch (e) {
    failed++;
    console.error(`  FAILED ${filename}:`, e.message);
  }
}

console.log(`Done. uploaded=${uploaded} failed=${failed}`);
