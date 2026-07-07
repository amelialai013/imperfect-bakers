import { kv } from "@vercel/kv";

// ── Types ─────────────────────────────────────────────────────────────────────

export type EmailTemplates = {
  booking_request: {
    subject: string;
    note: string;
    closing: string;
  };
  booking_confirmed: {
    subject: string;
    details: string;
  };
  booking_declined: {
    subject: string;
    reason: string;
    invite: string;
  };
  booking_cancelled: {
    subject: string;
    release: string;
    future: string;
  };
  interest_received: {
    subject: string;
    next_steps: string;
  };
  interest_classes_available: {
    subject: string;
    body: string;
    cta: string;
  };
};

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_TEMPLATES: EmailTemplates = {
  booking_request: {
    subject: "Reservation request received — {{sessionName}}",
    note: "Please note that this is not a confirmed booking. We run our classes once we have enough students signed up, so we'll be in touch to let you know whether the class is going ahead.",
    closing: "You'll receive a separate email confirming your reservation once the class is finalised. In the meantime, feel free to reach out if you have any questions!",
  },
  booking_confirmed: {
    subject: "You're confirmed! — {{sessionName}}",
    details: "We'll be in touch with any final details closer to the date. We can't wait to cook with you! 🧁",
  },
  booking_declined: {
    subject: "Re: Your booking at Imperfect Bakers",
    reason: "Unfortunately we're unable to accommodate your booking at this time. Your spot has been released and you won't be charged.",
    invite: "We'd love to have you join us for a future session — check out what's coming up below!",
  },
  booking_cancelled: {
    subject: "Your booking has been cancelled — {{sessionName}}",
    release: "Your spot has been released and you won't be charged. If you'd like to try a different session, feel free to browse our other classes below.",
    future: "Sessions are likely to run if there are more than 6 students registered, otherwise you can always request a private group class!",
  },
  interest_received: {
    subject: "Interest registered — {{classes}}",
    next_steps: "In the meantime, feel free to browse our upcoming classes — there may already be something perfect for you!",
  },
  interest_classes_available: {
    subject: "Classes you're interested in are now available — {{classes}}",
    body: "We're excited to let you know that sessions are now open for the classes you registered interest in. Spots are limited, so we recommend booking early to secure your place.",
    cta: "We hope to see you in the kitchen soon!",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Replace {{variable}} placeholders in a string */
export function sub(text: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{{${k}}}`, v), text);
}

/** Fetch templates from KV, falling back to defaults for any missing fields */
export async function getTemplates(): Promise<EmailTemplates> {
  const stored = await kv.get<Partial<EmailTemplates>>("email-templates");
  if (!stored) return DEFAULT_TEMPLATES;
  return {
    booking_request: { ...DEFAULT_TEMPLATES.booking_request, ...stored.booking_request },
    booking_confirmed: { ...DEFAULT_TEMPLATES.booking_confirmed, ...stored.booking_confirmed },
    booking_declined: { ...DEFAULT_TEMPLATES.booking_declined, ...stored.booking_declined },
    booking_cancelled: { ...DEFAULT_TEMPLATES.booking_cancelled, ...stored.booking_cancelled },
    interest_received: { ...DEFAULT_TEMPLATES.interest_received, ...stored.interest_received },
    interest_classes_available: { ...DEFAULT_TEMPLATES.interest_classes_available, ...stored.interest_classes_available },
  };
}
