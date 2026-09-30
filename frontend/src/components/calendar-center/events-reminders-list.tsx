"use client";

import { Trash2, CalendarDays, Bell, Repeat } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiDelete } from "@/lib/api";
import type { PersonalEvent } from "@/components/calendar-center/day-detail-panel";

export function EventsRemindersList({
  events,
  onChanged,
}: {
  events: PersonalEvent[];
  onChanged: () => void;
}) {
  const sorted = [...events].sort((a, b) => a.start_time.localeCompare(b.start_time));

  async function handleDelete(id: number) {
    await apiDelete(`/api/calendar/events/${id}`);
    onChanged();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #38bdf8, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">All Events &amp; Reminders</p>
        <h2 className="font-ayuthaya text-xl font-bold">{sorted.length} total</h2>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-white/40 italic">No events or reminders yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((ev) => {
            const isEvent = ev.event_type === "event";
            const dt = new Date(ev.start_time);
            return (
              <div key={ev.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                <div className="min-w-0">
                  <p className={`flex items-center gap-1.5 truncate text-sm font-medium ${isEvent ? "text-violet-300" : "text-sky-300"}`}>
                    {isEvent ? <CalendarDays className="size-3.5 shrink-0" /> : <Bell className="size-3.5 shrink-0" />}
                    {ev.title}
                    {ev.recurring ? <Repeat className="size-3 shrink-0 text-white/40" /> : null}
                  </p>
                  <p className="truncate text-[11px] text-white/40">
                    {dt.toLocaleDateString([], { month: "short", day: "numeric" })} ·{" "}
                    {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
        </div>
      )}
    </GlassCard>
  );
}
