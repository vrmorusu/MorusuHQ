"use client";

import { Trash2, Receipt } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiDelete } from "@/lib/api";
import type { FinanceEntry } from "@/components/finance-center/types";

export function AllTransactionsTable({
  monthLabel,
  entries,
  onChanged,
}: {
  monthLabel: string;
  entries: FinanceEntry[];
  onChanged: () => void;
}) {
  async function handleDelete(id: number) {
    await apiDelete(`/api/finance/entries/${id}`);
    onChanged();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #facc15, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">All Transactions</p>
        <h3 className="font-ayuthaya text-lg font-bold">{monthLabel}</h3>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-white/40 italic">No transactions this month yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-white/40">
                <th className="pb-2 pr-3 font-medium">Date</th>
                <th className="pb-2 pr-3 font-medium">Description</th>
                <th className="pb-2 pr-3 font-medium">Category</th>
                <th className="pb-2 pr-3 font-medium">Type</th>
                <th className="pb-2 pr-3 text-right font-medium">Amount</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-3 whitespace-nowrap text-white/60">
                    {new Date(`${e.date}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </td>
                  <td className="py-2 pr-3">
                    <span className="flex items-center gap-1.5">
                      {e.description}
                      {e.is_bill ? <Receipt className="size-3.5 text-amber-300" aria-label="Bill" /> : null}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-white/60">{e.category || "Uncategorized"}</td>
                  <td className="py-2 pr-3 capitalize text-white/60">{e.entry_type}</td>
                  <td
                    className={`py-2 pr-3 text-right font-semibold ${
                      e.entry_type === "income" ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {e.entry_type === "income" ? "+" : "-"}${e.amount.toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
