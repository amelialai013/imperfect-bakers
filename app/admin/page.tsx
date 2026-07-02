"use client";

import { useState, useEffect, useCallback } from "react";
import type { ClassSession, Booking, ClassConfig } from "@/lib/types";
import { DEFAULT_CLASS_CONFIGS } from "@/lib/classDefaults";

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
function displayDateToIso(display: string): string {
  if (!display) return "";
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
      <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-2">
        {label} {required && <span className="text-[#006644]">*</span>}
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
  const labelCls = "block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-2";

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
      <label className={labelCls}>{label}{req && <span className="text-[#006644] ml-1">*</span>}</label>
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
    <form onSubmit={(e) => { e.preventDefault(); onSave(form, attendeeTypes); }}>

      {/* ── Section 1: Class ─────────────────────────────── */}
      <div className="bg-white border border-[#e8e2d9] rounded-xl p-6 mb-4">
        <span className={sectionLabel}>Class</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField label="Class type" name="classLabel" value={form.classLabel} onChange={handle} required>
            <option value="">Select class type…</option>
            {CLASS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </SelectField>
          <Field label="Session name" name="sessionName" value={form.sessionName} onChange={handle} placeholder="e.g. Delicious Dinner (optional)" />
        </div>
      </div>

      {/* ── Section 2: Schedule ──────────────────────────── */}
      <div className="bg-white border border-[#e8e2d9] rounded-xl p-6 mb-4">
        <span className={sectionLabel}>Schedule</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date <span className="text-[#006644]">*</span></label>
            <input type="date" value={dateIso} onChange={(e) => setDateIso(e.target.value)} required className={cls} />
            {form.date && <p className="text-xs text-[#006644]/70 mt-1.5">{form.date}</p>}
          </div>
          <div>
            <label className={labelCls}>Time <span className="text-[#006644]">*</span></label>
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
          <Field label="Location" name="location" value={form.location} onChange={handle} placeholder="Williamstown, Melbourne" required />
          <SelectField label="Ages" name="ages" value={form.ages} onChange={(e) => {
            const val = e.target.value;
            setForm((f) => ({ ...f, ages: val }));
            if (val === "All ages") setAttendeeTypes(["child", "youngAdult", "adult"]);
            else if (val === "18+ yrs") setAttendeeTypes((prev) => prev.filter((k) => k !== "child"));
          }} required>
            <option value="All ages">All ages</option>
            <option value="18+ yrs">18+ yrs</option>
          </SelectField>
          <div>
            <label className={labelCls}>Attendee types</label>
            <div className="flex flex-wrap gap-3 mt-1">
              {ATTENDEE_OPTIONS.map((opt) => {
                const active = attendeeTypes.includes(opt.key);
                return (
                  <button key={opt.key} type="button" onClick={() => toggleAttendeeType(opt.key)}
                    className={`inline-flex items-center gap-2 px-8 py-3.5 text-[0.9375rem] font-medium border rounded-full transition-all duration-200 ${active ? "bg-[#006644] border-[#006644] text-white" : "bg-white border-[#006644] text-[#006644] hover:bg-[#006644] hover:text-white"}`}>
                    {opt.label} <span className={`text-sm ${active ? "text-white/70" : "text-[#006644]/60"}`}>{opt.sub}</span>
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
          <Field label="Description" name="description" value={form.description} onChange={handle} type="textarea" placeholder="Short description of the session…" />
          <Field label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handle} placeholder="https://images.unsplash.com/…" />
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
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await authFetch(`/api/sessions/${sessionId}`, token, { method: "PATCH" });
    const data = await res.json();
    setBookings(data);
  }, [sessionId, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id: string) {
    if (!confirm("Cancel this booking? The spot will be returned.")) return;
    setCancelling(id);
    await authFetch(`/api/bookings/${id}`, token, { method: "DELETE" });
    await load();
    setCancelling(null);
  }

  if (!bookings) return <p className="text-[#6b7280] text-sm py-4">Loading bookings…</p>;
  if (bookings.length === 0)
    return <p className="text-[#6b7280] text-sm py-4">No bookings yet for this session.</p>;

  const active = bookings.filter((b) => !b.cancelled);
  const cancelled = bookings.filter((b) => b.cancelled);

  return (
    <div className="mt-4 space-y-2">
      {active.map((b) => (
        <div key={b.id} className="bg-white border border-[#e4dfd5] rounded-[6px] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-1 text-sm">
            <div>
              <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Name</p>
              <p className="font-medium text-[#1a1a1a]">{b.name}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Email</p>
              <p className="text-[#6b7280] break-all">{b.email}</p>
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
              <div className="col-span-2 sm:col-span-4">
                <p className="text-[0.6875rem] tracking-widest uppercase text-[#006644] mb-0.5">Notes</p>
                <p className="text-[#6b7280] text-xs">{b.notes}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => cancel(b.id)}
            disabled={cancelling === b.id}
            className="shrink-0 text-xs text-red-500 border border-red-200 rounded-[6px] px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling === b.id ? "Cancelling…" : "Cancel booking"}
          </button>
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

// ── storage helpers (Safari-safe) ─────────────────────────────────────────────

function storageGet(key: string): string {
  if (typeof window === "undefined") return "";
  try { return localStorage.getItem(key) ?? ""; } catch {}
  try { return sessionStorage.getItem(key) ?? ""; } catch {}
  return "";
}
function storageSet(key: string, value: string) {
  try { localStorage.setItem(key, value); return; } catch {}
  try { sessionStorage.setItem(key, value); } catch {}
}
function storageRemove(key: string) {
  try { localStorage.removeItem(key); } catch {}
  try { sessionStorage.removeItem(key); } catch {}
}

// ── main component ─────────────────────────────────────────────────────────────

type View = "login" | "dashboard" | "add" | "edit" | "classes";

function MoreMenu({ onManageClasses, onLogout }: { onManageClasses: () => void; onLogout: () => void }) {
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
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-[#e8e2d9] rounded-xl shadow-lg overflow-hidden min-w-[180px]">
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

  const loadSessions = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/sessions", token);
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    if (view === "dashboard" && token) loadSessions();
  }, [view, token, loadSessions]);

  useEffect(() => {
    if (view === "classes" && token) loadClassConfigs();
  }, [view, token, loadClassConfigs]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
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
            <form onSubmit={login} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm focus:outline-none focus:border-[#006644] bg-white"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button type="submit" className="btn-primary w-full justify-center">Sign in</button>
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
                className="flex items-center gap-1.5 text-[#006644] hover:text-[#004d33] transition-colors text-[0.6875rem] font-semibold tracking-[0.2em] uppercase mb-5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
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

  // ── Classes ──────────────────────────────────────────────

  if (view === "classes") {
    const inputCls = "w-full border border-[#e4dfd5] rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none focus:border-[#006644] bg-white transition-colors";
    const labelCls = "block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-2";

    function tryGoBack() {
      if (hasAnyUnsaved()) {
        setUnsavedWarning(true);
      } else {
        setView("dashboard");
      }
    }

    return (
      <>
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
                className="flex items-center gap-1.5 text-[#006644] hover:text-[#004d33] transition-colors text-[0.6875rem] font-semibold tracking-[0.2em] uppercase mb-5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>
              <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                Manage <em className="not-italic text-[#006644]">classes</em>
              </h1>
            </div>
          </div>
        </section>

        <section className="px-8 pt-10 pb-24 bg-[#faf9f6]">
          <div className="max-w-7xl mx-auto">
            {classConfigsLoading ? (
              <p className="text-[#6b7280] text-sm">Loading classes…</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classConfigs.map((c) => (
                  <div key={c.key} className="bg-white border border-[#e8e2d9] rounded-xl overflow-hidden">
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
                    </div>

                    {/* Fields */}
                    <div className="p-6 space-y-4">
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
                          <label className={labelCls}>Ages</label>
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
                    <div className="px-6 pb-5 flex items-center justify-end gap-3">
                      {isClassDirty(c.key) && (
                        <button
                          onClick={() => revertClassConfig(c.key)}
                          className="btn-secondary"
                        >
                          Revert
                        </button>
                      )}
                      <button
                        onClick={() => saveClassConfigItem(c)}
                        disabled={savingClass === c.key}
                        className="btn-primary"
                      >
                        {savingClass === c.key ? "Saving…" : "Save changes"}
                      </button>
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

  // ── Dashboard ────────────────────────────────────────────

  const totalBookings = sessions.reduce((acc, s) => acc + (s.maxSpots - s.spotsLeft), 0);
  const totalRevenue = sessions.reduce((acc, s) => acc + (s.maxSpots - s.spotsLeft) * s.price, 0);

  return (
    <>
      <section className="bg-[#faf9f6] pt-10 pb-8 border-b border-[#e8e2d9]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1 className="text-4xl md:text-5xl text-[#1a1a1a] leading-tight tracking-tight" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
            Admin <em className="not-italic text-[#006644]">dashboard</em>
          </h1>
          <div className="flex items-center gap-4 pb-1 mt-12">
            <button onClick={() => setView("add")} className="btn-primary group">
              Add session <span>+</span>
            </button>
            <MoreMenu onManageClasses={() => setView("classes")} onLogout={logout} />
          </div>
        </div>
      </section>

      <section className="px-8 pt-10 pb-24 bg-[#faf9f6]">
        <div className="max-w-7xl mx-auto">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: "Sessions", value: sessions.length },
              { label: "Total bookings", value: totalBookings },
              { label: "Est. revenue", value: `$${totalRevenue.toLocaleString()}` },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-[#e8e2d9] rounded-xl px-7 py-6">
                <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-3">{stat.label}</p>
                <p className="text-3xl font-medium text-[#1a1a1a]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>{stat.value}</p>
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
                const booked = s.maxSpots - s.spotsLeft;
                const pct = Math.round((booked / s.maxSpots) * 100);
                const isFull = s.spotsLeft === 0;
                const showBookings = expandedBookings === s.id;

                return (
                  <div key={s.id} className="bg-white border border-[#e8e2d9] rounded-xl overflow-hidden">

                    {/* Session body */}
                    <div className="px-7 pt-6 pb-5 flex flex-col sm:flex-row sm:items-center gap-5">
                      {/* Occupancy ring */}
                      <div className="shrink-0 hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-full border-2 border-[#e8e2d9] relative">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#e8e2d9" strokeWidth="3" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#006644" strokeWidth="3"
                            strokeDasharray={`${2 * Math.PI * 24}`}
                            strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
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
                      <div className="h-px bg-[#e8e2d9] rounded-full overflow-hidden">
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
