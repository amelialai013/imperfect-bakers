import { kv } from "@vercel/kv";
import type { ClassSession, Booking, ClassConfig } from "./types";
import { DEFAULT_CLASS_CONFIGS } from "./classDefaults";

export { DEFAULT_CLASS_CONFIGS };

const DEFAULT_KEYS = new Set(DEFAULT_CLASS_CONFIGS.map((d) => d.key));

export async function getClassConfigs(): Promise<ClassConfig[]> {
  // Defaults (with any KV overrides)
  const defaults = await Promise.all(
    DEFAULT_CLASS_CONFIGS.map(async (def) => {
      const stored = await kv.get<ClassConfig>(`classconfig:${def.key}`);
      return stored ?? def;
    })
  );
  // Custom classes added via admin
  const customKeys: string[] = (await kv.lrange("classconfigs:custom", 0, -1)) ?? [];
  const customs = await Promise.all(
    customKeys.map((key) => kv.get<ClassConfig>(`classconfig:${key}`))
  );
  const validCustoms = customs.filter(Boolean) as ClassConfig[];
  return [...defaults, ...validCustoms];
}

export async function saveClassConfig(config: ClassConfig): Promise<ClassConfig> {
  await kv.set(`classconfig:${config.key}`, config);
  // Track custom (non-default) classes in a separate list
  if (!DEFAULT_KEYS.has(config.key)) {
    const existing: string[] = (await kv.lrange("classconfigs:custom", 0, -1)) ?? [];
    if (!existing.includes(config.key)) {
      await kv.rpush("classconfigs:custom", config.key);
    }
  }
  return config;
}

export async function deleteClassConfig(key: string): Promise<void> {
  if (DEFAULT_KEYS.has(key)) {
    // Default classes can't be fully removed — soft-delete by marking hidden
    const existing = await kv.get<ClassConfig>(`classconfig:${key}`);
    const base = DEFAULT_CLASS_CONFIGS.find((d) => d.key === key)!;
    await kv.set(`classconfig:${key}`, { ...(existing ?? base), hidden: true });
  } else {
    await kv.del(`classconfig:${key}`);
    await kv.lrem("classconfigs:custom", 0, key);
  }
}

export async function restoreClassConfig(key: string): Promise<void> {
  const existing = await kv.get<ClassConfig>(`classconfig:${key}`);
  if (existing) {
    await kv.set(`classconfig:${key}`, { ...existing, hidden: false });
  }
}

// ── Sessions ──────────────────────────────────────────────

export async function getAllSessions(): Promise<ClassSession[]> {
  const ids: string[] = (await kv.lrange("sessions:all", 0, -1)) ?? [];
  if (!ids.length) return [];
  const sessions = await Promise.all(
    ids.map((id) => kv.get<ClassSession>(`session:${id}`))
  );
  return (sessions.filter(Boolean) as ClassSession[]).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getSession(id: string): Promise<ClassSession | null> {
  return kv.get<ClassSession>(`session:${id}`);
}

export async function createSession(
  data: Omit<ClassSession, "id" | "createdAt" | "spotsLeft">
): Promise<ClassSession> {
  const id = crypto.randomUUID();
  const session: ClassSession = {
    ...data,
    id,
    spotsLeft: data.maxSpots,
    createdAt: new Date().toISOString(),
  };
  await kv.set(`session:${id}`, session);
  await kv.rpush("sessions:all", id);
  return session;
}

export async function updateSession(
  id: string,
  data: Partial<ClassSession>
): Promise<ClassSession | null> {
  const existing = await getSession(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  await kv.set(`session:${id}`, updated);
  return updated;
}

export async function deleteSession(id: string): Promise<void> {
  await kv.del(`session:${id}`);
  await kv.lrem("sessions:all", 0, id);
}

// ── Bookings ──────────────────────────────────────────────

export async function getSessionBookings(sessionId: string): Promise<Booking[]> {
  const ids: string[] =
    (await kv.lrange(`session:${sessionId}:bookings`, 0, -1)) ?? [];
  if (!ids.length) return [];
  const bookings = await Promise.all(
    ids.map((id) => kv.get<Booking>(`booking:${id}`))
  );
  return (bookings.filter(Boolean) as Booking[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createBooking(
  data: Omit<Booking, "id" | "createdAt" | "cancelled">
): Promise<{ booking: Booking; session: ClassSession } | { error: string }> {
  const session = await getSession(data.sessionId);
  if (!session) return { error: "Session not found." };
  if (session.spotsLeft < data.totalPeople) {
    return {
      error:
        session.spotsLeft === 0
          ? "This session is fully booked."
          : `Only ${session.spotsLeft} spot${session.spotsLeft === 1 ? "" : "s"} remaining — you requested ${data.totalPeople}.`,
    };
  }

  const id = crypto.randomUUID();
  const booking: Booking = {
    ...data,
    id,
    actionToken: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
    cancelled: false,
  };

  await kv.set(`booking:${id}`, booking);
  await kv.rpush(`session:${data.sessionId}:bookings`, id);

  const updatedSession = await updateSession(data.sessionId, {
    spotsLeft: session.spotsLeft - data.totalPeople,
  });

  return { booking, session: updatedSession! };
}

export async function updateBookingStatus(
  id: string,
  status: "confirmed" | "declined"
): Promise<Booking | null> {
  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking) return null;
  const updated: Booking = { ...booking, status, actionedAt: new Date().toISOString() };
  await kv.set(`booking:${id}`, updated);
  return updated;
}

export async function cancelBooking(id: string): Promise<void> {
  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking || booking.cancelled) return;
  await kv.set(`booking:${id}`, { ...booking, cancelled: true });
  const session = await getSession(booking.sessionId);
  if (session) {
    await updateSession(booking.sessionId, {
      spotsLeft: session.spotsLeft + booking.totalPeople,
    });
  }
}
