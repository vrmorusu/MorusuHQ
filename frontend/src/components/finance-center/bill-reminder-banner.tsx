"use client";

import { AlertTriangle } from "lucide-react";
import type { FinanceEntry } from "@/components/finance-center/types";

const REMINDER_WINDOW_DAYS = 3;

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function BillReminderBanner({ entries }: { entries: FinanceEntry[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const dueSoon = entries
    .filter((e) => e.is_bill && e.date >= today && daysUntil(e.date) <= REMINDER_WINDOW_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (dueSoon.length === 0) return null;

  return (
    <div className="glass mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/30 px-5 py-3 text-white">
      <AlertTriangle className="size-5 shrink-0 text-amber-300" />
      <p className="text-sm font-medium">
        {dueSoon.length === 1 ? "1 bill due soon:" : `${dueSoon.length} bills due soon:`}
      </p>
      <div className="flex flex-wrap gap-2">
        {dueSoon.map((b) => {
          const due = daysUntil(b.date);
          return (
            <span key={b.id} className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-200">
              {b.description} · {due <= 0 ? "Due today" : due === 1 ? "Tomorrow" : `${due}d`} · ${b.amount.toFixed(0)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
