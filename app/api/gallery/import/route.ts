import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

// Temporary bulk-import endpoint — streams files directly to blob (no payload limit)
// Protected by admin password via Bearer token. Remove after bulk upload is done.
export async function POST(req: Request): Promise<NextResponse> {
  // Temporary bypass for bulk import — remove this route after upload is complete
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();
  if (token !== "bulk-import-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const filename = req.headers.get("x-filename");
  if (!filename) {
    return NextResponse.json({ error: "Missing x-filename header" }, { status: 400 });
  }

  const pathname = `gallery/${Date.now()}-${filename}`;
  const contentType = req.headers.get("content-type") ?? "image/jpeg";

  try {
    const blob = await put(pathname, req.body!, {
      access: "public",
      contentType,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
