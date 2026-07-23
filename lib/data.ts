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
  // Enforce 0 <= spotsLeft <= maxSpots regardless of what the caller computed —
  // e.g. an admin reducing maxSpots below the current booked count shouldn't be
  // able to push spotsLeft negative.
  updated.spotsLeft = Math.min(Math.max(updated.spotsLeft, 0), updated.maxSpots);
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

// Atomically check-and-decrement spotsLeft on a session's JSON record.
// A plain read-then-write (getSession + updateSession) has a race: two
// concurrent bookings can both read the same spotsLeft, both pass the
// capacity check, and both write independently, oversubscribing the
// session. Running the check-and-decrement as a single Lua script makes it
// one atomic operation on the Redis server, closing that window.
const DECREMENT_SPOTS_SCRIPT = `
local raw = redis.call('GET', KEYS[1])
if not raw then return cjson.encode({ok = false, reason = 'not_found'}) end
local session = cjson.decode(raw)
local amount = tonumber(ARGV[1])
if session.spotsLeft < amount then
  return cjson.encode({ok = false, reason = 'insufficient', spotsLeft = session.spotsLeft})
end
session.spotsLeft = session.spotsLeft - amount
redis.call('SET', KEYS[1], cjson.encode(session))
return cjson.encode({ok = true, spotsLeft = session.spotsLeft})
`;

type SpotAdjustResult =
  | { ok: true; spotsLeft: number }
  | { ok: false; reason: "not_found" | "insufficient"; spotsLeft?: number };

async function decrementSpots(sessionId: string, amount: number): Promise<SpotAdjustResult> {
  // kv.eval already JSON-deserializes the Lua script's cjson-encoded return value —
  // do not JSON.parse it again here.
  const result = await kv.eval(DECREMENT_SPOTS_SCRIPT, [`session:${sessionId}`], [amount]);
  return result as SpotAdjustResult;
}

