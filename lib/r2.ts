import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-API-compatible, so the AWS SDK works against it as-is
// with a custom endpoint. This module mirrors the shape of the @vercel/blob
// functions it replaces (put/list/del) so the call sites barely change.
const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface R2Object {
  pathname: string;
  url: string;
  uploadedAt: Date;
}

export async function r2Put(
  pathname: string,
  body: Buffer,
  contentType: string
): Promise<{ pathname: string; url: string }> {
  await client.send(
    new PutObjectCommand({ Bucket: BUCKET, Key: pathname, Body: body, ContentType: contentType })
  );
  return { pathname, url: `${PUBLIC_URL}/${pathname}` };
}

export async function r2List(prefix: string): Promise<R2Object[]> {
  const objects: R2Object[] = [];
  let continuationToken: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix, ContinuationToken: continuationToken })
    );
    for (const obj of res.Contents ?? []) {
      if (!obj.Key) continue;
      objects.push({
        pathname: obj.Key,
        url: `${PUBLIC_URL}/${obj.Key}`,
        uploadedAt: obj.LastModified ?? new Date(0),
      });
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);
  return objects;
}

// Accepts either a bare pathname ("gallery/foo.jpg") or a full public URL
// (R2_PUBLIC_URL + "/gallery/foo.jpg", as stored in GalleryPhoto.url) and
// deletes the corresponding object.
export async function r2Del(pathnameOrUrl: string): Promise<void> {
  const pathname = pathnameOrUrl.startsWith(PUBLIC_URL)
    ? pathnameOrUrl.slice(PUBLIC_URL.length).replace(/^\//, "")
    : pathnameOrUrl;
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: pathname }));
}
