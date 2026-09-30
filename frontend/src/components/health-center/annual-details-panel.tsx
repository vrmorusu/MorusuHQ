"use client";

import { useState } from "react";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiDelete } from "@/lib/api";
import type { HealthRecord } from "@/components/health-center/types";

const RECORD_TYPES = ["annual_checkup", "vaccination", "dental", "vision", "appointment", "other"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function AnnualDetailsPanel({
  person,
  records,
  onChanged,
}: {
  person: string;
  records: HealthRecord[];
  onChanged: () => void;
}) {
  const [description, setDescription] = useState("");
  const [recordType, setRecordType] = useState(RECORD_TYPES[0]);
  const [date, setDate] = useState(todayIso());
  const [submitting, setSubmitting] = useState(false);

  const personRecords = records
    .filter((r) => r.family_member === person)
    .sort((a, b) => b.date.localeCompare(a.date));

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/api/health-tracking/records", {
        family_member: person,
        record_type: recordType,
        description,
        date,
      });
      setDescription("");
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/health-tracking/records/${id}`);
    onChanged();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #22d3ee, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Health Records</p>
          <h2 className="font-ayuthaya flex items-center gap-2 text-xl font-bold">
            <ClipboardList className="size-5 text-cyan-300" /> Annual Details
          </h2>
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Annual physical with Dr. Lee"
          className="min-w-40 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
        />
        <select
          value={recordType}
          onChange={(e) => setRecordType(e.target.value)}
          className="rounded-md border border-white/20 bg-white/5 px-2 py-2 text-sm text-white"
        >
          {RECORD_TYPES.map((t) => (
            <option key={t} value={t} className="text-black">
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border-white/20 bg-white/5 text-white" />
        <Button type="submit" disabled={submitting} className="bg-cyan-500 hover:bg-cyan-400">
          <Plus className="size-4" /> Add
        </Button>
      </form>

      {personRecords.length === 0 ? (
        <p className="text-sm text-white/40 italic">No records logged yet.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {personRecords.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] tracking-wide text-cyan-200 uppercase">
                {r.record_type.replace("_", " ")}
              </span>
              <span className="flex-1 truncate text-sm">{r.description}</span>
              <span className="shrink-0 text-xs text-white/40">
                {new Date(`${r.date}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <button
                onClick={() => handleDelete(r.id)}
                className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Delete record"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
