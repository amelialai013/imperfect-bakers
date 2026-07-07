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

export type Testimonial = { quote: string; name: string; role: string };

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { quote: "My daughter came home beaming and immediately wanted to cook dinner. She's never been so excited about food before. Absolutely incredible experience.", name: "Sarah M.", role: "Knife Skills" },
  { quote: "I always thought I was terrible at cooking. After just two classes, I made a three-course meal for my family. The confidence boost is real.", name: "James R.", role: "Savoury Food" },
  { quote: "The random kitchen fun class was a total game-changer. My son taught me how to make pasta from scratch. I'll never forget his little face.", name: "Laura K.", role: "Random Kitchen Fun" },
];

export type SiteSettings = {
  experienceLevels: ExperienceLevel[];
  testimonials?: Testimonial[];
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
