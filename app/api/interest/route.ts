import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

const EXPERIENCE_LABELS: Record<string, string> = {
  complete_beginner: "Complete beginner",
  some_experience: "Some experience",
  confident_cook: "Confident cook",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = crypto.randomUUID();
    const entry = { ...body, id, createdAt: new Date().toISOString() };

    // Save to KV
    await kv.set(`interest:${id}`, entry);
    await kv.rpush("interests:all", id);

    // Fire email + sheets in parallel — don't fail the response if they error
    const [emailResult, sheetsResult] = await Promise.allSettled([
      sendEmail(entry),
      sendToSheets(entry),
    ]);
    if (emailResult.status === "rejected") console.error("sendEmail failed:", emailResult.reason);
    if (sheetsResult.status === "rejected") console.error("sendToSheets failed:", sheetsResult.reason);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Interest submission error:", err);
    return NextResponse.json({ error: "Failed to save. Please try again." }, { status: 500 });
  }
}

async function sendEmail(entry: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const { name, email, phone, experience, classes, notes } = entry as {
    name: string; email: string; phone: string;
    experience: string; classes: string[]; notes: string;
  };

  const classesText = Array.isArray(classes) && classes.length
    ? classes.join(", ")
    : "None selected";

  const experienceLabel = EXPERIENCE_LABELS[experience] ?? experience ?? "Not specified";

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
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Experience</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${experienceLabel}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Classes</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${classesText}</td></tr>
          <tr><td style="padding:10px 0;font-size:13px;color:#6b7280;vertical-align:top">Notes</td><td style="padding:10px 0;font-size:14px">${notes || "—"}</td></tr>
        </table>
      </div>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Imperfect Bakers <onboarding@resend.dev>",
      to: ["imperfectbakers@gmail.com"],
      subject: `New interest registration — ${name}`,
      html,
    }),
  });
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
