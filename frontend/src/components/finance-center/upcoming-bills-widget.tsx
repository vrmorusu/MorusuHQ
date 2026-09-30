"use client";

import { Receipt, AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { FinanceEntry } from "@/components/finance-center/types";

const REMINDER_WINDOW_DAYS = 3;

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function UpcomingBillsWidget({ entries }: { entries: FinanceEntry[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const bills = entries
    .filter((e) => e.is_bill && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <GlassCard glow="radial-gradient(circle, #f87171, transparent 70%)" className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Upcoming Bills</p>
        <Receipt className="size-4 text-white/40" />
      </div>
      {bills.length === 0 ? (
        <p className="text-sm text-white/40 italic">No upcoming bills.</p>
      ) : (
        <ul className="space-y-2.5">
          {bills.map((b) => {
            const due = daysUntil(b.date);
            const dueSoon = due <= REMINDER_WINDOW_DAYS;
            return (
              <li key={b.id} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    {b.description}
                    {dueSoon ? <AlertTriangle className="size-3.5 shrink-0 text-amber-300" /> : null}
                  </p>
                  <p className={`text-[11px] ${dueSoon ? "font-semibold text-amber-300" : "text-white/40"}`}>
                    {due === 0 ? "Due today" : due === 1 ? "Due tomorrow" : `Due in ${due} days`}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-rose-300">${b.amount.toFixed(0)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
