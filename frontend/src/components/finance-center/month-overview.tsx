"use client";

import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function MonthOverview({
  monthDate,
  onPrevMonth,
  onNextMonth,
  income,
  expense,
}: {
  monthDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  income: number;
  expense: number;
}) {
  const balance = income - expense;
  const total = income + expense;
  const incomePct = total > 0 ? Math.round((income / total) * 100) : 50;

  return (
    <GlassCard glow="radial-gradient(circle, #facc15, transparent 70%)" className="h-full">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-ayuthaya text-2xl font-bold">
          {monthDate.toLocaleDateString([], { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={onPrevMonth}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-emerald-300">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide text-white/50">Income</span>
          </div>
          <p className="font-ayuthaya text-2xl font-bold text-emerald-300">${income.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-rose-300">
            <TrendingDown className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide text-white/50">Expenses</span>
          </div>
          <p className="font-ayuthaya text-2xl font-bold text-rose-300">${expense.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-amber-300">
            <Wallet className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide text-white/50">Balance</span>
          </div>
          <p className={`font-ayuthaya text-2xl font-bold ${balance >= 0 ? "text-amber-300" : "text-rose-300"}`}>
            {balance >= 0 ? "$" : "-$"}
            {Math.abs(balance).toFixed(0)}
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-white/50">
          <span>Income vs Expenses</span>
          <span>{incomePct}% income</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-emerald-400" style={{ width: `${incomePct}%` }} />
          <div className="h-full bg-rose-400" style={{ width: `${100 - incomePct}%` }} />
        </div>
      </div>
    </GlassCard>
  );
}
