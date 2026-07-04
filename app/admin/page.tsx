"use client";

import { useState, useEffect, useCallback } from "react";
import type { ClassSession, Booking, ClassConfig } from "@/lib/types";
import { DEFAULT_CLASS_CONFIGS } from "@/lib/classDefaults";
import LocationInput from "@/components/LocationInput";

// ── helpers ───────────────────────────────────────────────────────────────────

function authFetch(url: string, token: string, opts: RequestInit = {}) {
  return fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers ?? {}),
    },
  });
}

// ── empty session form ────────────────────────────────────────────────────────

const CLASS_TYPES = [
  "Sweet Food",
  "Savoury Food",
  "Knife Skills",
  "Dietary Requirement Food",
  "Random Kitchen Fun",
  "Private Group Class",
];

// Convert ISO date (2026-07-18) → "Saturday 18 July 2026"
function isoToDisplayDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// Convert display date back to ISO for the date input
// Safari rejects "Saturday 18 July 2026" passed to new Date(), so we parse manually.
const MONTH_IDX: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3,
  May: 4, June: 5, July: 6, August: 7,
  September: 8, October: 9, November: 10, December: 11,
};
function displayDateToIso(display: string): string {
  if (!display) return "";
  // "Saturday 18 July 2026" → "2026-07-18"
  const parts = display.split(" ");
  if (parts.length === 4) {
    const month = MONTH_IDX[parts[2]];
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[3], 10);
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  const d = new Date(display);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

// Format start time + duration hours → "1 – 4pm"
function formatTimeRange(start: string, durationHours: number): string {
  if (!start) return "";
  const [hStr, mStr] = start.split(":");
  const startH = parseInt(hStr, 10);
  const startM = parseInt(mStr, 10);
  const totalEndMins = startH * 60 + startM + Math.round(durationHours * 60);
  const endH = Math.floor(totalEndMins / 60);
  const endM = totalEndMins % 60;
  const fmt = (h: number, m: number) => {
    const period = h >= 12 ? "pm" : "am";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
  };
  return `${fmt(startH, startM)} – ${fmt(endH, endM)}`;
}

const emptyForm = {
  classLabel: "",
  sessionName: "",
  date: "",
  time: "",
  location: "",
  price: "",
  maxSpots: "",
  ages: "All ages",
  description: "",
  imageUrl: "",
};

type FormState = typeof emptyForm;

// ── sub-components ────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const cls =
    "w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors";
  return (
    <div>
      <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-4">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className={cls + " resize-none"}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={cls}
        />
      )}
    </div>
  );
}

const ATTENDEE_OPTIONS = [
  { key: "child" as const, label: "Child", sub: "7–17 yrs" },
  { key: "youngAdult" as const, label: "Young Adult", sub: "18–34 yrs" },
  { key: "adult" as const, label: "Adult", sub: "35+ yrs" },
];

