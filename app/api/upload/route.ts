import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/auth";
import { r2Put } from "@/lib/r2";

export async function POST(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Only allow image types
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 });
  }

  // 5MB limit
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const bytes = Buffer.from(await file.arrayBuffer());
  const blob = await r2Put(`class-images/${Date.now()}-${safeName}`, bytes, file.type);

  return NextResponse.json({ url: blob.url });
}
