"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { DayEventsModal } from "@/components/command-center/day-events-modal";

export function HeroDateTime() {
  const [now, setNow] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "--:--";
  const seconds = now?.toLocaleTimeString([], { second: "2-digit" }) ?? "--";
  const date = now?.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function dateKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="block h-full w-full text-left">
        <GlassCard
          glow="radial-gradient(circle, #6366f1, transparent 70%)"
          className="flex h-full flex-col justify-center gap-1 transition-transform hover:scale-[1.01]"
        >
          <p className="font-ayuthaya text-lg italic font-light text-white/70">{date ?? "—"}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-ayuthaya text-6xl sm:text-7xl font-bold tracking-tight tabular-nums">
              {time}
            </span>
            <span className="text-xl font-light text-white/50 tabular-nums animate-pulse-glow">
              :{seconds}
            </span>
          </div>
          <p className="text-xs text-white/30 italic">Tap for today&apos;s agenda</p>
        </GlassCard>
      </button>
      {showModal && now ? <DayEventsModal dateKey={dateKey(now)} onClose={() => setShowModal(false)} /> : null}
    </>
  );
}
