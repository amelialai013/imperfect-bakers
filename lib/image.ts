import sharp from "sharp";

export interface PhotoAssets {
  width: number;
  height: number;
  blurDataURL?: string;
  thumbBuffer?: Buffer;
}

// Reads a photo's true displayed dimensions plus generates its derivative
// assets (blur preview, resized thumbnail) — all EXIF-orientation-aware.
//
// Camera JPEGs often carry an EXIF orientation tag (e.g. "rotate 90°") rather
// than storing pixels pre-rotated. Browsers respect that tag when rendering
// an <img>, but sharp's raw metadata() reports the UN-rotated pixel
// dimensions — so for a portrait photo shot with the camera turned
// sideways, metadata() said "6000x4000" while every browser actually
// displays it as 4000x6000. Storing the un-rotated dimensions meant the
// gallery grid sized tiles for the wrong shape, and object-cover cropped
// the (correctly-rotated) photo to fit.
//
// The derivatives need `.rotate()` (sharp auto-orients from EXIF and then
// strips the tag) applied explicitly too — resizing/re-encoding doesn't
// itself fix orientation, and relying on every consumer to respect an EXIF
// tag on a re-encoded JPEG (especially a data: URI) is less reliable than
// just physically rotating the pixels once, here.
export async function getPhotoAssets(bytes: Uint8Array): Promise<PhotoAssets | null> {
  let meta;
  try {
    meta = await sharp(bytes).metadata();
  } catch {
    return null;
  }
  if (!meta.width || !meta.height) return null;

  // EXIF orientation 5-8 means a 90-or-270-degree rotation is needed to
  // display correctly, which swaps which raw dimension is "width".
  const rotated = meta.orientation != null && meta.orientation >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  let blurDataURL: string | undefined;
  try {
    const blurBuf = await sharp(bytes).rotate().resize(20).jpeg({ quality: 50 }).toBuffer();
    blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
  } catch { /* blur is a nice-to-have — dims alone are still useful */ }

  let thumbBuffer: Buffer | undefined;
  try {
    thumbBuffer = await sharp(bytes).rotate().resize(800).jpeg({ quality: 78 }).toBuffer();
  } catch { /* thumbnail is a nice-to-have — grid falls back to the original */ }

  return { width, height, blurDataURL, thumbBuffer };
}
