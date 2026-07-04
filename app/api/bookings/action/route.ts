import { kv } from "@vercel/kv";
import { updateBookingStatus, getSession, cancelBooking } from "@/lib/data";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

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
    a{display:inline-block;padding:14px 32px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:15px;font-weight:600;letter-spacing:-0.01em}</style>
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

  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking) {
    return htmlPage("Not found", "🔍", "Booking not found", "This booking could not be found.", "#6b7280");
  }

  if (booking.actionToken !== token) {
    return htmlPage("Invalid link", "🔒", "Invalid link", "This confirmation link is not valid.", "#6b7280");
  }

  if (booking.status === "confirmed" || booking.status === "declined") {
    return htmlPage(
      "Already actioned", booking.status === "confirmed" ? "✅" : "❌",
      `Already ${booking.status}`,
      `This booking has already been ${booking.status}. No further action is needed.`,
      "#6b7280"
    );
  }

  const newStatus = action === "confirm" ? "confirmed" : "declined";
  await updateBookingStatus(id, newStatus);

  // If declining, return spots to session
  if (action === "decline") {
    await cancelBooking(id);
    // cancelBooking sets cancelled:true — restore status so it shows as declined not cancelled
    const updated = await kv.get<Booking>(`booking:${id}`);
    if (updated) await kv.set(`booking:${id}`, { ...updated, status: "declined", cancelled: false });
  }

  const session = await getSession(booking.sessionId);
  const sessionName = session?.sessionName ?? "your class";
  const sessionDate = session?.date ?? "";

  try {
    if (action === "confirm") {
      await sendEmail({
        to: booking.email,
        subject: `You're confirmed! — ${sessionName}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
            <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">Booking confirmed! 🎉</h1>
              <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
            </div>
            <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
              <p style="font-size:16px;margin-bottom:16px">Hi ${booking.name}! 👋</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
                Great news — your booking for <strong>${sessionName}</strong>${sessionDate ? ` on <strong>${sessionDate}</strong>` : ""} is confirmed!
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">
                We'll be in touch with any final details closer to the date. We can't wait to cook with you! 🧁
              </p>
              <p style="font-size:14px;color:#6b7280;margin-bottom:12px">See you in the kitchen,</p><p style="font-size:14px;margin:0"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
              <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
                <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse our classes</a>
              </div>
            </div>
          </div>
        `,
      });
    } else {
      await sendEmail({
        to: booking.email,
        subject: `Re: Your booking at Imperfect Bakers`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
            <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">Booking declined</h1>
              <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
            </div>
            <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
              <p style="font-size:16px;margin-bottom:16px">Hi ${booking.name},</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
                Thank you so much for booking <strong>${sessionName}</strong>${sessionDate ? ` on <strong>${sessionDate}</strong>` : ""}.
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">
                Unfortunately we're unable to accommodate your booking at this time. Your spot has been released and you won't be charged.
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">
                We'd love to have you join us for a future session — check out what's coming up below!
              </p>
              <p style="font-size:14px;color:#6b7280;margin-bottom:12px">Warmly,</p><p style="font-size:14px;margin:0"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
              <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
                <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse upcoming classes</a>
              </div>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Customer email failed:", err);
  }

  if (action === "confirm") {
    return htmlPage("Confirmed!", "✅", `${booking.name} is confirmed!`, `A confirmation email has been sent to ${booking.email}.`, "#006644");
  } else {
    return htmlPage("Declined", "❌", "Booking declined", `A notification has been sent to ${booking.email} and their spot has been released.`, "#374151");
  }
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL ?? "Imperfect Bakers <hello@imperfectbakers.com>", reply_to: ["imperfectbakers@gmail.com"], to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}
