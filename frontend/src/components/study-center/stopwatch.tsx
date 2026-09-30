"use client";

import { useEffect, useState } from "react";
import { Play, Square, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiDelete } from "@/lib/api";
import type { StudySession } from "@/components/study-center/types";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function Stopwatch({
  person,
  defaultSubject,
  sessions,
  onChanged,
}: {
  person: string;
  defaultSubject?: string;
  sessions: StudySession[];
  onChanged: () => void;
}) {
  const [subject, setSubject] = useState(defaultSubject ?? "");
  const [active, setActive] = useState<StudySession | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const personSessions = sessions.filter((s) => s.person === person);

  useEffect(() => {
    setSubject((prev) => prev || defaultSubject || "");
  }, [defaultSubject]);

  useEffect(() => {
    const running = personSessions.find((s) => !s.end_time) || null;
    setActive(running);
  }, [sessions, person]);

  useEffect(() => {
    if (!active) return;
    const startMs = new Date(active.start_time).getTime();
    const tick = () => setElapsed(Date.now() - startMs);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/api/study/sessions/start", { subject, person });
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStop() {
    if (!active) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/study/sessions/${active.id}/stop`, {});
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/study/sessions/${id}`);
    onChanged();
  }

  const weekStart = startOfWeek(new Date());
  const weekMinutes = personSessions
    .filter((s) => s.duration_minutes != null && new Date(s.start_time) >= weekStart)
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const weekHours = (weekMinutes / 60).toFixed(1);

  const recent = personSessions.filter((s) => s.end_time).slice(0, 6);

  return (
    <GlassCard glow="radial-gradient(circle, #22d3ee, transparent 70%)">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Study Timer</p>
          <h2 className="font-ayuthaya text-2xl font-bold">Stopwatch</h2>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-300">
          <Clock className="size-4" />
          <span className="text-sm font-medium">{weekHours}h this week</span>
        </div>
      </div>

      {active ? (
        <div className="mb-4 rounded-2xl bg-white/10 p-5 text-center">
          <p className="text-sm text-white/50">
            Studying <span className="font-semibold text-white">{active.subject}</span>
          </p>
          <p className="font-ayuthaya my-2 text-5xl font-bold tabular-nums text-cyan-300">{formatElapsed(elapsed)}</p>
          <Button onClick={handleStop} disabled={submitting} className="bg-rose-500 hover:bg-rose-400">
            <Square className="size-4" /> Stop
          </Button>
        </div>
      ) : (
        <form onSubmit={handleStart} className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject (e.g. Math)"
            className="min-w-32 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <Button type="submit" disabled={submitting} className="bg-cyan-500 hover:bg-cyan-400">
            <Play className="size-4" /> Start
          </Button>
        </form>
      )}

      {recent.length > 0 ? (
        <div>
          <p className="mb-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase">Recent Sessions</p>
          <ul className="space-y-1.5">
            {recent.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-1.5 text-sm">
                <span className="min-w-0 flex-1 truncate">{s.subject}</span>
                <span className="shrink-0 text-white/40">{s.duration_minutes?.toFixed(0)} min</span>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="shrink-0 text-xs text-white/30 hover:text-white/70"
                  aria-label="Delete session"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </GlassCard>
  );
}
