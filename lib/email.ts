/**
 * Shared Resend email helper.
 * Always sends from the verified imperfectbakers.com domain.
 */
export async function sendEmail(payload: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const from =
    process.env.RESEND_FROM_EMAIL ?? "Imperfect Bakers <hello@imperfectbakers.com>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo ? [payload.replyTo] : ["imperfectbakers@gmail.com"],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

/** Standard sign-off HTML block used in all customer emails */
export function signOff(closing: "Warmly" | "See you in the kitchen"): string {
  return `<p style="font-size:14px;color:#6b7280;margin-bottom:12px">${closing},</p><p style="font-size:14px;margin:0"><strong style="color:#006644">Chef Sarah &amp; the Imperfect Bakers team</strong></p>`;
}

/** Wrap email body in the standard card layout */
export function emailCard(
  title: string,
  body: string,
  ctaUrl: string,
  ctaLabel: string
): string {
  return `
<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
  <div style="background:#006644;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:20px;font-weight:600">${title}</h1>
    <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px">Imperfect Bakers</p>
  </div>
  <div style="background:#faf9f6;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e4dfd5;border-top:none">
    ${body}
    <div style="margin-top:32px;border-top:1px solid #e4dfd5;padding-top:20px">
      <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;background:#006644;color:#fff;text-decoration:none;border-radius:9999px;font-size:14px;font-weight:600">${ctaLabel}</a>
    </div>
  </div>
</div>`;
}
