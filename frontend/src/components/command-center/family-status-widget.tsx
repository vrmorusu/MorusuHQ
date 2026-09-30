"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet, apiPatch } from "@/lib/api";

type Member = {
  id: number;
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: string;
};

const STATUS_CYCLE = ["home", "school", "work", "away"];

const STATUS_STYLES: Record<string, string> = {
  home: "bg-emerald-400",
  school: "bg-sky-400",
  work: "bg-violet-400",
  away: "bg-white/30",
};

const RING_STYLES: Record<string, string> = {
  blue: "ring-sky-400/60",
  rose: "ring-rose-400/60",
  violet: "ring-violet-400/60",
  amber: "ring-amber-400/60",
};

export function FamilyStatusWidget() {
  const [members, setMembers] = useState<Member[]>([]);

  function load() {
    apiGet<Member[]>("/api/family/members").then(setMembers).catch(() => {});
  }

  useEffect(load, []);

  async function cycleStatus(member: Member) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(member.status) + 1) % STATUS_CYCLE.length];
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, status: next } : m)));
    await apiPatch(`/api/family/members/${member.id}`, { status: next });
  }

  return (
    <GlassCard glow="radial-gradient(circle, #22d3ee, transparent 70%)">
      <p className="mb-3 text-sm italic font-medium text-white/60">Family Status</p>
      <div className="flex flex-wrap gap-4">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => cycleStatus(m)}
            className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
          >
            <span
              className={`relative flex size-14 items-center justify-center rounded-full bg-white/10 text-2xl ring-2 ${
                RING_STYLES[m.color] ?? "ring-white/40"
              }`}
            >
              {m.emoji}
              <span
                className={`absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-[#0a0e1f] ${
                  STATUS_STYLES[m.status]
                }`}
              />
            </span>
            <span className="text-xs font-medium text-white/80">{m.name}</span>
            <span className="text-[10px] capitalize text-white/50">{m.status}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
