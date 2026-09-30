"use client";

import { useEffect, useState } from "react";
import { School } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";

type SchoolEvent = { title: string; start: string; all_day: boolean };

export function SchoolEventsWidget() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);

  useEffect(() => {
    apiGet<{ source: string; events: SchoolEvent[] }>("/api/calendar/school-events")
      .then((data) => setEvents(data.events))
      .catch(() => {});
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.start >= today).slice(0, 5);

  return (
    <GlassCard glow="radial-gradient(circle, #34d399, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Argyle ISD</p>
        <School className="size-4 text-emerald-300" />
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-white/50 italic">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((e) => (
            <li key={e.title + e.start} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{e.title}</span>
              <span className="shrink-0 text-xs text-emerald-300/80">
                {new Date(e.start).toLocaleDateString([], { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
