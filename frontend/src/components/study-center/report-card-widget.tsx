"use client";

import { useEffect, useState } from "react";
import { Award, Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";
import type { ReportCard } from "@/components/study-center/types";

export function ReportCardWidget({ person }: { person: string }) {
  const [data, setData] = useState<ReportCard | null>(null);

  useEffect(() => {
    apiGet<ReportCard>(`/api/study/report-card?person=${person}`).then(setData).catch(() => {});
  }, [person]);

  return (
    <GlassCard glow="radial-gradient(circle, #fbbf24, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Report Card</p>
          <h2 className="font-ayuthaya flex items-center gap-2 text-xl font-bold">
            <Award className="size-5 text-amber-300" /> GPA Summary
          </h2>
        </div>
      </div>

      {data ? (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-[11px] text-white/40 uppercase">Unweighted GPA</p>
              <p className="font-ayuthaya text-3xl font-bold text-amber-300">{data.unweighted_gpa ?? "—"}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-[11px] text-white/40 uppercase">Weighted GPA</p>
              <p className="font-ayuthaya text-3xl font-bold text-amber-300">{data.weighted_gpa ?? "—"}</p>
            </div>
          </div>

          <div className="mb-3 space-y-1.5">
            {data.analysis.map((line, i) => (
              <p key={i} className="flex items-start gap-1.5 rounded-lg bg-white/5 px-2.5 py-2 text-xs text-white/70">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-300" /> {line}
              </p>
            ))}
          </div>
          <p className="text-[11px] text-white/30 italic">{data.analysis_note}</p>
        </>
      ) : (
        <p className="text-sm text-white/40 italic">Loading…</p>
      )}
    </GlassCard>
  );
}
