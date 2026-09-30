"use client";

import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";

type Entry = {
  id: number;
  description: string;
  amount: number;
  entry_type: string;
  date: string;
  is_bill: boolean;
};

export function BillsWidget() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    apiGet<Entry[]>("/api/finance/entries").then(setEntries).catch(() => {});
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const bills = entries
    .filter((e) => e.is_bill && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return (
    <GlassCard glow="radial-gradient(circle, #f87171, transparent 70%)">
      <p className="mb-3 text-sm italic font-medium text-white/60">Upcoming Bills</p>
      {bills.length === 0 ? (
        <p className="text-sm text-white/50 italic">No upcoming bills.</p>
      ) : (
        <ul className="space-y-2.5">
          {bills.map((b) => (
            <li key={b.id} className="flex items-center gap-2.5">
              <Receipt className="size-4 shrink-0 text-red-300" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.description}</p>
                <p className="text-xs text-white/50">
                  {new Date(b.date).toLocaleDateString([], { month: "short", day: "numeric" })}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-red-300">
                ${b.amount.toFixed(0)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
