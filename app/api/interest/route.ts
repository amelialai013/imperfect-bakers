import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const entry = { ...body, id, createdAt: new Date().toISOString() };
    await kv.set(`interest:${id}`, entry);
    await kv.rpush("interests:all", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Interest submission error:", err);
    return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
  }
}
