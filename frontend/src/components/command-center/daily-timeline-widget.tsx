"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";

type Event = {
  id: number;
  title: string;
  start_time: string;
  location?: string | null;
};

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function DailyTimelineWidget() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    apiGet<Event[]>("/api/calendar/events")
      .then((data) => setEvents(data.filter((e) => isToday(e.start_time))))
      .catch(() => {});
  }, []);

  return (
    <GlassCard glow="radial-gradient(circle, #8b5cf6, transparent 70%)" className="h-full">
      <p className="mb-4 text-sm italic font-medium text-white/60">Today&rsquo;s Timeline</p>
      {events.length === 0 ? (
        <p className="text-sm text-white/50 italic">Nothing scheduled today.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-white/20 pl-5">
          {events
            .sort((a, b) => a.start_time.localeCompare(b.start_time))
            .map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]" />
                <p className="text-xs font-medium text-violet-300 tabular-nums">
                  {new Date(e.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="font-medium">{e.title}</p>
                {e.location ? <p className="text-xs text-white/50">{e.location}</p> : null}
              </li>
            ))}
        </ol>
      )}
    </GlassCard>
  );
}
