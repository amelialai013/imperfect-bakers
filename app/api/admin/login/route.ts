import { NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (await isRateLimited("admin-login", req, 5, 15 * 60)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  return NextResponse.json({ token: password });
}
