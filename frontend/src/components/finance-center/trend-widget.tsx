"use client";

import { BarChart3 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function TrendWidget({
  trend,
}: {
  trend: { label: string; income: number; expense: number }[];
}) {
  const max = Math.max(1, ...trend.map((t) => Math.max(t.income, t.expense)));

  return (
    <GlassCard glow="radial-gradient(circle, #22d3ee, transparent 70%)" className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">6-Month Trend</p>
        <BarChart3 className="size-4 text-white/40" />
      </div>
      <div className="flex h-32 items-end justify-between gap-2">
        {trend.map((t) => (
          <div key={t.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center gap-0.5">
              <div
                className="w-2.5 rounded-t-sm bg-emerald-400"
                style={{ height: `${Math.max(4, (t.income / max) * 100)}%` }}
                title={`Income: $${t.income.toFixed(0)}`}
              />
              <div
                className="w-2.5 rounded-t-sm bg-rose-400"
                style={{ height: `${Math.max(4, (t.expense / max) * 100)}%` }}
                title={`Expense: $${t.expense.toFixed(0)}`}
              />
            </div>
            <span className="text-[10px] text-white/40">{t.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-3 text-[10px] text-white/50">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-emerald-400" /> Income
        </span>
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-rose-400" /> Expense
        </span>
      </div>
    </GlassCard>
  );
}
