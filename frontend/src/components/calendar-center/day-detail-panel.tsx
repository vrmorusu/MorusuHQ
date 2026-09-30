"use client";

import { useState } from "react";
import { Plus, Trash2, CalendarPlus, Repeat, CalendarDays, Bell } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, apiDelete } from "@/lib/api";

export type PersonalEvent = {
  id: number;
  title: string;
  start_time: string;
  location?: string | null;
  description?: string | null;
  event_type: string;
  recurring: boolean;
  interval_days?: number | null;
};

const INTERVALS = [
  { value: 1, label: "Daily" },
  { value: 7, label: "Weekly" },
  { value: 14, label: "Bi-weekly" },
  { value: 30, label: "Monthly" },
];

export function DayDetailPanel({
  selectedKey,
  personalEvents,
  holidayNames,
  schoolEventTitles,
  onChanged,
}: {
  selectedKey: string;
  personalEvents: PersonalEvent[];
  holidayNames: string[];
  schoolEventTitles: string[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("09:00");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("reminder");
  const [recurring, setRecurring] = useState(false);
  const [intervalDays, setIntervalDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  const prettyDate = new Date(`${selectedKey}T00:00:00`).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/api/calendar/events", {
        title,
        start_time: `${selectedKey}T${time}:00`,
        location: location || null,
        event_type: eventType,
        recurring,
        interval_days: recurring ? intervalDays : null,
      });
      setTitle("");
      setLocation("");
      setRecurring(false);
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/calendar/events/${id}`);
    onChanged();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #38bdf8, transparent 70%)" className="h-full">
      <p className="mb-1 text-sm italic font-medium text-white/60">Selected Day</p>
      <h3 className="font-ayuthaya mb-3 text-xl font-bold">{prettyDate}</h3>

      <div className="mb-4 space-y-1.5">
        {holidayNames.map((h, i) => (
          <p key={`${h}-${i}`} className="flex items-center gap-2 text-sm text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-400" /> {h}
          </p>
        ))}
        {schoolEventTitles.map((s, i) => (
          <p key={`${s}-${i}`} className="flex items-center gap-2 text-sm text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" /> {s}
          </p>
        ))}
        {personalEvents.map((ev) => {
          const isEvent = ev.event_type === "event";
          return (
            <div key={ev.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5">
              <div className="min-w-0">
                <p className={`flex items-center gap-2 truncate text-sm ${isEvent ? "text-violet-300" : "text-sky-300"}`}>
                  {isEvent ? <CalendarDays className="size-3.5 shrink-0" /> : <Bell className="size-3.5 shrink-0" />}
                  {ev.title}
                  {ev.recurring ? <Repeat className="size-3 shrink-0 text-white/40" /> : null}
                </p>
                <p className="pl-5 text-[11px] text-white/40">
                  {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {ev.location ? ` · ${ev.location}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(ev.id)}
                className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Delete event"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
        {holidayNames.length === 0 && schoolEventTitles.length === 0 && personalEvents.length === 0 ? (
          <p className="text-sm text-white/40 italic">Nothing on this day yet.</p>
        ) : null}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 border-t border-white/10 pt-3">
        <Label className="text-xs text-white/50">
          <CalendarPlus className="size-3.5" /> Add event or reminder
        </Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
        />
        <div className="flex gap-2">
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border-white/20 bg-white/5 text-white"
          />
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white"
          >
            <option value="reminder" className="text-black">
              Reminder
            </option>
            <option value="event" className="text-black">
              Event
            </option>
          </select>
        </div>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
        />
        <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
          <label className="flex flex-1 items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="size-4 rounded border-white/30 bg-white/5 accent-sky-400"
            />
            <Repeat className="size-3.5 text-sky-300" />
            Recurring
          </label>
          {recurring ? (
            <select
              value={intervalDays}
              onChange={(e) => setIntervalDays(Number(e.target.value))}
              className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-sm text-white"
            >
              {INTERVALS.map((i) => (
                <option key={i.value} value={i.value} className="text-black">
                  {i.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting} className="w-full bg-sky-500 hover:bg-sky-400">
          <Plus /> Add to {prettyDate.split(",")[0]}
        </Button>
      </form>
    </GlassCard>
  );
}
