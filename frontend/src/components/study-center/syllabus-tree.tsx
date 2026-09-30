"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ListTree, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet, apiPatch } from "@/lib/api";
import type { SyllabusUnit } from "@/components/study-center/types";

export function SyllabusTree({ person, subject }: { person: string; subject: string }) {
  const [units, setUnits] = useState<SyllabusUnit[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function load() {
    apiGet<SyllabusUnit[]>(`/api/study/syllabus?person=${person}&subject=${encodeURIComponent(subject)}`)
      .then(setUnits)
      .catch(() => setUnits([]));
  }

  useEffect(load, [person, subject]);

  const topLevel = useMemo(() => units.filter((u) => u.parent_id === null), [units]);
  const childrenOf = (id: number) => units.filter((u) => u.parent_id === id);

  async function toggleComplete(unit: SyllabusUnit) {
    await apiPatch(`/api/study/syllabus/${unit.id}`, { completed: !unit.completed });
    load();
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (units.length === 0) {
    return null;
  }

  const totalChapters = units.filter((u) => u.parent_id !== null).length;
  const completedChapters = units.filter((u) => u.parent_id !== null && u.completed).length;
  const pct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return (
    <GlassCard glow="radial-gradient(circle, #818cf8, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">TEKS-aligned Syllabus · {subject}</p>
          <h2 className="font-ayuthaya flex items-center gap-2 text-xl font-bold">
            <ListTree className="size-5 text-indigo-300" /> Units &amp; Chapters
          </h2>
        </div>
        <span className="text-sm font-semibold text-indigo-300">{pct}% complete</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />
      </div>

      <ul className="space-y-1.5">
        {topLevel.map((unit) => {
          const chapters = childrenOf(unit.id);
          const isOpen = expanded.has(unit.id);
          const unitDone = chapters.length > 0 && chapters.every((c) => c.completed);
          return (
            <li key={unit.id} className="rounded-xl bg-white/5">
              <button
                onClick={() => toggleExpand(unit.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left"
              >
                {isOpen ? <ChevronDown className="size-4 shrink-0 text-white/40" /> : <ChevronRight className="size-4 shrink-0 text-white/40" />}
                <span className={`flex-1 text-sm font-medium ${unitDone ? "text-emerald-300 line-through" : ""}`}>
                  {unit.title}
                </span>
                <span className="shrink-0 text-[11px] text-white/40">
                  {chapters.filter((c) => c.completed).length}/{chapters.length}
                </span>
              </button>
              {isOpen ? (
                <ul className="space-y-1 px-3 pb-2 pl-9">
                  {chapters.map((chapter) => (
                    <li key={chapter.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggleComplete(chapter)}
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          chapter.completed
                            ? "border-emerald-400 bg-emerald-400 text-black"
                            : "border-white/30 text-white/40 hover:bg-white/10"
                        }`}
                        aria-label="Mark chapter completed"
                      >
                        <Check className="size-3" />
                      </button>
                      <span className={`text-sm ${chapter.completed ? "text-white/40 line-through" : "text-white/80"}`}>
                        {chapter.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
