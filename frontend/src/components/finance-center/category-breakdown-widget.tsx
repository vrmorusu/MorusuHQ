"use client";

import { PieChart } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const BAR_COLORS = ["bg-amber-400", "bg-emerald-400", "bg-rose-400", "bg-sky-400", "bg-violet-400", "bg-teal-400"];

export function CategoryBreakdownWidget({
  categories,
}: {
  categories: { category: string; amount: number }[];
}) {
  const total = categories.reduce((sum, c) => sum + c.amount, 0);

  return (
    <GlassCard glow="radial-gradient(circle, #fb923c, transparent 70%)" className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Spending by Category</p>
        <PieChart className="size-4 text-white/40" />
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-white/40 italic">No expenses this month yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {categories.map((c, i) => {
            const pct = total > 0 ? Math.round((c.amount / total) * 100) : 0;
            return (
              <li key={c.category}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate">{c.category}</span>
                  <span className="shrink-0 text-white/60">${c.amount.toFixed(0)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
