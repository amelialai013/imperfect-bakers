import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    BLOB_STORE_ID: process.env.BLOB_STORE_ID ? "set" : "missing",
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? "set" : "missing",
    VERCEL_OIDC_TOKEN: process.env.VERCEL_OIDC_TOKEN
      ? "set (len=" + process.env.VERCEL_OIDC_TOKEN.length + ")"
      : "missing",
    ADMIN_PASSWORD_LEN: process.env.ADMIN_PASSWORD?.length ?? 0,
    ADMIN_PASSWORD_FIRST3: process.env.ADMIN_PASSWORD?.substring(0, 3) ?? "missing",
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  let blobTest = "not tried";
  try {
    const result = await list({ prefix: "gallery/", limit: 1 });
    blobTest = `ok: ${result.blobs.length} blobs found`;
  } catch (e) {
    blobTest = `error: ${String(e)}`;
  }

  return NextResponse.json({ env, blobTest });
}