export async function createBooking(
  data: Omit<Booking, "id" | "createdAt" | "cancelled">
): Promise<{ booking: Booking; session: ClassSession } | { error: string }> {
  if (!Number.isInteger(data.totalPeople) || data.totalPeople < 1) {
    return { error: "Invalid number of attendees." };
  }
  const result = await decrementSpots(data.sessionId, data.totalPeople);
  if (!result.ok) {
    if (result.reason === "not_found") return { error: "Session not found." };
    return {
      error:
        result.spotsLeft === 0
          ? "This session is fully booked."
          : `Only ${result.spotsLeft} spot${result.spotsLeft === 1 ? "" : "s"} remaining — you requested ${data.totalPeople}.`,
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

  const updatedSession = await getSession(data.sessionId);
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

// Atomically mark a booking cancelled and restore its spots to the session,
// as a single Lua script. This closes two races: two concurrent cancel
// requests for the same booking both passing the "not already cancelled"
// check and double-refunding spots, and the same read-then-write race on
// spotsLeft described above DECREMENT_SPOTS_SCRIPT.
const CANCEL_BOOKING_SCRIPT = `
local braw = redis.call('GET', KEYS[1])
if not braw then return cjson.encode({ok = false, reason = 'not_found'}) end
local booking = cjson.decode(braw)
if booking.cancelled then return cjson.encode({ok = true, alreadyCancelled = true}) end
booking.cancelled = true
redis.call('SET', KEYS[1], cjson.encode(booking))

local sraw = redis.call('GET', KEYS[2])
if sraw then
  local session = cjson.decode(sraw)
  local amount = tonumber(ARGV[1])
  local newSpots = session.spotsLeft + amount
  if newSpots > session.maxSpots then newSpots = session.maxSpots end
  session.spotsLeft = newSpots
  redis.call('SET', KEYS[2], cjson.encode(session))
end
return cjson.encode({ok = true})
`;

export async function cancelBooking(id: string): Promise<void> {
  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking) return;
  await kv.eval(
    CANCEL_BOOKING_SCRIPT,
    [`booking:${id}`, `session:${booking.sessionId}`],
    [booking.totalPeople]
  );
}

// Same read-then-write race as DECREMENT_SPOTS_SCRIPT above, but for
// permanently deleting a booking: restoring its spots to the session, removing
// it from the session's booking list, and deleting the record all need to
// happen as one atomic operation, keyed off the booking's *current* cancelled/
// declined state (re-read inside the script, not the possibly-stale state the
// caller already has).
const PERMANENT_DELETE_SCRIPT = `
local braw = redis.call('GET', KEYS[1])
if not braw then return cjson.encode({ok = true}) end
local booking = cjson.decode(braw)
if not booking.cancelled and booking.status ~= 'declined' then
  local sraw = redis.call('GET', KEYS[2])
  if sraw then
    local session = cjson.decode(sraw)
    local newSpots = session.spotsLeft + booking.totalPeople
    if newSpots > session.maxSpots then newSpots = session.maxSpots end
    session.spotsLeft = newSpots
    redis.call('SET', KEYS[2], cjson.encode(session))
  end
end
redis.call('LREM', KEYS[3], 0, ARGV[1])
redis.call('DEL', KEYS[1])
return cjson.encode({ok = true})
`;

export async function permanentlyDeleteBooking(id: string): Promise<void> {
  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking) return;
  await kv.eval(
    PERMANENT_DELETE_SCRIPT,
    [`booking:${id}`, `session:${booking.sessionId}`, `session:${booking.sessionId}:bookings`],
    [id]
  );
}

// Moving a booking to a different session touches spotsLeft on *two* sessions
// plus the booking's own sessionId and both sessions' booking-list keys — the
// previous read-then-write version (getSession + Promise.all of separate
// updateSession/kv calls) had the same lost-update race as the other spot
// counters above, times two. Doing the capacity check and both spot
// adjustments atomically in one script closes that window.
const MOVE_BOOKING_SCRIPT = `
local braw = redis.call('GET', KEYS[1])
if not braw then return cjson.encode({ok = false, reason = 'not_found'}) end
local booking = cjson.decode(braw)

local nraw = redis.call('GET', KEYS[3])
if not nraw then return cjson.encode({ok = false, reason = 'not_found'}) end
local newSession = cjson.decode(nraw)

local amount = booking.totalPeople
local active = (not booking.cancelled) and (booking.status ~= 'declined')

if active and newSession.spotsLeft < amount then
  return cjson.encode({ok = false, reason = 'insufficient', spotsLeft = newSession.spotsLeft})
end

if active then
  newSession.spotsLeft = newSession.spotsLeft - amount
  redis.call('SET', KEYS[3], cjson.encode(newSession))

  local oraw = redis.call('GET', KEYS[2])
  if oraw then
    local oldSession = cjson.decode(oraw)
    local restored = oldSession.spotsLeft + amount
    if restored > oldSession.maxSpots then restored = oldSession.maxSpots end
    oldSession.spotsLeft = restored
    redis.call('SET', KEYS[2], cjson.encode(oldSession))
  end
end

booking.sessionId = ARGV[2]
redis.call('SET', KEYS[1], cjson.encode(booking))
redis.call('LREM', KEYS[4], 0, ARGV[1])
redis.call('RPUSH', KEYS[5], ARGV[1])

return cjson.encode({ok = true})
`;

// Reinstating a cancelled/declined booking back to "pending" makes it active
// again, so — like a fresh booking — it needs to *consume* a spot, with the
// same capacity check DECREMENT_SPOTS_SCRIPT does (the session may have
// filled up on other bookings while this one sat declined). The previous
// version of this (both the original read-then-write code and an earlier
// draft of this atomic script) mistakenly *restored* a spot on reinstate —
// the opposite of correct, since decline had already freed it — which is
// exactly the kind of drift between spotsLeft and actual active bookings
// this whole fix is closing.
const REINSTATE_BOOKING_SCRIPT = `
local braw = redis.call('GET', KEYS[1])
if not braw then return cjson.encode({ok = false, reason = 'not_found'}) end
local booking = cjson.decode(braw)
local wasActive = (not booking.cancelled) and (booking.status ~= 'declined')
if not wasActive then
  local sraw = redis.call('GET', KEYS[2])
  if not sraw then return cjson.encode({ok = false, reason = 'not_found'}) end
  local session = cjson.decode(sraw)
  if session.spotsLeft < booking.totalPeople then
    return cjson.encode({ok = false, reason = 'insufficient', spotsLeft = session.spotsLeft})
  end
  session.spotsLeft = session.spotsLeft - booking.totalPeople
  redis.call('SET', KEYS[2], cjson.encode(session))
end
booking.cancelled = false
booking.status = 'pending'
redis.call('SET', KEYS[1], cjson.encode(booking))
return cjson.encode({ok = true})
`;

type ReinstateResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "insufficient"; spotsLeft?: number };

export async function reinstateBooking(id: string): Promise<ReinstateResult> {
  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking) return { ok: false, reason: "not_found" };
  const result = await kv.eval(
    REINSTATE_BOOKING_SCRIPT,
    [`booking:${id}`, `session:${booking.sessionId}`],
    []
  );
  return result as ReinstateResult;
}

type MoveBookingResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "insufficient"; spotsLeft?: number };

export async function moveBooking(id: string, newSessionId: string): Promise<MoveBookingResult> {
  const booking = await kv.get<Booking>(`booking:${id}`);
  if (!booking) return { ok: false, reason: "not_found" };
  if (booking.sessionId === newSessionId) return { ok: true };
  const result = await kv.eval(
    MOVE_BOOKING_SCRIPT,
    [
      `booking:${id}`,
      `session:${booking.sessionId}`,
      `session:${newSessionId}`,
      `session:${booking.sessionId}:bookings`,
      `session:${newSessionId}:bookings`,
    ],
    [id, newSessionId]
  );
  return result as MoveBookingResult;
}
