import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EXPERIENCE_LABELS: Record<string, string> = {
  complete_beginner: "Complete beginner",
  some_experience: "Some experience",
  confident_cook: "Confident cook",
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://imperfect-bakers.vercel.app";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json() as { status: "confirmed" | "declined" };

  if (!["confirmed", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const entry = await kv.get(`interest:${id}`) as Record<string, unknown> | null;
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = { ...entry, status, actionedAt: new Date().toISOString() };
  await kv.set(`interest:${id}`, updated);

  // Send customer email
  const { name, email, classes } = entry as { name: string; email: string; classes: string[] };
  const classesText = Array.isArray(classes) && classes.length ? classes.join(", ") : "your selected classes";

  try {
    await sendCustomerEmail(status, { name, email, classes: classesText });
  } catch (err) {
    console.error("Customer email failed after admin action:", err);
    // Return success — status was updated; log the email error
  }

  return NextResponse.json({ ok: true, status });
}

async function sendCustomerEmail(
  status: "confirmed" | "declined",
  { name, email, classes }: { name: string; email: string; classes: string }
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const isConfirm = status === "confirmed";

  const html = isConfirm
    ? `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">You're confirmed! 🎉</h1>
          <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
        </div>
        <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
          <p style="font-size:16px;margin-bottom:16px">Hi ${name}! 👋</p>
          <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
            We're so excited to have you join us at Imperfect Bakers! Your interest in <strong>${classes}</strong> has been confirmed.
          </p>
          <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">
            We'll be in touch soon with all the details — dates, what to bring, and everything else you need to know. Get ready for some messy, delicious fun! 🧁
          </p>
          <p style="font-size:14px;color:#6b7280">Can't wait to cook with you,<br><strong style="color:#006644">Chef Sarah & the Imperfect Bakers team</strong></p>
          <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
            <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse our classes</a>
          </div>
        </div>
      </div>
    `
    : `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <div style="background:#1a1a1a;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">Thanks for your interest</h1>
          <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
        </div>
        <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
          <p style="font-size:16px;margin-bottom:16px">Hi ${name},</p>
          <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
            Thank you so much for your interest in our <strong>${classes}</strong> class${classes.includes(",") ? "es" : ""}.
          </p>
          <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">
            Unfortunately we don't have availability that matches your preferences right now. We'd love to keep you on our radar and will reach out as soon as a relevant spot opens up!
          </p>
          <p style="font-size:14px;color:#6b7280">Warmly,<br><strong style="color:#006644">Chef Sarah & the Imperfect Bakers team</strong></p>
          <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
            <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse upcoming classes</a>
          </div>
        </div>
      </div>
    `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Imperfect Bakers <onboarding@resend.dev>",
      to: [email],
      subject: isConfirm ? "You're in! — Imperfect Bakers" : "Re: Your interest at Imperfect Bakers",
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
  return res.json();
}
