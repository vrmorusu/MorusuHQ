"use client";

import { useEffect, useState } from "react";
import { BookMarked, Sparkles, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost } from "@/lib/api";
import type { WeeklyShlokaWithDetail } from "@/components/study-center/types";

const DIFFICULTY_LABEL: Record<string, string> = {
  simple: "Simple",
  medium: "Medium",
  advanced: "Advanced",
};

export function WeeklyShlokaPanel({
  person,
  onPointsChanged,
}: {
  person: string;
  onPointsChanged?: () => void;
}) {
  const [data, setData] = useState<WeeklyShlokaWithDetail | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    apiGet<WeeklyShlokaWithDetail | null>(`/api/study/weekly-shloka?person=${person}`)
      .then(setData)
      .catch(() => {});
  }

  useEffect(load, [person]);

  async function handlePractice() {
    if (!data) return;
    setSubmitting(true);
    try {
      await apiPost(`/api/study/weekly-shloka/${data.assignment.id}/practice`, {});
      load();
      onPointsChanged?.();
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) {
    return (
      <GlassCard glow="radial-gradient(circle, #a78bfa, transparent 70%)">
        <p className="text-sm text-white/40 italic">No shlokas in the bank yet.</p>
      </GlassCard>
    );
  }

  const { assignment, shloka } = data;
  const weekLabel = new Date(`${assignment.week_start}T00:00:00`).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  return (
    <GlassCard glow="radial-gradient(circle, #a78bfa, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Week of {weekLabel}</p>
          <h2 className="font-ayuthaya flex items-center gap-2 text-xl font-bold">
            <BookMarked className="size-5 text-violet-300" /> This Week&apos;s Shloka
          </h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/60">
          {DIFFICULTY_LABEL[shloka.difficulty] ?? shloka.difficulty}
        </span>
      </div>

      <div className="mb-4 rounded-2xl bg-white/5 p-5 text-center">
        <p className="mb-2 text-sm font-semibold text-violet-200">{shloka.title}</p>
        <p className="font-ayuthaya mb-3 text-2xl leading-relaxed">{shloka.text}</p>
        {shloka.meaning ? <p className="text-sm text-white/50 italic">{shloka.meaning}</p> : null}
      </div>

      {assignment.practiced ? (
        <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-300">
          <Check className="size-4" /> Practiced this week — +{shloka.points} pts
        </p>
      ) : (
        <Button onClick={handlePractice} disabled={submitting} className="w-full bg-violet-500 hover:bg-violet-400">
          <Sparkles className="size-4" /> Mark as Practiced
        </Button>
      )}
    </GlassCard>
  );
}
