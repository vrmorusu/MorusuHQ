"use client";

import { useEffect, useState } from "react";
import { PartyPopper } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

type Holiday = { date: string; name: string; localName: string };

export function HolidaysWidget() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  useEffect(() => {
    const year = new Date().getFullYear();
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`)
      .then((res) => res.json())
      .then((data: Holiday[]) => setHolidays(data))
      .catch(() => {});
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = holidays.filter((h) => h.date >= today).slice(0, 5);

  return (
    <GlassCard glow="radial-gradient(circle, #fbbf24, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Upcoming Holidays</p>
        <PartyPopper className="size-4 text-amber-300" />
      </div>
      {upcoming.length === 0 ? (
        <p className="text-sm text-white/50 italic">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((h, i) => (
            <li key={`${h.date}-${h.name}-${i}`} className="flex items-center justify-between text-sm">
              <span className="truncate">{h.localName}</span>
              <span className="shrink-0 text-xs text-amber-300/80">
                {new Date(`${h.date}T00:00:00`).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
