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
  { quote: "Such a wonderful experience — warm, fun, and I walked away with skills I actually use at home.", name: "Emily T.", role: "Sweet Food" },
];

export type PolicyItem = { highlight: string; text: string };
export type PolicySection = { title: string; body?: string; items?: PolicyItem[] };

export const DEFAULT_POLICY_SECTIONS: PolicySection[] = [
  { title: "Who can enrol?", body: "Due to insurance requirements, all participants must be over the age of 18." },
  { title: "Pricing", body: "Current pricing does not reflect future pricing. However, once booked and paid, your price is locked in — no changes will be made." },
  { title: "Confirmation of booking", body: "A confirmation email will be sent before your class begins. Please note — your booking is not confirmed until payment has been received." },
  { title: "Transfers, cancellations & refunds", items: [
    { highlight: "5+ business days before class", text: "Full refund or free transfer to another class — no questions asked." },
    { highlight: "Less than 5 business days", text: "Refunds are not guaranteed. Please get in touch and we'll do our best to help." },
  ]},
  { title: "If we cancel a class", body: "If a class doesn't reach minimum numbers, we may need to cancel it. We'll let you know at least 48 hours in advance and give you the choice of a full refund or a transfer to another session." },
  { title: "What to wear", body: "We recommend closed-toe, soft-soled, flat shoes — comfort over style in the kitchen." },
  { title: "Communications", body: "By booking a class, you agree to receive emails related to your booking. We won't spam you — just the important stuff." },
];

export type SiteSettings = {
  experienceLevels: ExperienceLevel[];
  testimonials?: Testimonial[];
  footerTagline?: string;
  footerSocialBlurb?: string;
  policySections?: PolicySection[];
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
