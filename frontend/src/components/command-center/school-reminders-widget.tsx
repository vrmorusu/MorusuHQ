"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";

type Entry = { id: number; title: string; value?: string | null; date: string };

export function SchoolRemindersWidget() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    apiGet<Entry[]>("/api/school/").then(setEntries).catch(() => {});
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = entries.filter((e) => e.date >= today);
  const list = (upcoming.length > 0 ? upcoming : entries).slice(0, 4);

  return (
    <GlassCard glow="radial-gradient(circle, #38bdf8, transparent 70%)">
      <p className="mb-3 text-sm italic font-medium text-white/60">School Reminders</p>
      {list.length === 0 ? (
        <p className="text-sm text-white/50 italic">Nothing due — all caught up.</p>
      ) : (
        <ul className="space-y-2.5">
          {list.map((e) => (
            <li key={e.id} className="flex items-start gap-2.5">
              <GraduationCap className="mt-0.5 size-4 shrink-0 text-sky-300" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="text-xs text-white/50">
                  {new Date(e.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                  {e.value ? ` · ${e.value}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
