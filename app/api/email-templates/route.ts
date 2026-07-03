import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";
import { DEFAULT_TEMPLATES, getTemplates } from "@/lib/email-templates";
import type { EmailTemplates } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getTemplates());
}

export async function PATCH(req: Request) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updates = await req.json() as Partial<EmailTemplates>;
  const existing = await kv.get<Partial<EmailTemplates>>("email-templates") ?? {};
  // Deep merge per template key
  const merged: Partial<EmailTemplates> = { ...existing };
  for (const key of Object.keys(updates) as (keyof EmailTemplates)[]) {
    (merged as Record<string, unknown>)[key] = {
      ...(DEFAULT_TEMPLATES[key] as Record<string, unknown>),
      ...((existing as Record<string, unknown>)[key] ?? {}),
      ...((updates as Record<string, unknown>)[key] ?? {}),
    };
  }
  await kv.set("email-templates", merged);
  return NextResponse.json({ ok: true });
}
