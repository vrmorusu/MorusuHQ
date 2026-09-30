"use client";

import { useEffect, useState } from "react";
import { School } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";
import type { SchoolMenuResponse } from "@/components/meal-prep-center/types";

function SchoolMenuCard({ schoolKey, label }: { schoolKey: string; label: string }) {
  const [data, setData] = useState<SchoolMenuResponse | null>(null);
  const [tab, setTab] = useState<"lunch" | "breakfast">("lunch");

  useEffect(() => {
    apiGet<SchoolMenuResponse>(`/api/meals/school-menu?school=${schoolKey}`).then(setData).catch(() => {});
  }, [schoolKey]);

  const meal = data ? data[tab] : null;

  return (
    <GlassCard glow="radial-gradient(circle, #f87171, transparent 70%)" className="h-full">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">{label}</p>
          <h3 className="font-ayuthaya text-lg font-bold">{data?.name ?? "Loading…"}</h3>
        </div>
        <School className="size-5 text-red-300" />
      </div>

      <div className="mb-3 flex gap-1.5">
        {(["lunch", "breakfast"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              tab === t ? "bg-red-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {t} · ${data ? data[t].price.toFixed(2) : "—"}
          </button>
        ))}
      </div>

      {!meal || meal.days.length === 0 ? (
        <p className="text-sm text-white/40 italic">No menu published for this week yet.</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {meal.days.map((day) => (
            <li key={day.date} className="rounded-lg bg-white/5 p-2.5">
              <p className="mb-1 text-xs font-semibold text-red-200">
                {new Date(`${day.date}T00:00:00`).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
              </p>
              <p className="text-xs text-white/60">{day.items.join(" · ")}</p>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

export function SchoolLunchMenu() {
  return (
    <div>
      <div className="mb-3">
        <p className="text-sm italic font-medium text-white/60">Argyle ISD · Live from Nutrislice</p>
        <h2 className="font-ayuthaya text-2xl font-bold">This Week&apos;s School Menu</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SchoolMenuCard schoolKey="elementary" label="Anika · Jane Ruestmann Elementary" />
        <SchoolMenuCard schoolKey="high_school" label="Pranshu · Argyle High School" />
      </div>
    </div>
  );
}
