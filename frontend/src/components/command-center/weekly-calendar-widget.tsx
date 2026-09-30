"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { DayEventsModal } from "@/components/command-center/day-events-modal";
import { apiGet } from "@/lib/api";

type Event = { id: number; title: string; start_time: string };

function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function WeeklyCalendarWidget() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Event[]>("/api/calendar/events").then(setEvents).catch(() => {});
  }, []);

  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const todayKey = new Date().toDateString();

  return (
    <GlassCard glow="radial-gradient(circle, #34d399, transparent 70%)">
      <p className="mb-3 text-sm italic font-medium text-white/60">This Week</p>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayEvents = events.filter(
            (e) => new Date(e.start_time).toDateString() === day.toDateString()
          );
          const isToday = day.toDateString() === todayKey;
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedKey(toKey(day))}
              className={`flex flex-col gap-1 rounded-2xl p-2 text-center transition-transform hover:scale-105 ${
                isToday ? "bg-emerald-400/20 ring-1 ring-emerald-400/50" : "bg-white/5"
              }`}
            >
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                {day.toLocaleDateString([], { weekday: "short" })}
              </p>
              <p className={`text-lg font-bold ${isToday ? "text-emerald-300" : ""}`}>
                {day.getDate()}
              </p>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((e) => (
                  <p key={e.id} className="truncate rounded bg-white/10 px-1 py-0.5 text-[10px]">
                    {e.title}
                  </p>
                ))}
                {dayEvents.length > 2 ? (
                  <p className="text-[10px] text-white/40">+{dayEvents.length - 2}</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
      {selectedKey ? <DayEventsModal dateKey={selectedKey} onClose={() => setSelectedKey(null)} /> : null}
    </GlassCard>
  );
}