function SessionForm({
  initial,
  initialAttendeeTypes,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState;
  initialAttendeeTypes: Array<"child" | "youngAdult" | "adult">;
  onSave: (data: FormState, attendeeTypes: Array<"child" | "youngAdult" | "adult">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const [attendeeTypes, setAttendeeTypes] = useState(initialAttendeeTypes);
  const [locationError, setLocationError] = useState(false);
  // Derive ISO date from stored display date for the date input
  const [dateIso, setDateIso] = useState(() => displayDateToIso(initial.date));
  // Start time and duration for the time picker
  const [startTime, setStartTime] = useState(() => {
    // Try to parse existing time like "1 – 4pm" → start "13:00"
    if (initial.time) {
      const m = initial.time.match(/^(\d+)(?::(\d+))?(am|pm)/i);
      if (m) {
        let h = parseInt(m[1], 10);
        const mins = m[2] ? parseInt(m[2], 10) : 0;
        if (m[3].toLowerCase() === "pm" && h !== 12) h += 12;
        if (m[3].toLowerCase() === "am" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
      }
    }
    return "";
  });
  const [duration, setDuration] = useState(() => {
    // Parse duration from "1 – 4pm" → 3
    if (initial.time) {
      const parts = initial.time.split("–");
      if (parts.length === 2) {
        const getH = (s: string) => {
          const m = s.trim().match(/(\d+)(?::(\d+))?(am|pm)?/i);
          if (!m) return 0;
          let h = parseInt(m[1], 10);
          const period = m[3]?.toLowerCase();
          if (period === "pm" && h !== 12) h += 12;
          if (period === "am" && h === 12) h = 0;
          return h;
        };
        const diff = getH(parts[1]) - getH(parts[0]);
        return String(diff > 0 ? diff : 3);
      }
    }
    return "3";
  });

  const cls = "w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors";
  const labelCls = "block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-4";

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toggleAttendeeType(key: "child" | "youngAdult" | "adult") {
    setAttendeeTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  // Keep form.date and form.time in sync with picker state
  useEffect(() => {
    setForm((f) => ({ ...f, date: isoToDisplayDate(dateIso) }));
  }, [dateIso]);

  useEffect(() => {
    setForm((f) => ({ ...f, time: formatTimeRange(startTime, parseInt(duration, 10) || 3) }));
  }, [startTime, duration]);

  const SelectField = ({ label, name, value, onChange, required: req, children }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean; children: React.ReactNode;
  }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select name={name} value={value} onChange={onChange} required={req}
          className={cls + " appearance-none pr-8 cursor-pointer"}>
          {children}
        </select>
        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );

  const sectionLabel = "text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-5 block";

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      if (!form.location.trim()) { setLocationError(true); return; }
      setLocationError(false);
      onSave(form, attendeeTypes);
    }}>

      {/* ── Section 1: Class ─────────────────────────────── */}
      <div className="bg-white border border-[#e8e2d9] rounded-xl p-6 mb-4">
        <span className={sectionLabel}>Class</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Class type" name="classLabel" value={form.classLabel} onChange={handle} required>
            <option value="">Select class type…</option>
            {CLASS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </SelectField>
          <Field label="Session name" name="sessionName" value={form.sessionName} onChange={handle} placeholder="e.g. Delicious Dinner" required />
        </div>
      </div>

      {/* ── Section 2: Schedule ──────────────────────────── */}
      <div className="bg-white border border-[#e8e2d9] rounded-xl p-6 mb-4">
        <span className={sectionLabel}>Schedule</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={dateIso} onChange={(e) => setDateIso(e.target.value)} required className={cls} />
            {form.date && <p className="text-xs text-[#006644]/70 mt-1.5">{form.date}</p>}
          </div>
          <div>
            <label className={labelCls}>Time</label>
            <div className="flex gap-2">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className={cls} />
              <div className="relative shrink-0 w-32">
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className={cls + " appearance-none pr-8 cursor-pointer"}>
                  {[1,1.5,2,2.5,3,3.5,4,4.5,5].map((h) => (
                    <option key={h} value={String(h)}>{h}h</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {form.time && <p className="text-xs text-[#006644]/70 mt-1.5">{form.time}</p>}
          </div>
        </div>
      </div>

      {/* ── Section 3: Venue & capacity ──────────────────── */}
      <div className="bg-white border border-[#e8e2d9] rounded-xl p-6 mb-4">
        <span className={sectionLabel}>Venue & capacity</span>
        <div className="space-y-6">
          <div>
            <label className={labelCls}>Location</label>
            <LocationInput
              value={form.location}
              onChange={(v) => setForm((f) => ({ ...f, location: v }))}
              placeholder="Williamstown, Melbourne"
              error={locationError}
            />
            {locationError && <p className="text-xs text-red-500 mt-1.5">Please enter a location</p>}
          </div>
          <SelectField label="Ages" name="ages" value={form.ages} onChange={(e) => {
            const val = e.target.value;
            setForm((f) => ({ ...f, ages: val }));
            if (val === "All ages") setAttendeeTypes(["child", "youngAdult", "adult"]);
            else if (val === "18+ yrs") setAttendeeTypes((prev) => prev.filter((k) => k !== "child"));
          }} required>
            <option value="All ages">All ages</option>
            <option value="18+ yrs">Ages 18+</option>
          </SelectField>
          <div>
            <label className={labelCls}>Attendee types</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {ATTENDEE_OPTIONS.map((opt) => {
                const active = attendeeTypes.includes(opt.key);
                return (
                  <button key={opt.key} type="button" onClick={() => toggleAttendeeType(opt.key)}
                    className={`group inline-flex items-center gap-2 px-8 py-3.5 text-[0.9375rem] font-medium border rounded-full transition-colors duration-200 ${active ? "bg-[#006644] border-[#006644] text-white" : "bg-white border-[#006644] text-[#006644] hover:bg-[#006644] hover:text-white"}`}>
                    {opt.label} <span className={`text-sm transition-colors duration-200 ${active ? "text-white/70" : "text-[#006644]/60 group-hover:text-white/70"}`}>{opt.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Price per person ($)" name="price" value={form.price} onChange={handle} type="number" placeholder="150" required />
            <Field label="Max spots" name="maxSpots" value={form.maxSpots} onChange={handle} type="number" placeholder="15" required />
          </div>
        </div>
      </div>

      {/* ── Section 4: Content ───────────────────────────── */}
      <div className="bg-white border border-[#e8e2d9] rounded-xl p-6 mb-6">
        <span className={sectionLabel}>Content</span>
        <div className="space-y-4">
          <Field label="Description (optional)" name="description" value={form.description} onChange={handle} type="textarea" placeholder="Short description of the session…" />
          <Field label="Image URL (optional)" name="imageUrl" value={form.imageUrl} onChange={handle} placeholder="https://images.unsplash.com/…" />
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save session"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}

function BookingsPanel({ sessionId, token }: { sessionId: string; token: string }) {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [levelMap, setLevelMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.experienceLevels?.length) {
          const map: Record<string, string> = {};
          for (const l of data.experienceLevels) map[l.value] = l.label;
          setLevelMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    const res = await authFetch(`/api/sessions/${sessionId}`, token, { method: "PATCH" });
    const data = await res.json();
    setBookings(data);
  }, [sessionId, token]);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, status: "confirmed" | "declined") {
    const verb = status === "confirmed" ? "confirm" : "decline";
    if (!confirm(`${verb.charAt(0).toUpperCase() + verb.slice(1)} this booking?${status === "declined" ? " The spot will be returned." : ""}`)) return;
    setActing(id);
    setBookings((prev) => prev ? prev.map((b) => b.id === id ? { ...b, status } : b) : prev);
    await authFetch(`/api/bookings/${id}`, token, { method: "PATCH", body: JSON.stringify({ status }) });
    setActing(null);
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this booking? The spot will be returned.")) return;
    setActing(id);
    await authFetch(`/api/bookings/${id}`, token, { method: "DELETE" });
    await load();
    setActing(null);
  }

  if (!bookings) return <p className="text-[#6b7280] text-sm py-4">Loading bookings…</p>;
  if (bookings.length === 0)
    return <p className="text-[#6b7280] text-sm py-4">No bookings yet for this session.</p>;

  const active = bookings.filter((b) => !b.cancelled);
  const cancelled = bookings.filter((b) => b.cancelled);

  function StatusBadge({ status }: { status?: string }) {
    if (status === "confirmed") return <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
    if (status === "declined") return <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-200">Declined</span>;
    return <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
  }

  return (
    <div className="mt-4 space-y-2">
      {active.map((b) => (
        <div key={b.id} className="bg-white border border-[#e4dfd5] rounded-[6px] px-5 py-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-[#1a1a1a] text-sm">{b.name}</p>
              <StatusBadge status={b.status} />
            </div>
            {(!b.status || b.status === "pending") && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => act(b.id, "confirmed")}
                  disabled={acting === b.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#006644] text-white rounded-full hover:bg-[#004d33] transition-colors disabled:opacity-50"
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={() => act(b.id, "declined")}
                  disabled={acting === b.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-[#6b7280] border border-[#e4dfd5] rounded-full hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  ✗ Decline
                </button>
              </div>
            )}
            {b.status === "confirmed" && (
              <button
                onClick={() => cancel(b.id)}
                disabled={acting === b.id}
                className="shrink-0 text-xs text-red-500 border border-red-200 rounded-[6px] px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm">
            <div>
              <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Email</p>
              <p className="text-[#6b7280] break-all">{b.email}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Phone</p>
              <p className="text-[#6b7280]">{b.phone}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Attendees</p>
              <p className="text-[#1a1a1a] font-medium">{b.totalPeople} total</p>
              <div className="text-[#6b7280] text-xs mt-1 space-y-0.5">
                {b.counts.child > 0 && <p>Child (7–17): {b.counts.child}</p>}
                {b.counts.youngAdult > 0 && <p>Young Adult (18–34): {b.counts.youngAdult}</p>}
                {b.counts.adult > 0 && <p>Adult (35+): {b.counts.adult}</p>}
              </div>
            </div>
            <div>
              <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Payment</p>
              <p className="text-[#6b7280] text-xs">
                {b.paymentStatus === "completed" ? "Paid" : b.paymentStatus === "within-week" ? "Paying this week" : "Other"}
              </p>
              {b.paymentStatus === "other" && b.paymentOther && (
                <p className="text-[#1a1a1a] text-xs mt-0.5 italic">{b.paymentOther}</p>
              )}
            </div>
            {b.notes && (
              <div className="col-span-2 sm:col-span-4 mt-3">
                <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Notes</p>
                <p className="text-[#6b7280] text-xs">{b.notes}</p>
              </div>
            )}
            {b.participants && b.participants.length > 0 && (
              <div className="col-span-2 sm:col-span-4 mt-3">
                <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-1">Experience</p>
                <div className="space-y-0.5">
                  {b.participants.map((p, i) => (
                    <p key={i} className="text-[#6b7280] text-xs">{p.name}{p.level ? ` — ${levelMap[p.level] ?? p.level}` : ""}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      {cancelled.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-[#6b7280] cursor-pointer select-none">
            {cancelled.length} cancelled booking{cancelled.length > 1 ? "s" : ""}
          </summary>
          <div className="mt-2 space-y-2">
            {cancelled.map((b) => (
              <div key={b.id} className="bg-[#faf9f6] border border-[#e4dfd5] rounded-[6px] px-5 py-3 opacity-50 text-sm">
                <span className="line-through">{b.name}</span> · {b.email} · {b.totalPeople} person{b.totalPeople > 1 ? "s" : ""}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ── storage helpers (Safari-safe, cookie-backed) ──────────────────────────────

function cookieGet(key: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(?:^|; )" + key + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : "";
}
function cookieSet(key: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
}
function cookieRemove(key: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${key}=; path=/; max-age=0`;
}

function storageGet(key: string): string {
  if (typeof window === "undefined") return "";
  try { const v = localStorage.getItem(key); if (v) return v; } catch {}
  try { const v = sessionStorage.getItem(key); if (v) return v; } catch {}
  return cookieGet(key);
}
function storageSet(key: string, value: string) {
  cookieSet(key, value); // always set cookie as reliable cross-browser fallback
  try { localStorage.setItem(key, value); } catch {}
  try { sessionStorage.setItem(key, value); } catch {}
}
function storageRemove(key: string) {
  cookieRemove(key);
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
}

// ── main component ─────────────────────────────────────────────────────────────

type View = "login" | "dashboard" | "add" | "edit" | "classes" | "bookings" | "interests" | "emailTemplates" | "settings";
type ExperienceLevel = { value: string; label: string };

function MoreMenu({ onManageClasses, onAllBookings, onInterests, onEmailTemplates, onSettings, onLogout, align = "left" }: { onManageClasses: () => void; onAllBookings: () => void; onInterests: () => void; onEmailTemplates: () => void; onSettings: () => void; onLogout: () => void; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-secondary flex items-center gap-2"
      >
        More
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className={`absolute ${align === "right" ? "left-0 md:left-auto md:right-0" : "left-0"} top-full mt-2 z-20 bg-white border border-[#e8e2d9] rounded-xl shadow-lg overflow-hidden min-w-[200px]`}>
            <button
              onClick={() => { setOpen(false); onAllBookings(); }}
              className="w-full text-left px-5 py-3.5 text-sm text-[#1a1a1a] hover:bg-[#faf9f6] transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Manage bookings
            </button>
            <div className="h-px bg-[#e8e2d9]" />
            <button
              onClick={() => { setOpen(false); onInterests(); }}
              className="w-full text-left px-5 py-3.5 text-sm text-[#1a1a1a] hover:bg-[#faf9f6] transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Registered interest
            </button>
            <div className="h-px bg-[#e8e2d9]" />
            <button
              onClick={() => { setOpen(false); onManageClasses(); }}
              className="w-full text-left px-5 py-3.5 text-sm text-[#1a1a1a] hover:bg-[#faf9f6] transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Manage classes
            </button>
            <div className="h-px bg-[#e8e2d9]" />
            <button
              onClick={() => { setOpen(false); onEmailTemplates(); }}
              className="w-full text-left px-5 py-3.5 text-sm text-[#1a1a1a] hover:bg-[#faf9f6] transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email templates
            </button>
            <div className="h-px bg-[#e8e2d9]" />
            <button
              onClick={() => { setOpen(false); onSettings(); }}
              className="w-full text-left px-5 py-3.5 text-sm text-[#1a1a1a] hover:bg-[#faf9f6] transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-[#006644] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <div className="h-px bg-[#e8e2d9]" />
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full text-left px-5 py-3.5 text-sm text-[#6b7280] hover:bg-[#faf9f6] transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4 text-[#6b7280] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── All Bookings view ─────────────────────────────────────────────────────────

type BookingWithSession = Booking & { sessionName: string; sessionDate: string; sessionTime: string };

// Parse "Saturday 4 July 2026" → Date (reuses MONTH_IDX already defined above)
function parseSessionDate(display: string): Date | null {
  const parts = display.split(" ");
  if (parts.length === 4) {
    const month = MONTH_IDX[parts[2]];
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[3], 10);
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

function AllBookingsView({ token, onBack, onManageClasses, onLogout }: { token: string; onBack: () => void; onManageClasses: () => void; onLogout: () => void }) {
  const [rows, setRows] = useState<BookingWithSession[]>([]);
  const [allSessions, setAllSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [kebabOpen, setKebabOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "declined" | "cancelled">("all");
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past">("upcoming");
  const [moveTarget, setMoveTarget] = useState<BookingWithSession | null>(null);
  const [moveSessionId, setMoveSessionId] = useState<string>("");
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState<string>("");
  const [levelMap, setLevelMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.experienceLevels?.length) {
          const map: Record<string, string> = {};
          for (const l of data.experienceLevels) map[l.value] = l.label;
          setLevelMap(map);
        }
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all sessions
      const sessRes = await authFetch("/api/sessions", token);
      const sessions: ClassSession[] = await sessRes.json();
      setAllSessions(Array.isArray(sessions) ? sessions : []);

      // Fetch bookings for each session in parallel
      const perSession = await Promise.all(
        sessions.map(async (s) => {
          const bRes = await authFetch(`/api/sessions/${s.id}`, token, { method: "PATCH" });
          const bookings: Booking[] = await bRes.json();
          return (Array.isArray(bookings) ? bookings : [])
            .map((b) => ({
              ...b,
              sessionName: s.sessionName || s.classLabel,
              sessionDate: s.date,
              sessionTime: s.time,
            }));
        })
      );

      // Flatten, sort: pending first, then by session date
      const all = perSession.flat().sort((a, b) => {
        const statusOrder = (s: string | undefined) => s === "pending" || !s ? 0 : 1;
        return statusOrder(a.status) - statusOrder(b.status);
      });
      setRows(all);
    } catch { /* silent */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function act(id: string, status: "confirmed" | "declined") {
    const verb = status === "confirmed" ? "Confirm" : "Decline";
    if (!confirm(`${verb} this booking?${status === "declined" ? " The spot will be returned." : ""}`)) return;
    setActing(id);
    setRows((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
    await authFetch(`/api/bookings/${id}`, token, { method: "PATCH", body: JSON.stringify({ status }) });
    setActing(null);
  }

  async function cancel(id: string) {
    if (!confirm("Cancel this booking? The spot will be returned.")) return;
    setActing(id);
    await authFetch(`/api/bookings/${id}`, token, { method: "DELETE" });
    await load();
    setActing(null);
  }

  async function permanentDelete(id: string) {
    if (!confirm("Permanently delete this record? This cannot be undone.")) return;
    setActing(id);
    await authFetch(`/api/bookings/${id}?permanent=true`, token, { method: "DELETE" });
    await load();
    setActing(null);
  }

  async function moveBooking() {
    if (!moveTarget || !moveSessionId) return;
    setMoving(true);
    setMoveError("");
    const res = await authFetch(`/api/bookings/${moveTarget.id}`, token, {
      method: "PATCH",
      body: JSON.stringify({ newSessionId: moveSessionId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMoveError(data.error ?? "Something went wrong");
      setMoving(false);
      return;
    }
    setMoveTarget(null);
    setMoveSessionId("");
    setMoving(false);
    await load();
  }

  function StatusBadge({ status }: { status?: string }) {
    if (status === "confirmed") return <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
    if (status === "declined") return <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-red-50 text-red-500 border border-red-200">Declined</span>;
    return <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const timeRows = rows.filter((b) => {
    const d = parseSessionDate(b.sessionDate);
    if (!d) return true; // can't parse → include in both
    return timeFilter === "upcoming" ? d >= today : d < today;
  });
  const pendingCount = timeRows.filter((b) => !b.status || b.status === "pending").length;
  const filtered = timeRows.filter((b) => {
    if (filter === "cancelled") return b.cancelled;
    if (filter === "all") return true;
    if (filter === "pending") return !b.cancelled && (!b.status || b.status === "pending");
    return !b.cancelled && b.status === filter;
  });

  return (
    <>
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#006644] text-sm mb-5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Admin dashboard
            </button>
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              All <em className="not-italic text-[#006644]">bookings</em>
            </h1>
          </div>
          <div className="flex items-center gap-4 pb-1 mt-12">
            <MoreMenu onManageClasses={onManageClasses} onAllBookings={() => {}} onInterests={() => {}} onEmailTemplates={() => {}} onSettings={() => {}} onLogout={onLogout} align="right" />
          </div>
        </div>
      </section>

      <section className="px-8 pt-8 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">

          {/* Move booking modal */}
          {moveTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm" onClick={() => { setMoveTarget(null); setMoveSessionId(""); setMoveError(""); }} />
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 z-10">
                <h2 className="text-lg font-semibold text-[#1a1a1a] mb-1" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                  Change class
                </h2>
                <p className="text-sm text-[#6b7280] mb-6">
                  Moving <strong>{moveTarget.name}</strong> ({moveTarget.totalPeople} {moveTarget.totalPeople === 1 ? "person" : "people"}) from <strong>{moveTarget.sessionName}</strong>.
                </p>
                <div className="relative mb-4">
                  <select
                    value={moveSessionId}
                    onChange={(e) => { setMoveSessionId(e.target.value); setMoveError(""); }}
                    className="w-full border border-[#e4dfd5] rounded-lg px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#006644] bg-white appearance-none cursor-pointer pr-10"
                  >
                    <option value="">Select a class…</option>
                    {allSessions
                      .filter((s) => s.id !== moveTarget.sessionId && s.spotsLeft >= moveTarget.totalPeople)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.sessionName || s.classLabel} — {s.date} ({s.spotsLeft} spots left)
                        </option>
                      ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {moveError && <p className="text-xs text-red-500 mb-4">{moveError}</p>}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={moveBooking}
                    disabled={!moveSessionId || moving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {moving ? "Moving…" : "Change booking"}
                  </button>
                  <button
                    onClick={() => { setMoveTarget(null); setMoveSessionId(""); setMoveError(""); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming / Past toggle + pending badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className="inline-flex gap-1 bg-[#f0ece4] rounded-full p-1">
              {(["upcoming", "past"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer select-none ${
                    timeFilter === t
                      ? "bg-white text-[#1a1a1a] shadow-sm"
                      : "text-[#6b7280] hover:text-[#1a1a1a]"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {([
                { key: "all",       label: "All"       },
                { key: "pending",   label: "Pending"   },
                { key: "confirmed", label: "Confirmed" },
                { key: "declined",  label: "Declined"  },
                { key: "cancelled", label: "Cancelled" },
              ] as { key: typeof filter; label: string }[]).map(({ key: f, label }) => {
              const count = f === "all" ? timeRows.length
                : f === "cancelled" ? timeRows.filter((b) => b.cancelled).length
                : f === "pending" ? timeRows.filter((b) => !b.cancelled && (!b.status || b.status === "pending")).length
                : timeRows.filter((b) => !b.cancelled && b.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-full border transition-colors duration-200 cursor-pointer select-none ${
                    filter === f
                      ? "bg-[#006644] border-[#006644] text-white"
                      : "bg-white border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="text-[#6b7280] text-sm">Loading bookings…</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6b7280]">{filter === "all" ? `No ${timeFilter} bookings.` : `No ${filter} ${timeFilter} bookings.`}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((b) => (
                <div key={b.id} className="bg-white border border-[#e8e2d9] rounded-xl overflow-hidden">
                  {/* Session label */}
                  <div className="px-5 pt-4 pb-3 border-b border-[#f0ece4] flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold text-[#006644] tracking-widest uppercase mb-0.5">{b.sessionName}</p>
                      <p className="text-xs text-[#6b7280]">{b.sessionDate}{b.sessionTime ? ` · ${b.sessionTime}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {b.cancelled
                        ? <span className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 rounded-full bg-[#f5f2ed] text-[#6b7280] border border-[#e4dfd5]">Cancelled</span>
                        : <StatusBadge status={b.status} />
                      }
                      {/* Confirm/Decline inline for pending */}
                      {(!b.cancelled && (!b.status || b.status === "pending")) && (
                        <div className="flex gap-2">
                          <button onClick={() => act(b.id, "confirmed")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#006644] text-white rounded-full hover:bg-[#004d33] transition-colors">
                            ✓ Confirm
                          </button>
                          <button onClick={() => act(b.id, "declined")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-[#6b7280] border border-[#e4dfd5] rounded-full hover:border-red-300 hover:text-red-500 transition-colors">
                            ✗ Decline
                          </button>
                        </div>
                      )}
                      {/* Kebab menu — all bookings */}
                      <div className="relative">
                          <button
                            onClick={() => setKebabOpen(kebabOpen === b.id ? null : b.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f0ece4] text-[#6b7280] transition-colors cursor-pointer"
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="2.5" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13.5" r="1.5"/>
                            </svg>
                          </button>
                          {kebabOpen === b.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setKebabOpen(null)} />
                              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[#e8e2d9] rounded-xl shadow-lg overflow-hidden min-w-[160px]">
                                {!b.cancelled && (
                                <>
                                  <button onClick={() => { setKebabOpen(null); setMoveTarget(b); setMoveSessionId(""); setMoveError(""); }} className="w-full text-left px-4 py-3 text-sm text-[#1a1a1a] hover:bg-[#faf9f6] transition-colors">
                                    Change class
                                  </button>
                                  <div className="h-px bg-[#e8e2d9]" />
                                </>
                              )}
                              {(!b.cancelled && b.status === "confirmed") && (<>
                                  <button onClick={() => { setKebabOpen(null); cancel(b.id); }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                    Cancel booking
                                  </button>
                                  <div className="h-px bg-[#e8e2d9]" />
                                </>)}
                                {(b.cancelled || b.status === "declined") && (
                                  <button onClick={() => { setKebabOpen(null); permanentDelete(b.id); }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                    Delete record
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Booking details */}
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-medium text-[#1a1a1a]">{b.name}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm">

                      <div>
                        <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Email</p>
                        <p className="text-[#6b7280] break-all text-xs">{b.email}</p>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Phone</p>
                        <p className="text-[#6b7280] text-xs">{b.phone}</p>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Attendees</p>
                        <p className="text-[#1a1a1a] font-medium text-xs">{b.totalPeople} total</p>
                        <div className="text-[#6b7280] text-xs mt-0.5 space-y-0.5">
                          {b.counts?.child > 0 && <p>Child: {b.counts.child}</p>}
                          {b.counts?.youngAdult > 0 && <p>Young Adult: {b.counts.youngAdult}</p>}
                          {b.counts?.adult > 0 && <p>Adult: {b.counts.adult}</p>}
                        </div>
                      </div>
                      <div>
                        <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Payment</p>
                        <p className="text-[#6b7280] text-xs">
                          {b.paymentStatus === "completed" ? "Paid" : b.paymentStatus === "within-week" ? "Paying this week" : "Other"}
                        </p>
                        {b.paymentStatus === "other" && b.paymentOther && (
                          <p className="text-[#1a1a1a] text-xs mt-0.5 italic">{b.paymentOther}</p>
                        )}
                      </div>
                      {b.notes && (
                        <div className="col-span-2 sm:col-span-4 mt-3">
                          <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Notes</p>
                          <p className="text-[#6b7280] text-xs">{b.notes}</p>
                        </div>
                      )}
                      {b.participants && b.participants.length > 0 && (
                        <div className="col-span-2 sm:col-span-4 mt-3">
                          <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-1">Experience</p>
                          <div className="space-y-0.5">
                            {b.participants.map((p, i) => (
                              <p key={i} className="text-[#6b7280] text-xs">{p.name}{p.level ? ` — ${levelMap[p.level] ?? p.level}` : ""}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── Interest entry type ───────────────────────────────────────────────────────

type InterestEntry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  classes: string[];
  notes: string;
  createdAt: string;
  status: "pending" | "confirmed" | "declined";
  actionedAt?: string;
};

const EXP_LABELS: Record<string, string> = {
  complete_beginner: "Complete beginner",
  some_experience: "Some experience",
  confident_cook: "Confident cook",
};

function InterestsView({ token, onBack, onAllBookings, onManageClasses, onLogout }: { token: string; onBack: () => void; onAllBookings: () => void; onManageClasses: () => void; onLogout: () => void }) {
  const [interests, setInterests] = useState<InterestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/interest", token);
      const data = await res.json();
      setInterests(Array.isArray(data) ? data : []);
    } catch { /* keep showing */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function deleteEntry(id: string) {
    setDeleting(id);
    try {
      await authFetch(`/api/interest/${id}`, token, { method: "DELETE" });
      setInterests((prev) => prev.filter((e) => e.id !== id));
    } catch { /* silent */ }
    setDeleting(null);
    setDeleteConfirm(null);
  }

  return (
    <>
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#006644] text-sm mb-5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Admin dashboard
            </button>
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Interest <em className="not-italic text-[#006644]">registrations</em>
            </h1>
          </div>
          <div className="flex items-center gap-4 pb-1 mt-12">
            <MoreMenu onManageClasses={onManageClasses} onAllBookings={onAllBookings} onInterests={() => {}} onEmailTemplates={() => {}} onSettings={() => {}} onLogout={onLogout} align="right" />
          </div>
        </div>
      </section>

      <section className="px-8 pt-8 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">
          {!loading && interests.length > 0 && (
            <p className="text-sm text-[#6b7280] mb-6">{interests.length} {interests.length === 1 ? "registration" : "registrations"}</p>
          )}

          {loading ? (
            <p className="text-[#6b7280] text-sm">Loading registrations…</p>
          ) : interests.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6b7280]">No interest registrations yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interests.map((e) => (
                <div key={e.id} className="bg-white border border-[#e8e2d9] rounded-xl overflow-hidden">
                  <div className="px-6 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <p className="font-semibold text-[#1a1a1a] text-base mb-1" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>{e.name}</p>
                        <p className="text-xs text-[#6b7280]">
                          {new Date(e.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm mb-4">
                      <div>
                        <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-0.5">Email</p>
                        <a href={`mailto:${e.email}`} className="text-[#1a1a1a] hover:text-[#006644] transition-colors break-all">{e.email}</a>
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-0.5">Phone</p>
                        <p className="text-[#1a1a1a]">{e.phone}</p>
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-0.5">Experience</p>
                        <p className="text-[#6b7280]">{EXP_LABELS[e.experience] ?? e.experience ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-0.5">Classes</p>
                        <p className="text-[#6b7280]">{Array.isArray(e.classes) && e.classes.length ? e.classes.join(", ") : "None selected"}</p>
                      </div>
                      {e.notes && (
                        <div className="col-span-2 sm:col-span-4">
                          <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#006644] mb-0.5">Notes</p>
                          <p className="text-[#6b7280] text-xs italic">{e.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#e8e2d9]">
                      {deleteConfirm === e.id ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="text-sm text-[#1a1a1a]">Delete this record permanently?</p>
                          <button
                            onClick={() => deleteEntry(e.id)}
                            disabled={deleting === e.id}
                            className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                          >
                            {deleting === e.id ? "Deleting…" : "Yes, delete"}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(e.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-[#6b7280] hover:text-red-500 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete record
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── Email Templates ──────────────────────────────────────────────────────────

type TemplateField = { key: string; label: string; hint: string };

const TEMPLATE_DEFS: {
  key: string;
  title: string;
  description: string;
  subjectHint: string;
  fields: TemplateField[];
}[] = [
  {
    key: "booking_request",
    title: "Reservation request received",
    description: "Sent to the customer when they submit a booking request.",
    subjectHint: "Available: {{sessionName}}",
    fields: [
      { key: "note", label: "Note paragraph", hint: "Appears after the session details. Available: {{name}}, {{sessionName}}, {{sessionDate}}" },
      { key: "closing", label: "Closing paragraph", hint: "Final note before the sign-off." },
    ],
  },
  {
    key: "booking_confirmed",
    title: "Booking confirmed",
    description: "Sent when you confirm a booking request.",
    subjectHint: "Available: {{sessionName}}",
    fields: [
      { key: "details", label: "Details paragraph", hint: "Appears after the confirmation. Available: {{name}}, {{sessionName}}, {{sessionDate}}" },
    ],
  },
  {
    key: "booking_declined",
    title: "Booking declined",
    description: "Sent when you decline a booking request.",
    subjectHint: "Available: {{sessionName}}",
    fields: [
      { key: "reason", label: "Reason paragraph", hint: "Why the booking was declined." },
      { key: "invite", label: "Invite paragraph", hint: "Encouragement to rebook." },
    ],
  },
  {
    key: "booking_cancelled",
    title: "Booking cancelled",
    description: "Sent when you cancel an existing booking.",
    subjectHint: "Available: {{sessionName}}",
    fields: [
      { key: "release", label: "Release paragraph", hint: "Explains the spot release. Available: {{name}}, {{sessionName}}, {{sessionDate}}" },
      { key: "future", label: "Future paragraph", hint: "Encouragement to find another session." },
    ],
  },
  {
    key: "interest_received",
    title: "Interest registration received",
    description: "Sent when someone submits the register interest form.",
    subjectHint: "Available: {{classes}}",
    fields: [
      { key: "next_steps", label: "Next steps paragraph", hint: "What happens next. Available: {{name}}, {{classes}}" },
    ],
  },
];

function EmailTemplatesView({ token, onBack, onAllBookings, onInterests, onManageClasses, onSettings, onLogout }: { token: string; onBack: () => void; onAllBookings: () => void; onInterests: () => void; onManageClasses: () => void; onSettings: () => void; onLogout: () => void }) {
  const [templates, setTemplates] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [active, setActive] = useState(TEMPLATE_DEFS[0].key);

  useEffect(() => {
    authFetch("/api/email-templates", token)
      .then((r) => r.json())
      .then((data) => { setTemplates(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  function update(templateKey: string, fieldKey: string, value: string) {
    setTemplates((prev) => ({
      ...prev,
      [templateKey]: { ...(prev[templateKey] ?? {}), [fieldKey]: value },
    }));
  }

  async function save(templateKey: string) {
    setSaving(templateKey);
    try {
      await authFetch("/api/email-templates", token, {
        method: "PATCH",
        body: JSON.stringify({ [templateKey]: templates[templateKey] }),
      });
      setSaved(templateKey);
      setTimeout(() => setSaved(null), 2000);
    } catch { /* silent */ }
    setSaving(null);
  }

  const activeDef = TEMPLATE_DEFS.find((d) => d.key === active)!;
  const activeData = templates[active] ?? {};

  return (
    <>
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <button onClick={onBack} className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#006644] text-sm mb-5 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Admin dashboard
            </button>
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Email <em className="not-italic text-[#006644]">templates</em>
            </h1>
          </div>
          <div className="flex items-center gap-4 pb-1 mt-12">
            <MoreMenu onManageClasses={onManageClasses} onAllBookings={onAllBookings} onInterests={onInterests} onEmailTemplates={() => {}} onSettings={onSettings} onLogout={onLogout} align="right" />
          </div>
        </div>
      </section>

      <section className="px-8 pt-8 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

          {/* Sidebar nav */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white border border-[#e8e2d9] rounded-xl overflow-hidden">
              {TEMPLATE_DEFS.map((def, i) => (
                <button
                  key={def.key}
                  onClick={() => setActive(def.key)}
                  className={`w-full text-left px-5 py-4 text-sm transition-colors flex items-center gap-3 ${i > 0 ? "border-t border-[#e8e2d9]" : ""} ${active === def.key ? "bg-[#006644]/5 text-[#006644] font-medium" : "text-[#1a1a1a] hover:bg-[#faf9f6]"}`}
                >
                  <svg className={`w-3.5 h-3.5 shrink-0 ${active === def.key ? "text-[#006644]" : "text-[#9ca3af]"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {def.title}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <p className="text-[#6b7280] text-sm">Loading templates…</p>
            ) : (
              <div className="bg-white border border-[#e8e2d9] rounded-xl p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-[#1a1a1a] mb-1" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>{activeDef.title}</h2>
                  <p className="text-sm text-[#6b7280]">{activeDef.description}</p>
                </div>

                <div className="space-y-6">
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#006644] mb-2">Subject line</label>
                    <input
                      type="text"
                      value={activeData.subject ?? ""}
                      onChange={(e) => update(active, "subject", e.target.value)}
                      className="w-full border border-[#e4dfd5] rounded-lg px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#006644] bg-white transition-colors"
                    />
                    <p className="text-xs text-[#9ca3af] mt-1.5">{activeDef.subjectHint}</p>
                  </div>

                  {/* Body fields */}
                  {activeDef.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#006644] mb-2">{field.label}</label>
                      <textarea
                        rows={4}
                        value={activeData[field.key] ?? ""}
                        onChange={(e) => update(active, field.key, e.target.value)}
                        className="w-full border border-[#e4dfd5] rounded-lg px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#006644] bg-white transition-colors resize-y"
                      />
                      <p className="text-xs text-[#9ca3af] mt-1.5">{field.hint}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={() => save(active)}
                    disabled={saving === active}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saving === active ? "Saving…" : "Save changes"}
                  </button>
                  {saved === active && (
                    <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────────

function SettingsView({ token, onBack, onAllBookings, onInterests, onManageClasses, onEmailTemplates, onLogout }: { token: string; onBack: () => void; onAllBookings: () => void; onInterests: () => void; onManageClasses: () => void; onEmailTemplates: () => void; onLogout: () => void }) {
  const [levels, setLevels] = useState<ExperienceLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const DEFAULT_LEVELS: ExperienceLevel[] = [
    { value: "beginner", label: "New to cooking — please guide me through everything" },
    { value: "intermediate", label: "Some experience — happy to receive tips along the way" },
    { value: "expert", label: "Confident cook — only step in if I ask" },
  ];

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setLevels(data.experienceLevels?.length ? data.experienceLevels : DEFAULT_LEVELS);
        setLoading(false);
      })
      .catch(() => { setLevels(DEFAULT_LEVELS); setLoading(false); });
  }, []);

  function updateLevel(i: number, field: "value" | "label", val: string) {
    setLevels((prev) => prev.map((l, j) => j === i ? { ...l, [field]: val } : l));
    setSaved(false);
  }

  function addLevel() {
    setLevels((prev) => [...prev, { value: `level_${Date.now()}`, label: "" }]);
    setSaved(false);
  }

  function removeLevel(i: number) {
    setLevels((prev) => prev.filter((_, j) => j !== i));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      await authFetch("/api/settings", token, {
        method: "PATCH",
        body: JSON.stringify({ experienceLevels: levels }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* silent */ }
    setSaving(false);
  }

  const inputCls = "w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors";

  return (
    <>
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <button onClick={onBack} className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#006644] text-sm mb-5 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              Admin dashboard
            </button>
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Site <em className="not-italic text-[#006644]">settings</em>
            </h1>
          </div>
          <div className="flex items-center gap-4 pb-1 mt-12">
            <MoreMenu onManageClasses={onManageClasses} onAllBookings={onAllBookings} onInterests={onInterests} onEmailTemplates={onEmailTemplates} onSettings={() => {}} onLogout={onLogout} align="right" />
          </div>
        </div>
      </section>

      <section className="px-8 pt-8 pb-24 bg-[#faf9f6]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-[#e8e2d9] rounded-xl p-8">
            <h2 className="text-lg font-semibold text-[#1a1a1a] mb-1" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Experience level options
            </h2>
            <p className="text-sm text-[#6b7280] mb-8">
              These options appear in the booking form&apos;s Experience section, letting each participant describe how much guidance they&apos;d like.
            </p>

            {loading ? (
              <p className="text-[#6b7280] text-sm">Loading…</p>
            ) : (
              <div className="space-y-4">
                {levels.map((l, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={l.label}
                        onChange={(e) => updateLevel(i, "label", e.target.value)}
                        placeholder="Option label shown to customer…"
                        className={inputCls}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLevel(i)}
                      disabled={levels.length <= 1}
                      className="mt-3 text-[#6b7280] hover:text-red-500 transition-colors disabled:opacity-30"
                      title="Remove option"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLevel}
                  className="inline-flex items-center gap-2 text-sm text-[#006644] font-medium hover:text-[#004d33] transition-colors mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add option
                </button>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="btn-primary disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                  {saved && <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState<string>("");
  const [view, setView] = useState<View>("login");

  // Hydrate token from storage after mount to avoid SSR/client mismatch
  useEffect(() => {
    const stored = storageGet("ib_admin_token");
    if (stored) {
      setToken(stored);
      setView("dashboard");
    }
  }, []);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<ClassSession | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [classConfigs, setClassConfigs] = useState<ClassConfig[]>(DEFAULT_CLASS_CONFIGS);
  const [savedClassConfigs, setSavedClassConfigs] = useState<ClassConfig[]>(DEFAULT_CLASS_CONFIGS);
  const [classConfigsLoading, setClassConfigsLoading] = useState(false);
  const [savingClass, setSavingClass] = useState<string | null>(null);
  const [unsavedWarning, setUnsavedWarning] = useState(false);
  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState<Omit<ClassConfig, "key">>({ title: "", ages: "", imageUrl: "", description: "" });
  const [savingNewClass, setSavingNewClass] = useState(false);
  const [deletingClass, setDeletingClass] = useState<string | null>(null);
  const [deleteClassConfirm, setDeleteClassConfirm] = useState<string | null>(null);
  const [classKebabOpen, setClassKebabOpen] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/sessions", token);
      if (res.status === 401) {
        // Stale token — clear everything and go back to login
        storageRemove("ib_admin_token");
        setToken("");
        setView("login");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch { /* network error — keep showing what we have */ }
    setLoading(false);
  }, [token]);

  const loadClassConfigs = useCallback(async () => {
    setClassConfigsLoading(true);
    try {
      const res = await fetch("/api/classconfigs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setClassConfigs(data);
        setSavedClassConfigs(data);
      }
    } catch { /* fall back to defaults */ }
    setClassConfigsLoading(false);
  }, []);

  const loadPendingCount = useCallback(async () => {
    try {
      const res = await authFetch("/api/bookings", token);
      if (!res.ok) return;
      const data = await res.json() as Booking[];
      const count = data.filter((b) => !b.cancelled && (!b.status || b.status === "pending")).length;
      setPendingCount(count);
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    if (view === "dashboard" && token) { loadSessions(); loadPendingCount(); }
  }, [view, token, loadSessions, loadPendingCount]);

  useEffect(() => {
    if (view === "classes" && token) loadClassConfigs();
  }, [view, token, loadClassConfigs]);

  async function doLogin() {
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("Incorrect password.");
        return;
      }
      const { token: t } = await res.json();
      storageSet("ib_admin_token", t);
      setToken(t);
      setView("dashboard");
    } catch {
      setLoginError("Connection error. Please try again.");
    }
  }

  // Sync wrapper so e.preventDefault() fires before any async work (Safari-safe)
  function login(e: React.FormEvent) {
    e.preventDefault();
    doLogin();
  }

  function logout() {
    storageRemove("ib_admin_token");
    setToken("");
    setView("login");
    setSessions([]);
  }

  async function saveSession(form: FormState, attendeeTypes: Array<"child" | "youngAdult" | "adult">) {
    setSaving(true);
    const payload = {
      classLabel: form.classLabel,
      sessionName: form.sessionName,
      date: form.date,
      time: form.time,
      location: form.location,
      price: Number(form.price),
      maxSpots: Number(form.maxSpots),
      ages: form.ages,
      description: form.description,
      imageUrl: form.imageUrl,
      attendeeTypes,
    };

    if (view === "edit" && editTarget) {
      // When editing, adjust spotsLeft by the delta in maxSpots
      const delta = payload.maxSpots - editTarget.maxSpots;
      await authFetch(`/api/sessions/${editTarget.id}`, token, {
        method: "PUT",
        body: JSON.stringify({ ...payload, spotsLeft: editTarget.spotsLeft + delta }),
      });
    } else {
      await authFetch("/api/sessions", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);
    setView("dashboard");
    setEditTarget(null);
  }

  async function deleteSession(id: string) {
    await authFetch(`/api/sessions/${id}`, token, { method: "DELETE" });
    setDeleteConfirm(null);
    await loadSessions();
  }

  async function saveClassConfigItem(config: ClassConfig) {
    setSavingClass(config.key);
    await authFetch("/api/classconfigs", token, {
      method: "POST",
      body: JSON.stringify(config),
    });
    // Mark this card as saved
    setSavedClassConfigs((prev) =>
      prev.map((c) => c.key === config.key ? { ...config } : c)
    );
    setSavingClass(null);
  }

  function isClassDirty(key: string): boolean {
    const current = classConfigs.find((c) => c.key === key);
    const saved = savedClassConfigs.find((c) => c.key === key);
    if (!current || !saved) return false;
    return JSON.stringify(current) !== JSON.stringify(saved);
  }

  function hasAnyUnsaved(): boolean {
    return classConfigs.some((c) => isClassDirty(c.key));
  }

  function revertClassConfig(key: string) {
    const saved = savedClassConfigs.find((c) => c.key === key);
    if (!saved) return;
    setClassConfigs((prev) =>
      prev.map((c) => c.key === key ? { ...saved } : c)
    );
  }

  async function saveNewClass() {
    if (!newClass.title.trim()) return;
    setSavingNewClass(true);
    const key = newClass.title.trim();
    const config: ClassConfig = { key, ...newClass };
    await authFetch("/api/classconfigs", token, {
      method: "POST",
      body: JSON.stringify(config),
    });
    // Refresh the list from server
    const res = await fetch("/api/classconfigs");
    const data = await res.json();
    if (Array.isArray(data)) { setClassConfigs(data); setSavedClassConfigs(data); }
    setNewClass({ title: "", ages: "", imageUrl: "", description: "" });
    setAddingClass(false);
    setSavingNewClass(false);
  }

  async function deleteCustomClass(key: string) {
    setDeletingClass(key);
    await authFetch("/api/classconfigs", token, {
      method: "DELETE",
      body: JSON.stringify({ key }),
    });
    const res = await fetch("/api/classconfigs");
    const data = await res.json();
    if (Array.isArray(data)) { setClassConfigs(data); setSavedClassConfigs(data); }
    setDeletingClass(null);
  }

  async function restoreDefaultClass(key: string) {
    setDeletingClass(key);
    await authFetch("/api/classconfigs", token, {
      method: "DELETE",
      body: JSON.stringify({ key, restore: true }),
    });
    const res = await fetch("/api/classconfigs");
    const data = await res.json();
    if (Array.isArray(data)) { setClassConfigs(data); setSavedClassConfigs(data); }
    setDeletingClass(null);
  }

  const DEFAULT_CLASS_KEYS = new Set(DEFAULT_CLASS_CONFIGS.map((d) => d.key));

  function updateClassConfig(key: string, field: keyof ClassConfig, value: string) {
    setClassConfigs((prev) =>
      prev.map((c) => c.key === key ? { ...c, [field]: value } : c)
    );
  }

  // ── Login ────────────────────────────────────────────────

  if (view === "login") {
    return (
      <>
        <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Admin <em className="not-italic text-[#006644]">portal</em>
            </h1>
            <p className="text-[#6b7280] text-sm leading-relaxed max-w-xs md:text-right pb-1">Imperfect Bakers</p>
          </div>
        </section>
        <section className="px-8 pt-14 pb-32 bg-[#faf9f6]">
          <div className="max-w-sm">
            <form onSubmit={login} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-2">Password</label>
                <div className="flex flex-col gap-6 sm:flex-row sm:gap-3 sm:items-center">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doLogin()}
                    autoComplete="current-password"
                    autoFocus
                    className="w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm focus:outline-none focus:border-[#006644] bg-white"
                  />
                  <button type="button" onClick={doLogin} className="btn-primary justify-center shrink-0">Sign in</button>
                </div>
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            </form>
          </div>
        </section>
      </>
    );
  }

  // ── Add / Edit ───────────────────────────────────────────

  if (view === "add" || view === "edit") {
    const initial: FormState = editTarget
      ? {
          classLabel: editTarget.classLabel,
          sessionName: editTarget.sessionName ?? "",
          date: editTarget.date,
          time: editTarget.time,
          location: editTarget.location,
          price: String(editTarget.price),
          maxSpots: String(editTarget.maxSpots),
          ages: editTarget.ages,
          description: editTarget.description ?? "",
          imageUrl: editTarget.imageUrl ?? "",
        }
      : emptyForm;

    return (
      <>
        <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <button
                onClick={() => { setView("dashboard"); setEditTarget(null); }}
                className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#006644] text-sm mb-5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Admin dashboard
              </button>
              <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                {view === "edit" ? <><em className="not-italic text-[#006644]">Edit</em> session</> : <>New <em className="not-italic text-[#006644]">session</em></>}
              </h1>
            </div>
          </div>
        </section>
        <section className="px-8 pt-10 pb-24 bg-[#faf9f6]">
          <div className="max-w-2xl mx-auto">
            <SessionForm
              initial={initial}
              initialAttendeeTypes={editTarget?.attendeeTypes ?? ["child", "youngAdult", "adult"]}
              onSave={saveSession}
              onCancel={() => { setView("dashboard"); setEditTarget(null); }}
              saving={saving}
            />
          </div>
        </section>
      </>
    );
  }

  // ── All Bookings ─────────────────────────────────────────

  if (view === "bookings") {
    return <AllBookingsView token={token} onBack={() => setView("dashboard")} onManageClasses={() => setView("classes")} onLogout={logout} />;
  }

  if (view === "interests") {
    return <InterestsView token={token} onBack={() => setView("dashboard")} onAllBookings={() => setView("bookings")} onManageClasses={() => setView("classes")} onLogout={logout} />;
  }

  if (view === "emailTemplates") {
    return <EmailTemplatesView token={token} onBack={() => setView("dashboard")} onAllBookings={() => setView("bookings")} onInterests={() => setView("interests")} onManageClasses={() => setView("classes")} onSettings={() => setView("settings")} onLogout={logout} />;
  }

  if (view === "settings") {
    return <SettingsView token={token} onBack={() => setView("dashboard")} onAllBookings={() => setView("bookings")} onInterests={() => setView("interests")} onManageClasses={() => setView("classes")} onEmailTemplates={() => setView("emailTemplates")} onLogout={logout} />;
  }

  // ── Classes ──────────────────────────────────────────────

  if (view === "classes") {
    const inputCls = "w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors";
    const labelCls = "block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-4";

    function tryGoBack() {
      if (hasAnyUnsaved()) {
        setUnsavedWarning(true);
      } else {
        setView("dashboard");
      }
    }

    return (
      <>
        {/* ── Delete class confirmation modal ── */}
        {deleteClassConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 z-10">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1a1a1a] text-center mb-2" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Delete class?
              </h2>
              <p className="text-sm text-[#6b7280] text-center mb-8 leading-relaxed">
                {DEFAULT_CLASS_KEYS.has(deleteClassConfirm)
                  ? "This will hide the class from your public website. You can restore it at any time."
                  : "This will permanently remove the class. This action cannot be undone."}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    const key = deleteClassConfirm;
                    setDeleteClassConfirm(null);
                    await deleteCustomClass(key);
                  }}
                  disabled={deletingClass === deleteClassConfirm}
                  className="w-full py-3 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deletingClass === deleteClassConfirm ? "Deleting…" : "Yes, delete class"}
                </button>
                <button
                  onClick={() => setDeleteClassConfirm(null)}
                  className="w-full py-3 rounded-full border border-[#e4dfd5] text-sm text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Unsaved changes modal ── */}
        {unsavedWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="fixed inset-0 bg-[#1a1a1a]/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 z-10">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1a1a1a] text-center mb-2" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Unsaved changes
              </h2>
              <p className="text-sm text-[#6b7280] text-center mb-8 leading-relaxed">
                You have unsaved changes. If you leave now, your edits will be lost.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setUnsavedWarning(false); setView("dashboard"); setClassConfigs(savedClassConfigs); }}
                  className="w-full py-3 rounded-full bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#333] transition-colors"
                >
                  Leave without saving
                </button>
                <button
                  onClick={() => setUnsavedWarning(false)}
                  className="w-full py-3 rounded-full border border-[#e4dfd5] text-sm text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644] transition-colors"
                >
                  Stay and keep editing
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <button
                onClick={tryGoBack}
                className="inline-flex items-center gap-2 text-[#6b7280] hover:text-[#006644] text-sm mb-5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Admin dashboard
              </button>
              <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Manage <em className="not-italic text-[#006644]">classes</em>
              </h1>
            </div>
            <div className="flex items-center gap-4 pb-1 mt-12">
              <button onClick={() => setAddingClass(true)} className="btn-primary group">
                New class <span>+</span>
              </button>
              <MoreMenu onManageClasses={() => {}} onAllBookings={() => setView("bookings")} onInterests={() => setView("interests")} onEmailTemplates={() => setView("emailTemplates")} onSettings={() => setView("settings")} onLogout={logout} align="right" />
            </div>
          </div>
        </section>

        <section className="px-8 pt-10 pb-24 bg-[#faf9f6]">
          <div className="max-w-7xl mx-auto">
            {/* ── Add new class form ── */}
            {addingClass && (
              <div className="bg-white border border-[#006644] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644]">New class</span>
                  <button onClick={() => { setAddingClass(false); setNewClass({ title: "", ages: "", imageUrl: "", description: "" }); }} className="text-[#6b7280] hover:text-[#1a1a1a] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Title</label>
                      <input type="text" value={newClass.title} onChange={(e) => setNewClass((n) => ({ ...n, title: e.target.value }))} placeholder="e.g. Bread Baking" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tag</label>
                      <input type="text" value={newClass.ages} onChange={(e) => setNewClass((n) => ({ ...n, ages: e.target.value }))} placeholder="All ages" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Image URL</label>
                    <input type="text" value={newClass.imageUrl} onChange={(e) => setNewClass((n) => ({ ...n, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/…" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea value={newClass.description} onChange={(e) => setNewClass((n) => ({ ...n, description: e.target.value }))} rows={2} placeholder="Short description…" className={inputCls + " resize-none"} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button onClick={saveNewClass} disabled={savingNewClass || !newClass.title.trim()} className="btn-primary">
                      {savingNewClass ? "Saving…" : "Save class"}
                    </button>
                    <button onClick={() => { setAddingClass(false); setNewClass({ title: "", ages: "", imageUrl: "", description: "" }); }} className="btn-secondary">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {classConfigsLoading ? (
              <p className="text-[#6b7280] text-sm">Loading classes…</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classConfigs.map((c) => (
                  <div key={c.key} className={`bg-white border rounded-xl overflow-hidden ${c.hidden ? "border-[#e8e2d9] opacity-60" : "border-[#e8e2d9]"}`}>
                    {/* Image preview */}
                    <div
                      className="h-40 bg-cover bg-center relative"
                      style={{ backgroundImage: `url('${c.imageUrl}')` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-5">
                        <p className="text-[0.6875rem] tracking-[0.2em] font-semibold text-white/60 uppercase mb-1">{c.ages}</p>
                        <p className="text-white font-semibold text-lg leading-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>{c.title}</p>
                      </div>
                      {/* Kebab menu */}
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={() => setClassKebabOpen(classKebabOpen === c.key ? null : c.key)}
                          className="w-8 h-8 rounded-full bg-[#1a1a1a]/40 hover:bg-[#1a1a1a]/60 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>
                        {classKebabOpen === c.key && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setClassKebabOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-[#e8e2d9] rounded-xl shadow-lg overflow-hidden min-w-[160px]">
                              {c.hidden ? (
                                <button
                                  onClick={() => { setClassKebabOpen(null); restoreDefaultClass(c.key); }}
                                  className="w-full text-left px-4 py-3 text-sm text-[#006644] hover:bg-[#faf9f6] transition-colors"
                                >
                                  Restore class
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setClassKebabOpen(null); setDeleteClassConfirm(c.key); }}
                                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="p-6 space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelCls}>Title</label>
                          <input
                            type="text"
                            value={c.title}
                            onChange={(e) => updateClassConfig(c.key, "title", e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Tag</label>
                          <input
                            type="text"
                            value={c.ages}
                            onChange={(e) => updateClassConfig(c.key, "ages", e.target.value)}
                            placeholder="All ages"
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Image URL</label>
                        <input
                          type="text"
                          value={c.imageUrl}
                          onChange={(e) => updateClassConfig(c.key, "imageUrl", e.target.value)}
                          placeholder="https://images.unsplash.com/…"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Description</label>
                        <textarea
                          value={c.description}
                          onChange={(e) => updateClassConfig(c.key, "description", e.target.value)}
                          rows={2}
                          className={inputCls + " resize-none"}
                        />
                      </div>
                    </div>

                    {/* Save / Revert actions */}
                    {!c.hidden && (
                      <div className="px-6 pb-5 flex flex-wrap items-center justify-end gap-3">
                        <button
                          onClick={() => saveClassConfigItem(c)}
                          disabled={savingClass === c.key}
                          className="btn-primary"
                        >
                          {savingClass === c.key ? "Saving…" : "Save changes"}
                        </button>
                        {isClassDirty(c.key) && (
                          <button onClick={() => revertClassConfig(c.key)} className="btn-secondary">
                            Revert
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </>
    );
  }

  // ── Dashboard ────────────────────────────────────────────

  const totalBookings = sessions.reduce((acc, s) => acc + Math.max(0, s.maxSpots - s.spotsLeft), 0);
  const totalRevenue = sessions.reduce((acc, s) => acc + Math.max(0, s.maxSpots - s.spotsLeft) * s.price, 0);

  return (
    <>
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
          <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
            Admin <em className="not-italic text-[#006644]">dashboard</em>
          </h1>
          <div className="flex flex-wrap items-center gap-4 pb-1 mt-6 lg:mt-0 lg:ml-auto">
            <button onClick={() => setView("add")} className="btn-primary group">
              Add session <span>+</span>
            </button>
            <MoreMenu onManageClasses={() => setView("classes")} onAllBookings={() => setView("bookings")} onInterests={() => setView("interests")} onEmailTemplates={() => setView("emailTemplates")} onSettings={() => setView("settings")} onLogout={logout} align="right" />
          </div>
        </div>
      </section>

      {/* ── Pending bookings alert ── */}
      {pendingCount > 0 && (
        <div className="bg-[#fff8e6] border-b border-[#f5e0a0]">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#f5a623] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[#7a4f00] flex-1">
              <span className="font-bold">{pendingCount} pending {pendingCount === 1 ? "request" : "requests"}</span>
            </p>
            <button
              onClick={() => setView("bookings")}
              className="shrink-0 flex items-center gap-1 text-sm font-semibold text-[#7a4f00] underline underline-offset-2 decoration-[#7a4f00]/30 hover:decoration-[#7a4f00] transition-all"
            >
              Review now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <section className="px-8 pt-10 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10">
            {[
              { label: "Sessions", value: sessions.length },
              { label: "Total bookings", value: totalBookings },
              { label: "Est. revenue", value: `$${totalRevenue.toLocaleString()}` },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-[#e8e2d9] rounded-xl px-3 sm:px-7 py-4 sm:py-6 min-w-0">
                <p className="text-[0.55rem] sm:text-[0.6875rem] font-semibold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-[#006644] mb-2 sm:mb-3 truncate">{stat.label}</p>
                <p className="text-xl sm:text-3xl font-medium text-[#1a1a1a]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Sessions list */}
          {loading ? (
            <p className="text-[#6b7280] text-sm">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6b7280] mb-6">No sessions yet. Add your first one to get started.</p>
              <button onClick={() => setView("add")} className="btn-primary">Add session +</button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const booked = Math.max(0, s.maxSpots - s.spotsLeft);
                const pct = Math.round((booked / s.maxSpots) * 100);
                const isFull = s.spotsLeft === 0;
                const showBookings = expandedBookings === s.id;

                return (
                  <div key={s.id} className="bg-white border border-[#e8e2d9] rounded-xl overflow-hidden">

                    {/* Session body */}
                    <div className="px-7 pt-6 pb-5 flex flex-col sm:flex-row sm:items-center gap-5">
                      {/* Occupancy ring */}
                      <div className="shrink-0 hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-full relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#e8e2d9" strokeWidth="9" />
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#006644" strokeWidth="9"
                            strokeDasharray={`${2 * Math.PI * 22}`}
                            strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-[0.65rem] font-semibold text-[#1a1a1a] relative z-10">{pct}%</span>
                      </div>

                      {/* Session info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                          <p className="font-semibold text-[#1a1a1a] text-base leading-snug" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                            {s.classLabel}
                            {s.sessionName && <span className="text-[#6b7280] font-normal"> · {s.sessionName}</span>}
                          </p>
                          {isFull && (
                            <span className="text-[0.625rem] tracking-[0.12em] uppercase bg-red-50 text-red-500 border border-red-200 rounded-full px-2.5 py-0.5 font-semibold">Full</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-[#6b7280]">
                          <span>{s.date}</span>
                          <span>{s.time}</span>
                          <span>{s.location}</span>
                          <span>${s.price}/person</span>
                          <span>{s.ages}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="px-7 pb-0">
                      <div className="h-1.5 bg-[#e8e2d9] rounded-full overflow-hidden">
                        <div className="h-full bg-[#006644] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Footer action bar — Edit + Delete only */}
                    <div className="px-7 py-3 flex items-center justify-between">
                      <span className="text-xs text-[#6b7280]">{booked} of {s.maxSpots} spots booked</span>
                      <div className="flex items-center divide-x divide-[#e8e2d9]">
                        <button
                          onClick={() => { setEditTarget(s); setView("edit"); }}
                          className="text-xs text-[#6b7280] hover:text-[#006644] transition-colors px-4 py-1"
                        >
                          Edit
                        </button>
                        {deleteConfirm === s.id ? (
                          <>
                            <button onClick={() => deleteSession(s.id)} className="text-xs text-red-500 hover:text-red-600 transition-colors px-4 py-1">
                              Confirm delete
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors px-4 py-1">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(s.id)}
                            className="text-xs text-[#6b7280] hover:text-red-500 transition-colors px-4 py-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bookings accordion trigger */}
                    <button
                      onClick={() => setExpandedBookings(showBookings ? null : s.id)}
                      className="w-full border-t border-[#e8e2d9] px-7 py-3.5 flex items-center justify-between hover:bg-[#faf9f6] transition-colors"
                    >
                      <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#006644]">
                        Bookings · {booked} {booked === 1 ? "person" : "people"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-[#6b7280] transition-transform duration-200 ${showBookings ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Bookings panel */}
                    {showBookings && (
                      <div className="border-t border-[#e8e2d9] px-7 pb-6 pt-4">
                        <BookingsPanel sessionId={s.id} token={token} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
