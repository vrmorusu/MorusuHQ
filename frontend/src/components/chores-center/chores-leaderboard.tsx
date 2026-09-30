"use client";

import { Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { Chore, FamilyMember } from "@/components/chores-center/types";

function isThisMonth(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T00:00:00`);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function ChoresLeaderboard({ members, chores }: { members: FamilyMember[]; chores: Chore[] }) {
  const rows = members
    .map((m) => {
      const points = chores
        .filter((c) => c.assignee === m.name && c.done && isThisMonth(c.due_date))
        .reduce((s, c) => s + c.points, 0);
      return { member: m, points };
    })
    .sort((a, b) => b.points - a.points);

  const monthLabel = new Date().toLocaleDateString([], { month: "long", year: "numeric" });

  return (
    <GlassCard glow="radial-gradient(circle, #facc15, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Resets fresh every month</p>
          <h2 className="font-ayuthaya text-xl font-bold">{monthLabel} Rewards Leaderboard</h2>
        </div>
        <Trophy className="size-6 text-amber-300" />
      </div>
      <div className="flex flex-wrap gap-3">
        {rows.map((r, i) => (
          <div
            key={r.member.id}
            className="flex min-w-36 flex-1 items-center gap-2.5 rounded-2xl bg-white/10 px-3 py-2.5"
          >
            <span className="text-xl">{MEDALS[i] ?? "🎗️"}</span>
            <span className="text-xl">{r.member.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{r.member.name}</p>
              <p className="text-xs text-amber-300">{r.points} pts</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
