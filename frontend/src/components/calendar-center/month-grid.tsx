"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export type DayMarkers = {
  personal: number;
  holiday: string[];
  school: number;
};

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function buildMonthGrid(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

export function MonthGrid({
  monthDate,
  onPrevMonth,
  onNextMonth,
  markers,
  selectedKey,
  onSelectDay,
}: {
  monthDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  markers: Record<string, DayMarkers>;
  selectedKey: string;
  onSelectDay: (key: string) => void;
}) {
  const days = buildMonthGrid(monthDate);
  const todayKey = toKey(new Date());
  const currentMonth = monthDate.getMonth();

  return (
    <GlassCard glow="radial-gradient(circle, #2dd4bf, transparent 70%)" className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-ayuthaya text-2xl font-bold">
          {monthDate.toLocaleDateString([], { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={onPrevMonth}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-white/40">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="pb-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = toKey(d);
          const isCurrentMonth = d.getMonth() === currentMonth;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const m = markers[key];

          return (
            <button
              key={key}
              onClick={() => onSelectDay(key)}
              className={`relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm transition-colors ${
                isSelected
                  ? "bg-teal-400/30 ring-1 ring-teal-300"
                  : isToday
                    ? "bg-white/15"
                    : "hover:bg-white/10"
              } ${isCurrentMonth ? "text-white" : "text-white/25"}`}
            >
              <span className={isToday ? "font-bold text-teal-300" : ""}>{d.getDate()}</span>
              <span className="flex gap-0.5">
                {m?.holiday.length ? <span className="size-1 rounded-full bg-amber-400" /> : null}
                {m?.personal ? <span className="size-1 rounded-full bg-sky-400" /> : null}
                {m?.school ? <span className="size-1 rounded-full bg-emerald-400" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-white/50">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-sky-400" /> Family
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-400" /> Argyle ISD
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-amber-400" /> Holiday
        </span>
      </div>
    </GlassCard>
  );
}

export { toKey };
