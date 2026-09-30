"use client";

import { useState } from "react";
import { Check, Trash2, Pencil, Repeat, X, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPatch, apiDelete } from "@/lib/api";
import type { Chore } from "@/components/chores-center/types";

export function ChoreCard({ chore, onChanged }: { chore: Chore; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chore.title);
  const [points, setPoints] = useState(String(chore.points));
  const [recurring, setRecurring] = useState(chore.recurring);
  const [intervalDays, setIntervalDays] = useState(chore.interval_days ?? 7);
  const [busy, setBusy] = useState(false);

  async function toggleDone() {
    setBusy(true);
    try {
      await apiPatch(`/api/chores/${chore.id}`, { done: !chore.done });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    await apiDelete(`/api/chores/${chore.id}`);
    onChanged();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiPatch(`/api/chores/${chore.id}`, {
        title,
        points: parseInt(points, 10) || 0,
        recurring,
        interval_days: recurring ? intervalDays : null,
      });
      setEditing(false);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2 rounded-xl bg-white/10 p-2.5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-white/20 bg-white/5 text-sm text-white"
        />
        <div className="flex gap-2">
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-20 border-white/20 bg-white/5 text-sm text-white"
          />
          <label className="flex items-center gap-1.5 text-xs text-white/70">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="size-3.5 rounded border-white/30 bg-white/5 accent-fuchsia-400"
            />
            Recurring
          </label>
          {recurring ? (
            <select
              value={intervalDays}
              onChange={(e) => setIntervalDays(Number(e.target.value))}
              className="rounded-md border border-white/20 bg-white/5 px-1 text-xs text-white"
            >
              <option value={1} className="text-black">
                Daily
              </option>
              <option value={7} className="text-black">
                Weekly
              </option>
              <option value={15} className="text-black">
                Every 15d
              </option>
              <option value={30} className="text-black">
                Monthly
              </option>
            </select>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy} className="bg-fuchsia-500 hover:bg-fuchsia-400">
            <Check className="size-3.5" /> Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            <X className="size-3.5" /> Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`group flex items-center gap-2 rounded-xl bg-white/10 px-2.5 py-2 transition-opacity ${
        chore.done ? "opacity-55" : ""
      }`}
    >
      <button
        onClick={toggleDone}
        disabled={busy}
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
          chore.done ? "border-emerald-400 bg-emerald-400 text-black" : "border-white/40 text-white/60 hover:bg-white/10"
        }`}
        aria-label={chore.done ? "Reopen chore" : "Mark chore done"}
      >
        {chore.done ? <Undo2 className="size-3.5" /> : <Check className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${chore.done ? "line-through" : ""}`}>{chore.title}</p>
        <p className="flex items-center gap-1.5 text-[11px] text-white/40">
          {chore.points} pts
          {chore.recurring ? (
            <span className="flex items-center gap-0.5">
              <Repeat className="size-3" /> every {chore.interval_days}d
            </span>
          ) : null}
        </p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="shrink-0 rounded-full p-1.5 text-white/40 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
        aria-label="Edit chore"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        onClick={handleDelete}
        className="shrink-0 rounded-full p-1.5 text-white/40 opacity-0 transition-opacity hover:bg-white/10 hover:text-white group-hover:opacity-100"
        aria-label="Delete chore"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
