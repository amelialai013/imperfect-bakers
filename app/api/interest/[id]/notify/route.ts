import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";
import { getTemplates, sub } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.imperfectbakers.com";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const entry = await kv.get(`interest:${id}`) as Record<string, unknown> | null;
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Stamp the entry so admin UI can show "Notified" badge
  await kv.set(`interest:${id}`, { ...entry, availabilityNotifiedAt: new Date().toISOString() });

  const { name, email, classes } = entry as { name: string; email: string; classes: string[] };
  const classesText = Array.isArray(classes) && classes.length ? classes.join(", ") : "your selected classes";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Email not configured" }, { status: 500 });

  const tmpl = (await getTemplates()).interest_classes_available;
  const vars = { name, classes: classesText };

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">Classes are now available! 🎉</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
      </div>
      <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
        <p style="font-size:16px;margin-bottom:16px">Hi ${name}! 👋</p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
          Great news — sessions are now available for <strong>${classesText}</strong>, the class${Array.isArray(classes) && classes.length > 1 ? "es" : ""} you registered interest in!
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">${sub(tmpl.body, vars)}</p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.cta, vars)}</p>
        <p style="font-size:14px;color:#6b7280;margin-bottom:12px">Warmly,</p>
        <p style="font-size:14px;margin:0"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
        <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
          <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Book a class</a>
        </div>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Imperfect Bakers <hello@imperfectbakers.com>",
      reply_to: ["imperfectbakers@gmail.com"],
      to: [email],
      subject: sub(tmpl.subject, vars),
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }

  return NextResponse.json({ ok: true });
}
