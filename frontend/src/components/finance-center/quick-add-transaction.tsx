"use client";

import { useState } from "react";
import { Plus, Receipt, Repeat } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { categoriesFor } from "@/lib/finance-categories";

const INTERVALS = [
  { value: 7, label: "Weekly" },
  { value: 14, label: "Bi-weekly (14d)" },
  { value: 15, label: "Semi-monthly (15d)" },
  { value: 30, label: "Monthly" },
  { value: 90, label: "Quarterly" },
  { value: 365, label: "Annually" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function QuickAddTransaction({ onChanged }: { onChanged: () => void }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [entryType, setEntryType] = useState("expense");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(todayIso());
  const [isBill, setIsBill] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [intervalDays, setIntervalDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const categories = categoriesFor(entryType);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description.trim() || Number.isNaN(amt)) return;
    setSubmitting(true);
    try {
      if (isRecurring) {
        await apiPost("/api/finance/recurring", {
          description,
          amount: amt,
          entry_type: entryType,
          category: category || null,
          interval_days: intervalDays,
          start_date: date,
          is_bill: entryType === "expense" && isBill,
        });
      } else {
        await apiPost("/api/finance/entries", {
          description,
          amount: amt,
          entry_type: entryType,
          category: category || null,
          date,
          is_bill: entryType === "expense" && isBill,
        });
      }
      setDescription("");
      setAmount("");
      setCategory("");
      setIsBill(false);
      setIsRecurring(false);
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard glow="radial-gradient(circle, #34d399, transparent 70%)" className="h-full">
      <p className="mb-1 text-sm italic font-medium text-white/60">Quick Add</p>
      <h3 className="font-ayuthaya mb-3 text-xl font-bold">Transaction or Bill</h3>

      <form onSubmit={handleAdd} className="space-y-2">
        <Label className="text-xs text-white/50">
          <Receipt className="size-3.5" /> Description
        </Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
        />
        <div className="flex gap-2">
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <select
            value={entryType}
            onChange={(e) => {
              setEntryType(e.target.value);
              setCategory("");
            }}
            className="rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white"
          >
            <option value="expense" className="text-black">
              Expense
            </option>
            <option value="income" className="text-black">
              Income
            </option>
          </select>
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 rounded-md border border-white/20 bg-white/5 px-2 py-2 text-sm text-white"
          >
            <option value="" className="text-black">
              Select category…
            </option>
            {categories.map((c) => (
              <option key={c} value={c} className="text-black">
                {c}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-white/20 bg-white/5 text-white"
          />
        </div>
        {entryType === "expense" ? (
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={isBill}
              onChange={(e) => setIsBill(e.target.checked)}
              className="size-4 rounded border-white/30 bg-white/5 accent-amber-400"
            />
            This is a bill (show reminder)
          </label>
        ) : null}
        <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
          <label className="flex flex-1 items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="size-4 rounded border-white/30 bg-white/5 accent-violet-400"
            />
            <Repeat className="size-3.5 text-violet-300" />
            Make recurring
          </label>
          {isRecurring ? (
            <select
              value={intervalDays}
              onChange={(e) => setIntervalDays(Number(e.target.value))}
              className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-sm text-white"
            >
              {INTERVALS.map((i) => (
                <option key={i.value} value={i.value} className="text-black">
                  {i.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <Button type="submit" disabled={submitting} className="w-full bg-emerald-500 hover:bg-emerald-400">
          <Plus /> Add {isRecurring ? "Recurring " : ""}
          {entryType === "expense" && isBill ? "Bill" : "Transaction"}
        </Button>
      </form>
    </GlassCard>
  );
}
