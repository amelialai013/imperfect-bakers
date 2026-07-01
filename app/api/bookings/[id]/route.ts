import { NextResponse } from "next/server";
import { cancelBooking } from "@/lib/data";
import { checkAdminToken } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await cancelBooking(id);
  return NextResponse.json({ ok: true });
}
