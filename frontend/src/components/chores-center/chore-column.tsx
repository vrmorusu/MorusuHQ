"use client";

import { useState } from "react";
import { Plus, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";
import { ChoreCard } from "@/components/chores-center/chore-card";
import { inferAgeBand, AGE_BAND_LABELS, type Chore, type FamilyMember } from "@/components/chores-center/types";

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7; // days since Monday
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function isThisWeek(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  const start = startOfWeek(new Date());
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return d >= start && d < end;
}

export function ChoreColumn({
  member,
  chores,
  onChanged,
}: {
  member: FamilyMember | { id: string; name: string; emoji: string; role: string };
  chores: Chore[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("5");
  const [submitting, setSubmitting] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [applying, setApplying] = useState(false);

  const ageBand = inferAgeBand(member.role);
  const weekChores = chores.filter((c) => isThisWeek(c.due_date));
  const weekDone = weekChores.filter((c) => c.done);
  const pct = weekChores.length > 0 ? Math.round((weekDone.length / weekChores.length) * 100) : 0;
  const pointsEarned = weekDone.reduce((s, c) => s + c.points, 0);

  const todo = chores.filter((c) => !c.done);
  const done = chores.filter((c) => c.done);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/api/chores/", {
        title,
        assignee: member.name,
        points: parseInt(points, 10) || 0,
        done: false,
        due_date: new Date().toISOString().slice(0, 10),
        recurring: false,
      });
      setTitle("");
      setPoints("5");
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApplyDefaults() {
    setApplying(true);
    try {
      await apiPost("/api/chores/apply-template", { assignee: member.name, age_band: ageBand });
      onChanged();
    } finally {
      setApplying(false);
    }
  }

  return (
    <GlassCard glow="radial-gradient(circle, #f472b6, transparent 70%)" className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{member.emoji}</span>
          <div>
            <h3 className="font-ayuthaya text-lg font-bold">{member.name}</h3>
            <p className="text-[11px] text-white/40">{AGE_BAND_LABELS[ageBand]}</p>
          </div>
        </div>
      </div>

      <div className="mb-3 rounded-xl bg-white/5 p-2.5">
        <div className="mb-1 flex items-center justify-between text-[11px] text-white/50">
          <span>This week: {pct}% complete</span>
          <span className="flex items-center gap-1 text-amber-300">
            <Sparkles className="size-3" /> {pointsEarned} pts
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {chores.length === 0 ? (
        <Button
          type="button"
          size="sm"
          disabled={applying}
          onClick={handleApplyDefaults}
          className="mb-3 w-full bg-fuchsia-500 hover:bg-fuchsia-400"
        >
          <Sparkles className="size-3.5" /> Load starter chores
        </Button>
      ) : null}

      <form onSubmit={handleAdd} className="mb-3 flex gap-1.5">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New chore…"
          className="min-w-0 flex-1 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30"
        />
        <Input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-14 border-white/20 bg-white/5 text-sm text-white"
        />
        <Button type="submit" size="sm" disabled={submitting} className="shrink-0 bg-fuchsia-500 hover:bg-fuchsia-400">
          <Plus className="size-3.5" />
        </Button>
      </form>

      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {todo.length === 0 && done.length === 0 ? (
          <p className="text-sm text-white/40 italic">No chores yet.</p>
        ) : (
          todo.map((c) => <ChoreCard key={c.id} chore={c} onChanged={onChanged} />)
        )}
        {done.length > 0 ? (
          <div className="pt-1">
            <button
              onClick={() => setShowDone((s) => !s)}
              className="flex w-full items-center justify-between text-[11px] text-white/40 hover:text-white/70"
            >
              <span>{done.length} completed</span>
              {showDone ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
            {showDone ? (
              <div className="mt-1.5 space-y-1.5">
                {done.map((c) => (
                  <ChoreCard key={c.id} chore={c} onChanged={onChanged} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
