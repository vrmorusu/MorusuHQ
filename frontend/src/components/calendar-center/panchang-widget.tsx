"use client";

import { useEffect, useState } from "react";
import { Moon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";

type Panchang = {
  tithi_number: number;
  tithi_name: string;
  paksha: string;
  illumination_percent: number;
};

export function PanchangWidget({ dateKey }: { dateKey: string }) {
  const [data, setData] = useState<Panchang | null>(null);

  useEffect(() => {
    setData(null);
    apiGet<Panchang>(`/api/calendar/panchang?date=${dateKey}`)
      .then(setData)
      .catch(() => {});
  }, [dateKey]);

  return (
    <GlassCard glow="radial-gradient(circle, #a78bfa, transparent 70%)">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Panchang</p>
        <Moon className="size-5 text-violet-300 animate-float-slow" />
      </div>
      {data ? (
        <div>
          <p className="font-ayuthaya text-2xl font-bold">
            {data.tithi_name}
            <span className="ml-2 text-sm font-normal italic text-white/50">
              {data.paksha} Paksha
            </span>
          </p>
          <p className="mt-1 text-xs text-white/50">
            Tithi {data.tithi_number} of 15 · {data.illumination_percent}% illuminated
          </p>
        </div>
      ) : (
        <p className="text-sm text-white/50 italic">Loading…</p>
      )}
      <p className="mt-2 text-[10px] text-white/30">Approximate — for reference only</p>
    </GlassCard>
  );
}
