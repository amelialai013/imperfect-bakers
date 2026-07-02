"use client";

import { useState, useEffect, useCallback } from "react";
import type { ClassSession, Booking } from "@/lib/types";

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
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toggleAttendeeType(key: "child" | "youngAdult" | "adult") {
    setAttendeeTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form, attendeeTypes);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Class type" name="classLabel" value={form.classLabel} onChange={handle} placeholder="Sweet Food" required />
        <Field label="Session name" name="sessionName" value={form.sessionName} onChange={handle} placeholder="e.g. Delicious Dinner (optional)" />
        <Field label="Date" name="date" value={form.date} onChange={handle} placeholder="Saturday 18 July 2026" required />
        <Field label="Time" name="time" value={form.time} onChange={handle} placeholder="1 – 4pm" required />
        <Field label="Location" name="location" value={form.location} onChange={handle} placeholder="Williamstown, Melbourne" required />
        <Field label="Ages" name="ages" value={form.ages} onChange={handle} placeholder="All ages" required />
        <Field label="Price per person ($)" name="price" value={form.price} onChange={handle} type="number" placeholder="150" required />
        <Field label="Max spots" name="maxSpots" value={form.maxSpots} onChange={handle} type="number" placeholder="15" required />
      </div>
      <Field label="Description" name="description" value={form.description} onChange={handle} type="textarea" placeholder="Short description of the session…" />
      <Field label="Image URL" name="imageUrl" value={form.imageUrl} onChange={handle} placeholder="https://images.unsplash.com/…" />

      {/* Attendee types */}
      <div>
        <label className="block text-xs font-semibold tracking-[0.15em] uppercase text-[#1a1a1a] mb-3">
          Attendee types
        </label>
        <div className="flex flex-wrap gap-2">
          {ATTENDEE_OPTIONS.map((opt) => {
            const active = attendeeTypes.includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => toggleAttendeeType(opt.key)}
                className={`px-4 py-2 text-sm border rounded-full transition-all duration-200 ${
                  active
                    ? "bg-[#006644] border-[#006644] text-white"
                    : "bg-white border-[#e4dfd5] text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644]"
                }`}
              >
                {opt.label} <span className={`text-xs ${active ? "text-white/70" : "text-[#6b7280]"}`}>{opt.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
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

type View = "login" | "dashboard" | "add" | "edit";

export default function AdminPage() {
  const [token, setToken] = useState<string>(() => storageGet("ib_admin_token"));
  const [view, setView] = useState<View>(token ? "dashboard" : "login");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<ClassSession | null>(null);
  const [expandedBookings, setExpandedBookings] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/sessions", token);
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (view === "dashboard" && token) loadSessions();
  }, [view, token, loadSessions]);

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

  // ── Login ────────────────────────────────────────────────

  if (view === "login") {
    return (
      <>
        <section className="bg-[#006644] px-8 pt-16 pb-14">
          <div className="max-w-7xl mx-auto">
            <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Imperfect Bakers</span>
            <h1 className="text-4xl md:text-5xl text-white leading-tight tracking-tight mt-3" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Admin
            </h1>
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
        <section className="bg-[#006644] px-8 pt-16 pb-14">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div>
              <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Admin</span>
              <h1 className="text-4xl md:text-5xl text-white leading-tight tracking-tight mt-3" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                {view === "edit" ? "Edit session" : "Add session"}
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

  // ── Dashboard ────────────────────────────────────────────

  const totalBookings = sessions.reduce((acc, s) => acc + (s.maxSpots - s.spotsLeft), 0);
  const totalRevenue = sessions.reduce((acc, s) => acc + (s.maxSpots - s.spotsLeft) * s.price, 0);

  return (
    <>
      <section className="bg-[#006644] px-8 pt-16 pb-14">
        <div className="max-w-7xl mx-auto flex items-end justify-between flex-wrap gap-4">
          <div>
            <span className="block text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-white/40 mb-3">Imperfect Bakers</span>
            <h1 className="text-4xl md:text-5xl text-white leading-tight tracking-tight mt-3" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
              Admin dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView("add")} className="btn-tertiary group">
              + Add session
            </button>
            <button onClick={logout} className="text-white/40 hover:text-white text-sm transition-colors">
              Sign out
            </button>
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
            ].map((s) => (
              <div key={s.label} className="bg-white border border-[#e4dfd5] rounded-[8px] px-6 py-5">
                <p className="text-[0.6875rem] font-semibold tracking-[0.2em] uppercase text-[#006644] mb-1">{s.label}</p>
                <p className="text-2xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Sessions list */}
          {loading ? (
            <p className="text-[#6b7280] text-sm">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#6b7280] mb-6">No sessions yet. Add your first one to get started.</p>
              <button onClick={() => setView("add")} className="btn-primary">Add session</button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => {
                const booked = s.maxSpots - s.spotsLeft;
                const pct = Math.round((booked / s.maxSpots) * 100);
                const isFull = s.spotsLeft === 0;
                const showBookings = expandedBookings === s.id;

                return (
                  <div key={s.id} className="bg-white border border-[#e4dfd5] rounded-[8px] overflow-hidden">
                    {/* Session header */}
                    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <p className="font-semibold text-[#1a1a1a] text-base" style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
                            {s.classLabel}
                            {s.sessionName && <span className="text-[#6b7280] font-normal"> · {s.sessionName}</span>}
                          </p>
                          {isFull && (
                            <span className="text-[0.6875rem] tracking-[0.1em] uppercase bg-red-50 text-red-500 border border-red-200 rounded-full px-2 py-0.5">Full</span>
                          )}
                        </div>
                        <p className="text-sm text-[#6b7280]">{s.date} · {s.time} · {s.location}</p>
                        <p className="text-sm text-[#6b7280] mt-0.5">${s.price}/person · {s.ages}</p>
                        {/* Progress bar */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-[#e4dfd5] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#006644] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#6b7280] shrink-0">
                            {booked}/{s.maxSpots} booked
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => setExpandedBookings(showBookings ? null : s.id)}
                          className="text-xs border border-[#e4dfd5] rounded-[6px] px-3 py-1.5 text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644] transition-colors"
                        >
                          {showBookings ? "Hide" : "Bookings"} ({booked})
                        </button>
                        <button
                          onClick={() => { setEditTarget(s); setView("edit"); }}
                          className="text-xs border border-[#e4dfd5] rounded-[6px] px-3 py-1.5 text-[#1a1a1a] hover:border-[#006644] hover:text-[#006644] transition-colors"
                        >
                          Edit
                        </button>
                        {deleteConfirm === s.id ? (
                          <>
                            <button
                              onClick={() => deleteSession(s.id)}
                              className="text-xs border border-red-300 rounded-[6px] px-3 py-1.5 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Confirm delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-[#6b7280] hover:text-[#1a1a1a] transition-colors"
                            >
                              Keep
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(s.id)}
                            className="text-xs border border-[#e4dfd5] rounded-[6px] px-3 py-1.5 text-[#6b7280] hover:border-red-300 hover:text-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bookings panel */}
                    {showBookings && (
                      <div className="border-t border-[#e4dfd5] px-6 pb-5">
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
