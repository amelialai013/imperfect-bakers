import { NextResponse } from "next/server";
import { getAllSessions, createSession } from "@/lib/data";
import { checkAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await getAllSessions();
  return NextResponse.json(sessions);
}

export async function POST(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const session = await createSession(body);
  return NextResponse.json(session, { status: 201 });
}
