import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

const EXPERIENCE_LABELS: Record<string, string> = {
  complete_beginner: "Complete beginner",
  some_experience: "Some experience",
  confident_cook: "Confident cook",
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://imperfect-bakers.vercel.app";

function htmlPage(title: string, emoji: string, heading: string, body: string, color: string) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title} — Imperfect Bakers</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#faf9f6;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
    .card{background:#fff;border:1px solid #e4dfd5;border-radius:16px;padding:48px 40px;max-width:440px;width:100%;text-align:center}
    .emoji{font-size:48px;margin-bottom:20px}
    h1{font-size:24px;font-weight:600;color:#1a1a1a;margin-bottom:12px}
    p{font-size:15px;color:#6b7280;line-height:1.6;margin-bottom:24px}
    a{display:inline-block;padding:12px 28px;background:${color};color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600}</style>
    </head><body><div class="card"><div class="emoji">${emoji}</div><h1>${heading}</h1><p>${body}</p>
    <a href="${BASE_URL}/admin">Back to dashboard</a></div></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  const token = searchParams.get("token");

  if (!id || !action || !token || !["confirm", "decline"].includes(action)) {
    return htmlPage("Invalid link", "⚠️", "Invalid link", "This link is missing required parameters.", "#6b7280");
  }

  // Load the interest entry
  const entry = await kv.get(`interest:${id}`) as Record<string, unknown> | null;
  if (!entry) {
    return htmlPage("Not found", "🔍", "Registration not found", "This interest registration could not be found.", "#6b7280");
  }

  // Validate action token
  if (entry.actionToken !== token) {
    return htmlPage("Invalid link", "🔒", "Invalid link", "This confirmation link is not valid.", "#6b7280");
  }

  // Already actioned?
  if (entry.status === "confirmed" || entry.status === "declined") {
    const already = entry.status as string;
    return htmlPage(
      "Already actioned",
      already === "confirmed" ? "✅" : "❌",
      `Already ${already}`,
      `This registration has already been ${already}. No further action is needed.`,
      "#6b7280"
    );
  }

  // Update status
  const newStatus = action === "confirm" ? "confirmed" : "declined";
  const updated = { ...entry, status: newStatus, actionedAt: new Date().toISOString() };
  await kv.set(`interest:${id}`, updated);

  // Send customer email
  const { name, email, classes, experience } = entry as {
    name: string; email: string; classes: string[]; experience: string;
  };

  const classesText = Array.isArray(classes) && classes.length ? classes.join(", ") : "your selected classes";
  const expLabel = EXPERIENCE_LABELS[experience] ?? experience ?? "";

  try {
    if (action === "confirm") {
      await sendCustomerEmail({
        to: email,
        subject: "You're in! — Imperfect Bakers",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
            <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">You're confirmed! 🎉</h1>
              <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
            </div>
            <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
              <p style="font-size:16px;margin-bottom:16px">Hi ${name}! 👋</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
                We're so excited to have you join us at Imperfect Bakers! Your interest in <strong>${classesText}</strong> has been confirmed.
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
        `,
      });
    } else {
      await sendCustomerEmail({
        to: email,
        subject: "Re: Your interest at Imperfect Bakers",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
            <div style="background:#1a1a1a;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">Thanks for your interest</h1>
              <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
            </div>
            <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
              <p style="font-size:16px;margin-bottom:16px">Hi ${name},</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
                Thank you so much for your interest in our <strong>${classesText}</strong> class${Array.isArray(classes) && classes.length > 1 ? "es" : ""}.
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">
                Unfortunately we don't have availability that matches your preferences right now. But we'd love to keep you on our radar — we'll reach out as soon as a relevant spot opens up!
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">
                In the meantime, feel free to browse our upcoming sessions — something new might pop up that's perfect for you.
              </p>
              <p style="font-size:14px;color:#6b7280">Warmly,<br><strong style="color:#006644">Chef Sarah & the Imperfect Bakers team</strong></p>
              <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
                <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse upcoming classes</a>
              </div>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Customer email failed:", err);
    // Still show success page — status was already updated
  }

  if (action === "confirm") {
    return htmlPage(
      "Confirmed!",
      "✅",
      `${name} is confirmed!`,
      `A confirmation email has been sent to ${email}. They're all set!`,
      "#006644"
    );
  } else {
    return htmlPage(
      "Declined",
      "❌",
      "Registration declined",
      `A notification has been sent to ${email} letting them know.`,
      "#374151"
    );
  }
}

async function sendCustomerEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
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
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
  return res.json();
}
