"use client";

import { useEffect, useState } from "react";
import { X, CalendarDays, Bell, Repeat } from "lucide-react";
import { apiGet } from "@/lib/api";

type DayEvent = {
  id: number;
  title: string;
  start_time: string;
  location?: string | null;
  event_type: string;
  recurring: boolean;
};

export function DayEventsModal({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const [events, setEvents] = useState<DayEvent[] | null>(null);

  useEffect(() => {
    apiGet<DayEvent[]>(`/api/calendar/events/day/${dateKey}`).then(setEvents).catch(() => setEvents([]));
  }, [dateKey]);

  const prettyDate = new Date(`${dateKey}T00:00:00`).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-md rounded-3xl p-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm italic font-medium text-white/60">Today&apos;s Agenda</p>
            <h3 className="font-ayuthaya text-xl font-bold">{prettyDate}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        {events === null ? (
          <p className="text-sm text-white/40 italic">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-white/40 italic">Nothing scheduled today.</p>
        ) : (
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {events.map((ev) => {
              const isEvent = ev.event_type === "event";
              return (
                <li key={ev.id} className="rounded-xl bg-white/5 px-3 py-2">
                  <p className={`flex items-center gap-1.5 text-sm font-medium ${isEvent ? "text-violet-300" : "text-sky-300"}`}>
                    {isEvent ? <CalendarDays className="size-3.5" /> : <Bell className="size-3.5" />}
                    {ev.title}
                    {ev.recurring ? <Repeat className="size-3 text-white/40" /> : null}
                  </p>
                  <p className="pl-5 text-xs text-white/40">
                    {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {ev.location ? ` · ${ev.location}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
