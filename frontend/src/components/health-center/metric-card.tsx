"use client";

import { useState } from "react";
import { Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiDelete } from "@/lib/api";
import type { HealthMetric, MetricConfig } from "@/components/health-center/types";

const COLOR_STYLES: Record<string, { text: string; bg: string; ring: string }> = {
  rose: { text: "text-rose-300", bg: "bg-rose-500 hover:bg-rose-400", ring: "#fb7185" },
  sky: { text: "text-sky-300", bg: "bg-sky-500 hover:bg-sky-400", ring: "#38bdf8" },
  emerald: { text: "text-emerald-300", bg: "bg-emerald-500 hover:bg-emerald-400", ring: "#34d399" },
  red: { text: "text-red-300", bg: "bg-red-500 hover:bg-red-400", ring: "#f87171" },
  amber: { text: "text-amber-300", bg: "bg-amber-500 hover:bg-amber-400", ring: "#fbbf24" },
  violet: { text: "text-violet-300", bg: "bg-violet-500 hover:bg-violet-400", ring: "#a78bfa" },
  orange: { text: "text-orange-300", bg: "bg-orange-500 hover:bg-orange-400", ring: "#fb923c" },
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function MetricCard({
  person,
  config,
  entries,
  onChanged,
}: {
  person: string;
  config: MetricConfig;
  entries: HealthMetric[];
  onChanged: () => void;
}) {
  const [value, setValue] = useState("");
  const [secondary, setSecondary] = useState("");
  const [date, setDate] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const style = COLOR_STYLES[config.color] ?? COLOR_STYLES.rose;
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];
  const previous = sorted[1];

  let trend: "up" | "down" | null = null;
  if (latest && previous) {
    if (latest.value > previous.value) trend = "up";
    else if (latest.value < previous.value) trend = "down";
  }
  const trendGood = trend && config.higherIsBetter !== null ? (trend === "up") === config.higherIsBetter : null;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const v = parseFloat(value);
    if (Number.isNaN(v)) return;
    setSubmitting(true);
    try {
      await apiPost("/api/health-tracking/metrics", {
        person,
        metric_type: config.type,
        value: v,
        value_secondary: config.hasSecondary && secondary ? parseFloat(secondary) : null,
        unit: config.unit,
        date,
        source: "manual",
      });
      setValue("");
      setSecondary("");
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/health-tracking/metrics/${id}`);
    onChanged();
  }

  return (
    <GlassCard glow={`radial-gradient(circle, ${style.ring}, transparent 70%)`} className="h-full">
      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium text-white/70">
          <span>{config.icon}</span> {config.label}
        </p>
        {trend ? (
          trend === "up" ? (
            <TrendingUp className={`size-4 ${trendGood === false ? "text-rose-400" : "text-emerald-400"}`} />
          ) : (
            <TrendingDown className={`size-4 ${trendGood === false ? "text-rose-400" : "text-emerald-400"}`} />
          )
        ) : null}
      </div>

      <div className="mb-3">
        {latest ? (
          <p className={`font-ayuthaya text-3xl font-bold ${style.text}`}>
            {latest.value}
            {config.hasSecondary && latest.value_secondary != null ? `/${latest.value_secondary}` : ""}
            <span className="ml-1 text-sm font-normal text-white/40">{config.unit}</span>
          </p>
        ) : (
          <p className="text-sm text-white/40 italic">No entries yet.</p>
        )}
        {latest ? (
          <button onClick={() => setShowHistory((s) => !s)} className="text-[11px] text-white/40 hover:text-white/70">
            {new Date(`${latest.date}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })} ·{" "}
            {showHistory ? "hide" : "show"} history ({entries.length})
          </button>
        ) : null}
      </div>

      {showHistory ? (
        <ul className="mb-3 max-h-32 space-y-1 overflow-y-auto">
          {sorted.map((e) => (
            <li key={e.id} className="flex items-center justify-between text-xs text-white/50">
              <span>
                {new Date(`${e.date}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })} — {e.value}
                {config.hasSecondary && e.value_secondary != null ? `/${e.value_secondary}` : ""} {e.unit}
                {e.source !== "manual" ? ` (${e.source})` : ""}
              </span>
              <button onClick={() => handleDelete(e.id)} className="text-white/30 hover:text-white/70">
                <Trash2 className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-1.5">
        <Input
          type="number"
          step="0.1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={config.hasSecondary ? "Systolic" : "Value"}
          className="w-20 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30"
        />
        {config.hasSecondary ? (
          <Input
            type="number"
            step="0.1"
            value={secondary}
            onChange={(e) => setSecondary(e.target.value)}
            placeholder={config.secondaryLabel}
            className="w-20 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30"
          />
        ) : null}
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-white/20 bg-white/5 text-sm text-white"
        />
        <Button type="submit" size="sm" disabled={submitting} className={style.bg}>
          <Plus className="size-3.5" />
        </Button>
      </form>
    </GlassCard>
  );
}
