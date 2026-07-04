import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export type ExperienceLevel = { value: string; label: string };

export const DEFAULT_EXPERIENCE_LEVELS: ExperienceLevel[] = [
  { value: "beginner", label: "New to cooking — please guide me through everything" },
  { value: "intermediate", label: "Some experience — happy to receive tips along the way" },
  { value: "expert", label: "Confident cook — only step in if I ask" },
];

export type SiteSettings = {
  experienceLevels: ExperienceLevel[];
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const stored = await kv.get<SiteSettings>("site-settings");
    if (stored?.experienceLevels?.length) return stored;
  } catch { /* fall back to defaults */ }
  return { experienceLevels: DEFAULT_EXPERIENCE_LEVELS };
}

// Public GET — no auth required (booking form reads this)
export async function GET() {
  return NextResponse.json(await getSettings());
}

// Admin PATCH — auth required
export async function PATCH(req: Request) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const updates = await req.json() as Partial<SiteSettings>;
  const existing = await getSettings();
  const merged: SiteSettings = { ...existing, ...updates };
  await kv.set("site-settings", merged);
  return NextResponse.json({ ok: true });
}
