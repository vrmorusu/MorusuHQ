"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet, apiPatch } from "@/lib/api";

type Chore = {
  id: number;
  title: string;
  assignee?: string | null;
  points: number;
  done: boolean;
};

export function ChoresWidget() {
  const [chores, setChores] = useState<Chore[]>([]);

  function load() {
    apiGet<Chore[]>("/api/chores/").then(setChores).catch(() => {});
  }

  useEffect(load, []);

  async function toggle(chore: Chore) {
    setChores((prev) =>
      prev.map((c) => (c.id === chore.id ? { ...c, done: !c.done } : c))
    );
    await apiPatch(`/api/chores/${chore.id}`, { done: !chore.done });
  }

  const pending = chores.filter((c) => !c.done);

  return (
    <GlassCard glow="radial-gradient(circle, #facc15, transparent 70%)" className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Chores</p>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium">
          {pending.length} pending
        </span>
      </div>
      {chores.length === 0 ? (
        <p className="text-sm text-white/50 italic">No chores yet.</p>
      ) : (
        <ul className="space-y-2">
          {chores.slice(0, 6).map((c) => (
            <li key={c.id}>
              <button
                onClick={() => toggle(c)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/10 active:scale-[0.98]"
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    c.done ? "border-yellow-400 bg-yellow-400 text-black" : "border-white/30"
                  }`}
                >
                  {c.done ? <Check className="size-3.5" /> : null}
                </span>
                <span className={`truncate text-sm ${c.done ? "text-white/40 line-through" : ""}`}>
                  {c.title}
                </span>
                {c.assignee ? (
                  <span className="ml-auto shrink-0 text-xs text-white/40">{c.assignee}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
