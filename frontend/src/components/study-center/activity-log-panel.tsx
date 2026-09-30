"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Check, ListChecks, CalendarPlus, School } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { ActivityEntry } from "@/components/study-center/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

type SchoolEvent = { title: string; start: string; all_day: boolean };

export function ActivityLogPanel({
  person,
  subject,
  onPointsChanged,
}: {
  person: string;
  subject: string;
  onPointsChanged?: () => void;
}) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [imported, setImported] = useState<Set<string>>(new Set());

  const isActivities = subject.toLowerCase() === "activities";

  function load() {
    apiGet<ActivityEntry[]>(`/api/study/activities?person=${person}&subject=${encodeURIComponent(subject)}`)
      .then(setEntries)
      .catch(() => {});
  }

  useEffect(load, [person, subject]);

  useEffect(() => {
    if (!isActivities) return;
    apiGet<{ events: SchoolEvent[] }>("/api/calendar/school-events")
      .then((data) => setEvents(data.events))
      .catch(() => {});
  }, [isActivities]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/study/activities?person=${person}&subject=${encodeURIComponent(subject)}`, {
        title,
        date: todayIso(),
        notes: notes || null,
        status: "pending",
      });
      setTitle("");
      setNotes("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleDone(entry: ActivityEntry) {
    await apiPatch(`/api/study/activities/${entry.id}`, { status: entry.status === "done" ? "pending" : "done" });
    load();
    onPointsChanged?.();
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/study/activities/${id}`);
    load();
  }

  const today = todayIso();
  const upcoming = events.filter((e) => e.start.slice(0, 10) >= today).slice(0, 5);

  async function importEvent(e: SchoolEvent) {
    await apiPost(`/api/study/activities?person=${person}&subject=${encodeURIComponent(subject)}`, {
      title: e.title,
      date: e.start.slice(0, 10),
      notes: "Imported from Argyle ISD calendar",
      status: "pending",
    });
    setImported((prev) => new Set(prev).add(e.title + e.start));
    load();
  }

  return (
    <div className="space-y-4">
      <GlassCard glow="radial-gradient(circle, #34d399, transparent 70%)">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm italic font-medium text-white/60">Non-academic Log</p>
            <h2 className="font-ayuthaya flex items-center gap-2 text-xl font-bold">
              <ListChecks className="size-5 text-emerald-300" /> {subject}
            </h2>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Add ${subject.toLowerCase()}…`}
            className="min-w-40 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="min-w-32 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <Button type="submit" disabled={submitting} className="bg-emerald-500 hover:bg-emerald-400">
            <Plus className="size-4" /> Add
          </Button>
        </form>

        {entries.length === 0 ? (
          <p className="text-sm text-white/40 italic">Nothing logged yet.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 py-2">
                <button
                  onClick={() => toggleDone(entry)}
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    entry.status === "done"
                      ? "border-emerald-400 bg-emerald-400 text-black"
                      : "border-white/40 text-white/60 hover:bg-white/10"
                  }`}
                  aria-label="Toggle done"
                >
                  <Check className="size-3.5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${entry.status === "done" ? "line-through" : ""}`}>
                    {entry.title}
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {new Date(`${entry.date}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                    {entry.status === "done" ? " · +5 pts" : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Delete entry"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {isActivities ? (
        <GlassCard glow="radial-gradient(circle, #60a5fa, transparent 70%)">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm italic font-medium text-white/60">From Argyle ISD Calendar</p>
              <h2 className="font-ayuthaya text-lg font-bold">Import as Activity</h2>
            </div>
            <School className="size-5 text-blue-300" />
          </div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-white/40 italic">No upcoming school events found.</p>
          ) : (
            <ul className="space-y-1.5">
              {upcoming.map((e) => {
                const key = e.title + e.start;
                const isImported = imported.has(key);
                return (
                  <li key={key} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-sm">
                    <span className="min-w-0 flex-1 truncate">{e.title}</span>
                    <span className="shrink-0 text-white/40">
                      {new Date(e.start).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                    <button
                      onClick={() => !isImported && importEvent(e)}
                      disabled={isImported}
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs ${
                        isImported ? "bg-emerald-400/20 text-emerald-300" : "bg-blue-500/80 text-white hover:bg-blue-400"
                      }`}
                    >
                      {isImported ? <Check className="size-3" /> : <CalendarPlus className="size-3" />}
                      {isImported ? "Added" : "Add"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      ) : null}
    </div>
  );
}
