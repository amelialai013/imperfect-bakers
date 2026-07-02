import { NextResponse } from "next/server";
import { getClassConfigs, saveClassConfig, deleteClassConfig, restoreClassConfig } from "@/lib/data";
import { checkAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const configs = await getClassConfigs();
  return NextResponse.json(configs);
}

export async function POST(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const config = await saveClassConfig(body);
  return NextResponse.json(config);
}

export async function DELETE(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { key, restore } = await req.json();
  if (restore) {
    await restoreClassConfig(key);
  } else {
    await deleteClassConfig(key);
  }
  return NextResponse.json({ ok: true });
}
