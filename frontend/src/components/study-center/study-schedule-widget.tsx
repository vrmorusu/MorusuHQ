"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Check, X, SkipForward } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import type { StudySchedule, StudyAttendance } from "@/components/study-center/types";

const DAY_TYPES: { key: "weekday" | "weekend"; label: string }[] = [
  { key: "weekday", label: "Weekdays" },
  { key: "weekend", label: "Weekends" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

export function StudyScheduleWidget({ person, onPointsChanged }: { person: string; onPointsChanged?: () => void }) {
  const [schedule, setSchedule] = useState<StudySchedule[]>([]);
  const [attendance, setAttendance] = useState<StudyAttendance[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { start: string; end: string }>>({
    weekday: { start: "16:00", end: "17:00" },
    weekend: { start: "10:00", end: "11:00" },
  });

  function load() {
    apiGet<StudySchedule[]>(`/api/study/schedule?person=${person}`).then((data) => {
      setSchedule(data);
      setDrafts((prev) => {
        const next = { ...prev };
        for (const s of data) next[s.day_type] = { start: s.start_time, end: s.end_time };
        return next;
      });
    });
    apiGet<StudyAttendance[]>(`/api/study/attendance?person=${person}`).then(setAttendance);
  }

  useEffect(load, [person]);

  async function saveSlot(dayType: "weekday" | "weekend") {
    const d = drafts[dayType];
    await apiPost("/api/study/schedule", { person, day_type: dayType, start_time: d.start, end_time: d.end });
    load();
  }

  async function markAttendance(status: "attended" | "missed" | "skipped") {
    await apiPost("/api/study/attendance", { person, date: todayIso(), status });
    load();
    onPointsChanged?.();
  }

  const todaysRecord = attendance.find((a) => a.date === todayIso());
  const activeDayType = isWeekend() ? "weekend" : "weekday";
  const todaysSlot = schedule.find((s) => s.day_type === activeDayType);

  return (
    <GlassCard glow="radial-gradient(circle, #34d399, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Weekly Plan</p>
          <h2 className="font-ayuthaya text-xl font-bold">Study Schedule</h2>
        </div>
        <CalendarClock className="size-5 text-emerald-300" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DAY_TYPES.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-white/5 p-3">
            <p className="mb-2 text-xs font-semibold tracking-wide text-white/50 uppercase">{label}</p>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={drafts[key].start}
                onChange={(e) => setDrafts({ ...drafts, [key]: { ...drafts[key], start: e.target.value } })}
                className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-sm text-white"
              />
              <span className="text-white/40">to</span>
              <input
                type="time"
                value={drafts[key].end}
                onChange={(e) => setDrafts({ ...drafts, [key]: { ...drafts[key], end: e.target.value } })}
                className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-sm text-white"
              />
              <Button size="sm" onClick={() => saveSlot(key)} className="bg-emerald-500 hover:bg-emerald-400">
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white/5 p-3">
        <p className="mb-2 text-xs font-semibold tracking-wide text-white/50 uppercase">Today&apos;s Slot</p>
        {todaysSlot ? (
          <p className="mb-2 text-sm text-white/70">
            {todaysSlot.start_time} – {todaysSlot.end_time}
          </p>
        ) : (
          <p className="mb-2 text-sm text-white/40 italic">No slot set for today.</p>
        )}
        {todaysRecord ? (
          <p
            className={`text-sm font-medium ${
              todaysRecord.status === "attended"
                ? "text-emerald-300"
                : todaysRecord.status === "missed"
                  ? "text-rose-300"
                  : "text-white/50"
            }`}
          >
            Marked {todaysRecord.status} today
            {todaysRecord.status === "attended" ? " (+10 pts)" : todaysRecord.status === "missed" ? " (-5 pts)" : ""}
          </p>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => markAttendance("attended")} className="bg-emerald-500 hover:bg-emerald-400">
              <Check className="size-3.5" /> Attended
            </Button>
            <Button size="sm" onClick={() => markAttendance("missed")} className="bg-rose-500 hover:bg-rose-400">
              <X className="size-3.5" /> Missed
            </Button>
            <Button size="sm" variant="ghost" onClick={() => markAttendance("skipped")}>
              <SkipForward className="size-3.5" /> Skip (excused)
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
