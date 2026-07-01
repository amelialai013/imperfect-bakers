import { kv } from "@vercel/kv";
import type { ClassSession, Booking } from "./types";

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
