import { NextResponse } from "next/server";
import { cancelBooking, updateBookingStatus, getSession, getSessionBookings } from "@/lib/data";
import { checkAdminToken } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { getTemplates, sub } from "@/lib/email-templates";
import type { Booking } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://imperfect-bakers.vercel.app";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(req.url);

  // Permanent delete — remove record entirely from KV (no email sent)
  if (searchParams.get("permanent") === "true") {
    const booking = await kv.get<Booking>(`booking:${id}`);
    if (booking) await kv.lrem(`session:${booking.sessionId}:bookings`, 0, id);
    await kv.del(`booking:${id}`);
    return NextResponse.json({ ok: true });
  }

  // Grab booking + session before cancelling so we can email the customer
  const booking = await kv.get<Booking>(`booking:${id}`);
  await cancelBooking(id);

  if (booking) {
    const session = await getSession(booking.sessionId);
    const sessionName = session?.sessionName ?? "your class";
    const sessionDate = session?.date ?? "";
    try {
      const tmpl = (await getTemplates()).booking_cancelled;
      const vars = { name: booking.name, sessionName, sessionDate };
      await sendEmail({
        to: booking.email,
        subject: sub(tmpl.subject, vars),
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
            <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">Booking cancelled</h1>
              <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
            </div>
            <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
              <p style="font-size:16px;margin-bottom:16px">Hi ${booking.name},</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
                Your booking for <strong>${sessionName}</strong>${sessionDate ? ` on <strong>${sessionDate}</strong>` : ""} has sadly been cancelled due to insufficient registrations or unforeseen circumstances.
              </p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.release, vars)}</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.future, vars)}</p>
              <p style="font-size:14px;color:#6b7280;margin-bottom:20px">Warmly,</p><p style="font-size:14px;margin:0;margin-top:4px"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
              <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
                <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse upcoming classes</a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (err) {
      console.error("Cancellation email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json() as { status: "confirmed" | "declined" };

  if (!["confirmed", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await updateBookingStatus(id, status);

  // If declining, return spots to session
  if (status === "declined") {
    await cancelBooking(id);
    const updated = await kv.get<Booking>(`booking:${id}`);
    if (updated) await kv.set(`booking:${id}`, { ...updated, status: "declined", cancelled: false });
  }

  const session = await getSession(booking.sessionId);
  const sessionName = session?.sessionName ?? "your class";
  const sessionDate = session?.date ?? "";

  // Send customer email
  try {
    const templates = await getTemplates();
    const vars = { name: booking.name, sessionName, sessionDate };
    if (status === "confirmed") {
      const tmpl = templates.booking_confirmed;
      await sendEmail({
        to: booking.email,
        subject: sub(tmpl.subject, vars),
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
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.details, vars)}</p>
              <p style="font-size:14px;color:#6b7280;margin-bottom:20px">See you in the kitchen,</p><p style="font-size:14px;margin:0;margin-top:4px"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
              <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
                <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse our classes</a>
              </div>
            </div>
          </div>
        `,
      });
    } else {
      const tmpl = templates.booking_declined;
      await sendEmail({
        to: booking.email,
        subject: sub(tmpl.subject, vars),
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
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.reason, vars)}</p>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.invite, vars)}</p>
              <p style="font-size:14px;color:#6b7280;margin-bottom:20px">Warmly,</p><p style="font-size:14px;margin:0;margin-top:4px"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
              <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
                <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse upcoming classes</a>
              </div>
            </div>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error("Customer booking email failed:", err);
  }

  return NextResponse.json({ ok: true, status });
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL ?? "Imperfect Bakers <onboarding@resend.dev>", reply_to: ["imperfectbakers@gmail.com"], to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  return res.json();
}
