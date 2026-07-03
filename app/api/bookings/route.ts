import { NextResponse } from "next/server";
import { createBooking, getSession, getSessionBookings } from "@/lib/data";
import { checkAdminToken } from "@/lib/auth";
import { kv } from "@vercel/kv";
import { getTemplates, sub } from "@/lib/email-templates";
import type { Booking, ClassSession } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://imperfect-bakers.vercel.app";

// GET all bookings across all sessions (admin only)
export async function GET(req: Request) {
  if (!checkAdminToken(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sessionIds = await kv.lrange<string>("sessions:all", 0, -1);
    const allBookings: Booking[] = [];
    await Promise.all((sessionIds ?? []).map(async (id) => {
      const bookings = await getSessionBookings(id);
      allBookings.push(...bookings);
    }));
    return NextResponse.json(allBookings);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, name, email, phone, counts, totalPeople, paymentStatus, paymentOther, notes } = body;

  if (!sessionId || !name || !email || totalPeople < 1) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const result = await createBooking({ sessionId, name, email, phone, counts, totalPeople, paymentStatus, paymentOther, notes });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const { booking, session } = result;

  // Send emails — awaited so serverless function doesn't terminate before they fire
  const [admin, customer] = await Promise.allSettled([
    sendAdminEmail(booking, session),
    sendCustomerRequestEmail(booking, session),
  ]);
  const adminError = admin.status === "rejected" ? String(admin.reason) : null;
  const customerError = customer.status === "rejected" ? String(customer.reason) : null;
  if (adminError) console.error("Admin booking email failed:", adminError);
  if (customerError) console.error("Customer request email failed:", customerError);

  return NextResponse.json({ id: booking.id, emailErrors: { admin: adminError, customer: customerError } }, { status: 201 });
}

async function sendAdminEmail(booking: Booking, session: ClassSession | null) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const { id, actionToken, name, email, phone, counts, totalPeople, paymentStatus, notes } = booking;

  const confirmUrl = `${BASE_URL}/api/bookings/action?id=${id}&action=confirm&token=${actionToken}`;
  const declineUrl = `${BASE_URL}/api/bookings/action?id=${id}&action=decline&token=${actionToken}`;

  const sessionName = session?.sessionName ?? "Unknown session";
  const sessionDate = session?.date ?? "";
  const sessionTime = session?.time ?? "";

  const attendeeBreakdown = [
    counts.child > 0 ? `${counts.child} child` : null,
    counts.youngAdult > 0 ? `${counts.youngAdult} young adult` : null,
    counts.adult > 0 ? `${counts.adult} adult` : null,
  ].filter(Boolean).join(", ");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">New booking request</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
      </div>
      <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280;width:140px">Class</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px;font-weight:500">${sessionName}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Date & time</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${sessionDate}${sessionTime ? ` · ${sessionTime}` : ""}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Name</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px;font-weight:500">${name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Email</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px"><a href="mailto:${email}" style="color:#006644">${email}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Phone</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${phone}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Attendees</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${totalPeople} (${attendeeBreakdown})</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:13px;color:#6b7280">Payment</td><td style="padding:10px 0;border-bottom:1px solid #e4dfd5;font-size:14px">${paymentStatus}</td></tr>
          <tr><td style="padding:10px 0;font-size:13px;color:#6b7280;vertical-align:top">Notes</td><td style="padding:10px 0;font-size:14px">${notes || "—"}</td></tr>
        </table>
        <div style="margin-top:32px">
          <a href="${confirmUrl}" style="display:inline-block;padding:14px 28px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600;margin-right:12px">✓ Confirm booking</a>
          <a href="${declineUrl}" style="display:inline-block;padding:14px 28px;background:#fff;color:#1a1a1a;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600;border:1px solid #e4dfd5">✗ Decline</a>
        </div>
        <p style="margin-top:16px;font-size:12px;color:#9ca3af">Clicking Confirm or Decline will immediately send an automated response to ${name} at ${email}.</p>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Imperfect Bakers <onboarding@resend.dev>", reply_to: ["imperfectbakers@gmail.com"],
      to: ["imperfectbakers@gmail.com"],
      subject: `New booking: ${name} — ${sessionName} (${sessionDate})`,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

async function sendCustomerRequestEmail(booking: Booking, session: ClassSession | null) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const { name, email, totalPeople } = booking;
  const sessionName = session?.sessionName ?? "your class";
  const sessionDate = session?.date ?? "";
  const sessionTime = session?.time ?? "";

  const tmpl = (await getTemplates()).booking_request;
  const vars = { name, sessionName, sessionDate, sessionTime, totalPeople: String(totalPeople) };

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">Reservation request received 🎉</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
      </div>
      <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
        <p style="font-size:16px;margin-bottom:16px">Hi ${name}! 👋</p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">
          Thanks for requesting a spot in <strong>${sessionName}</strong>${sessionDate ? ` on <strong>${sessionDate}${sessionTime ? ` at ${sessionTime}` : ""}</strong>` : ""} for <strong>${totalPeople} ${totalPeople === 1 ? "person" : "people"}</strong>.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:16px">${sub(tmpl.note, vars)}</p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin-bottom:24px">${sub(tmpl.closing, vars)}</p>
        <p style="font-size:14px;color:#6b7280;margin-bottom:12px">Warmly,</p><p style="font-size:14px;margin:0;margin-top:0"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>
        <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
          <a href="${BASE_URL}/classes" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">Browse our classes</a>
        </div>
      </div>
    </div>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL ?? "Imperfect Bakers <onboarding@resend.dev>",
      reply_to: ["imperfectbakers@gmail.com"],
      to: [email],
      subject: sub(tmpl.subject, vars),
      html,
    }),
  });
  const resBody = await res.text();
  console.log("Resend customer request email response:", res.status, resBody);
  if (!res.ok) throw new Error(`Resend ${res.status}: ${resBody}`);
}
