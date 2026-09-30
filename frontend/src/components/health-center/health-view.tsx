"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { MetricCard } from "@/components/health-center/metric-card";
import { AnnualDetailsPanel } from "@/components/health-center/annual-details-panel";
import { IntegrationsWidget } from "@/components/health-center/integrations-widget";
import { apiGet } from "@/lib/api";
import {
  HEALTH_PERSONS,
  METRIC_CONFIGS,
  PERSON_METRICS,
  type HealthMetric,
  type HealthRecord,
} from "@/components/health-center/types";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function HealthView() {
  const [person, setPerson] = useState(HEALTH_PERSONS[0].name);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);

  function loadMetrics() {
    apiGet<HealthMetric[]>(`/api/health-tracking/metrics?person=${person}`).then(setMetrics).catch(() => {});
  }

  function loadRecords() {
    apiGet<HealthRecord[]>("/api/health-tracking/records").then(setRecords).catch(() => {});
  }

  useEffect(() => {
    loadMetrics();
  }, [person]);

  useEffect(loadRecords, []);

  const applicableMetrics = PERSON_METRICS[person] ?? [];

  return (
    <div className="health-center">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between text-white">
          <BrandMark tagline={false} variant="light" />
          <div className="flex items-center gap-2">
            <Link
              href="/modules"
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            >
              <LayoutGrid className="size-4" />
              All Modules
            </Link>
            <Link
              href="/"
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="size-4" />
              Command Center
            </Link>
          </div>
        </header>

        <main className="space-y-5">
          <Reveal delay={0}>
            <div className="glass flex flex-wrap gap-1.5 rounded-2xl p-1.5">
              {HEALTH_PERSONS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setPerson(p.name)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-base font-semibold transition-colors ${
                    person === p.name ? "bg-rose-500 text-white" : "text-white/60 hover:bg-white/10"
                  }`}
                >
                  <span className="text-xl">{p.emoji}</span> {p.name}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {applicableMetrics.map((metricType, i) => (
              <Reveal key={metricType} delay={60 + i * 40}>
                <MetricCard
                  person={person}
                  config={METRIC_CONFIGS[metricType]}
                  entries={metrics.filter((m) => m.metric_type === metricType)}
                  onChanged={loadMetrics}
                />
              </Reveal>
            ))}
          </div>

          <Reveal delay={60 + applicableMetrics.length * 40}>
            <AnnualDetailsPanel person={person} records={records} onChanged={loadRecords} />
          </Reveal>

          <Reveal delay={120 + applicableMetrics.length * 40}>
            <IntegrationsWidget person={person} onImported={loadMetrics} />
          </Reveal>
        </main>
      </div>
    </div>
  );
}
