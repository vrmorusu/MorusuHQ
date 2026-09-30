"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, AlarmClock } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

const PRESETS = [15, 25, 45, 60];

function playAlarm() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, now + i * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.5 + 0.4);
      osc.start(now + i * 0.5);
      osc.stop(now + i * 0.5 + 0.4);
    }
  } catch {
    // Web Audio not available; silently skip the beep.
  }
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("Study timer done!", { body: "Time's up — great work." });
  }
}

export function StudyCountdownTimer() {
  const [minutes, setMinutes] = useState(25);
  const [remainingMs, setRemainingMs] = useState(25 * 60 * 1000);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const remaining = (endTimeRef.current ?? Date.now()) - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        setRunning(false);
        setDone(true);
        playAlarm();
        clearInterval(id);
      } else {
        setRemainingMs(remaining);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  function start() {
    endTimeRef.current = Date.now() + remainingMs;
    setDone(false);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function reset(newMinutes?: number) {
    const m = newMinutes ?? minutes;
    setMinutes(m);
    setRemainingMs(m * 60 * 1000);
    setRunning(false);
    setDone(false);
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;

  return (
    <GlassCard glow="radial-gradient(circle, #fbbf24, transparent 70%)">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Study Timer</p>
          <h2 className="font-ayuthaya text-2xl font-bold">Countdown</h2>
        </div>
        <AlarmClock className={`size-6 text-amber-300 ${done ? "animate-pulse" : ""}`} />
      </div>

      <div className={`mb-4 rounded-2xl p-5 text-center ${done ? "bg-amber-400/20 ring-2 ring-amber-400" : "bg-white/10"}`}>
        <p className="font-ayuthaya my-2 text-5xl font-bold tabular-nums text-amber-300">
          {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
        </p>
        {done ? <p className="text-sm font-medium text-amber-200">Time&apos;s up! 🎉</p> : null}
        <div className="mt-3 flex justify-center gap-2">
          {!running ? (
            <Button onClick={start} className="bg-amber-500 hover:bg-amber-400">
              <Play className="size-4" /> Start
            </Button>
          ) : (
            <Button onClick={pause} className="bg-amber-500 hover:bg-amber-400">
              <Pause className="size-4" /> Pause
            </Button>
          )}
          <Button variant="ghost" onClick={() => reset()}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => reset(p)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              minutes === p ? "bg-amber-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {p} min
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
