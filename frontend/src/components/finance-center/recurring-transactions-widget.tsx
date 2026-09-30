"use client";

import { useState } from "react";
import { Trash2, Pencil, Repeat, X, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPatch, apiDelete } from "@/lib/api";
import { categoriesFor } from "@/lib/finance-categories";
import type { RecurringRule } from "@/components/finance-center/types";

const INTERVALS = [
  { value: 7, label: "Weekly" },
  { value: 14, label: "Bi-weekly (14d)" },
  { value: 15, label: "Semi-monthly (15d)" },
  { value: 30, label: "Monthly" },
  { value: 90, label: "Quarterly" },
  { value: 365, label: "Annually" },
];

type FormState = {
  description: string;
  amount: string;
  entryType: string;
  category: string;
  intervalDays: number;
  isBill: boolean;
};

export function RecurringTransactionsWidget({
  rules,
  onChanged,
}: {
  rules: RecurringRule[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function startEdit(rule: RecurringRule) {
    setEditingId(rule.id);
    setForm({
      description: rule.description,
      amount: String(rule.amount),
      entryType: rule.entry_type,
      category: rule.category || "",
      intervalDays: rule.interval_days,
      isBill: rule.is_bill,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !form) return;
    const amt = parseFloat(form.amount);
    if (!form.description.trim() || Number.isNaN(amt)) return;
    setSubmitting(true);
    try {
      await apiPatch(`/api/finance/recurring/${editingId}`, {
        description: form.description,
        amount: amt,
        entry_type: form.entryType,
        category: form.category || null,
        interval_days: form.intervalDays,
        is_bill: form.entryType === "expense" && form.isBill,
      });
      cancelEdit();
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/finance/recurring/${id}`);
    if (editingId === id) cancelEdit();
    onChanged();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #a78bfa, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Recurring Transactions</p>
        <Repeat className="size-4 text-white/40" />
      </div>

      {rules.length === 0 ? (
        <p className="text-sm text-white/40 italic">
          No recurring transactions yet. Use &ldquo;Make recurring&rdquo; in Quick Add to create one.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {rules.map((r) =>
            editingId === r.id && form ? (
              <li key={r.id}>
                <form onSubmit={handleSave} className="space-y-2 rounded-lg bg-white/5 p-3">
                  <div className="flex gap-2">
                    <Input
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="border-white/20 bg-white/5 text-white"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-28 border-white/20 bg-white/5 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={form.entryType}
                      onChange={(e) => setForm({ ...form, entryType: e.target.value, category: "" })}
                      className="rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white"
                    >
                      <option value="expense" className="text-black">
                        Expense
                      </option>
                      <option value="income" className="text-black">
                        Income
                      </option>
                    </select>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="flex-1 rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white"
                    >
                      <option value="" className="text-black">
                        Select category…
                      </option>
                      {categoriesFor(form.entryType).map((c) => (
                        <option key={c} value={c} className="text-black">
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={form.intervalDays}
                      onChange={(e) => setForm({ ...form, intervalDays: Number(e.target.value) })}
                      className="rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white"
                    >
                      {INTERVALS.map((i) => (
                        <option key={i.value} value={i.value} className="text-black">
                          {i.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.entryType === "expense" ? (
                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={form.isBill}
                        onChange={(e) => setForm({ ...form, isBill: e.target.checked })}
                        className="size-4 rounded border-white/30 bg-white/5 accent-amber-400"
                      />
                      This is a bill (show reminder)
                    </label>
                  ) : null}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={submitting} size="sm" className="bg-violet-500 hover:bg-violet-400">
                      <Check className="size-3.5" /> Save
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}>
                      <X className="size-3.5" /> Cancel
                    </Button>
                  </div>
                </form>
              </li>
            ) : (
              <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2 py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.description}</p>
                  <p className="text-[11px] text-white/40">
                    Every {r.interval_days}d · next{" "}
                    {new Date(`${r.next_date}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}
                    {r.category ? ` · ${r.category}` : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    r.entry_type === "income" ? "text-emerald-300" : "text-rose-300"
                  }`}
                >
                  {r.entry_type === "income" ? "+" : "-"}${r.amount.toFixed(0)}
                </span>
                <button
                  onClick={() => startEdit(r)}
                  className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Edit recurring transaction"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Delete recurring transaction"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            )
          )}
        </ul>
      )}
    </GlassCard>
  );
}
