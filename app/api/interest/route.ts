import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { checkAdminToken } from "@/lib/auth";
import { getTemplates, sub } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

const EXPERIENCE_LABELS: Record<string, string> = {
  complete_beginner: "Complete beginner",
  some_experience: "Some experience",
  confident_cook: "Confident cook",
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://imperfect-bakers.vercel.app";

// ── GET: list all registrations (admin only) ──────────────────────────────────

export async function GET(req: Request) {
  if (!checkAdminToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ids = (await kv.lrange("interests:all", 0, -1)) as string[];
  const entries = await Promise.all(ids.map((id) => kv.get(`interest:${id}`)));
  const valid = entries.filter(Boolean).reverse(); // newest first
  return NextResponse.json(valid);
}

// ── POST: new registration ────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const actionToken = crypto.randomUUID();
    const entry = {
      ...body,
      id,
      actionToken,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    // Save to KV
    await kv.set(`interest:${id}`, entry);
    await kv.rpush("interests:all", id);

    // Send emails + sheets — awaited so serverless function doesn't terminate before they fire
    const [adminResult, customerResult, sheetsResult] = await Promise.allSettled([
      sendAdminEmail(entry),
      sendCustomerEmail(entry),
      sendToSheets(entry),
    ]);
    if (adminResult.status === "rejected") console.error("sendAdminEmail failed:", adminResult.reason);
    if (customerResult.status === "rejected") console.error("sendCustomerEmail failed:", customerResult.reason);
    if (sheetsResult.status === "rejected") console.error("sendToSheets failed:", sheetsResult.reason);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Interest submission error:", err);
    return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
  }
}

// ── email helpers ─────────────────────────────────────────────────────────────

async function sendEmail(payload: {
  to: string[];
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Imperfect Bakers <onboarding@resend.dev>", reply_to: ["imperfectbakers@gmail.com"],
      ...payload,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
  return res.json();
}

async function sendAdminEmail(entry: Record<string, unknown>) {
  const { id, actionToken, name, email, phone, experience, classes, notes } = entry as {
    id: string; actionToken: string; name: string; email: string; phone: string;
    experience: string; classes: string[]; notes: string;
  };

  const classesText = Array.isArray(classes) && classes.length ? classes.join(", ") : "None selected";
  const expLabel = EXPERIENCE_LABELS[experience] ?? experience ?? "Not specified";

  const confirmUrl = `${BASE_URL}/api/interest/action?id=${id}&action=confirm&token=${actionToken}`;
  const declineUrl = `${BASE_URL}/api/interest/action?id=${id}&action=decline&token=${actionToken}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">New Interest Registration</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
      </div>
      <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280;width:140px">Name</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px;font-weight:500">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Email</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px"><a href="mailto:${email}" style="color:#006644">${email}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${phone}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Experience</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${expLabel}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Classes</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${classesText}</td></tr>
          <tr><td style="padding:10px 0;font-size:13px;color:#6b7280;vertical-align:top">Notes</td><td style="padding:10px 0;font-size:14px">${notes || "—"}</td></tr>
        </table>
      </div>
    </div>
  `;

  await sendEmail({
    to: ["imperfectbakers@gmail.com"],
    cc: ["amelai@deloitte.com.au"],
    subject: `New interest: ${name} — ${classesText}`,
    html,
  });
}

async function sendCustomerEmail(entry: Record<string, unknown>) {
  const { name, email, classes } = entry as { name: string; email: string; classes: string[] };
  const classesText = Array.isArray(classes) && classes.length ? classes.join(", ") : "your selected classes";

  const tmpl = (await getTemplates()).interest_received;
  const vars = { name, classes: classesText };

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">You're on the interest list! 🎉</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
      </div>
      <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
        <p style="font-size:16px;margin-bottom:16px">Hi ${name}! 👋</p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
          Thanks for registering your interest in <strong>${classesText}</strong>. We've got your details and will be in touch as soon as a relevant session opens up.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.next_steps, vars)}</p>
        <p style="font-size:14px;color:#6b7280;margin-bottom:4px">Warmly,</p><p style="font-size:14px;margin:0"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
        <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
          <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse our classes</a>
        </div>
      </div>
    </div>
  `;

  await sendEmail({ to: [email], subject: sub(tmpl.subject, vars), html });
}

async function sendToSheets(entry: Record<string, unknown>) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

// ── exported helpers (used by action route) ───────────────────────────────────

export { sendEmail, EXPERIENCE_LABELS };
