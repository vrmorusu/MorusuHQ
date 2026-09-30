"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, ListTree } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { AGE_BANDS, AGE_BAND_LABELS, type ChoreTemplate, type AgeBand } from "@/components/chores-center/types";

type FormState = { title: string; points: string; ageBand: AgeBand; recurring: boolean; intervalDays: number };

const EMPTY_FORM: FormState = { title: "", points: "5", ageBand: "child", recurring: true, intervalDays: 7 };

export function ChoreTemplatesPanel({
  templates,
  onChanged,
}: {
  templates: ChoreTemplate[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/api/chores/templates", {
        title: form.title,
        points: parseInt(form.points, 10) || 0,
        age_band: form.ageBand,
        recurring: form.recurring,
        interval_days: form.intervalDays,
      });
      setForm(EMPTY_FORM);
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit(t: ChoreTemplate) {
    setSubmitting(true);
    try {
      await apiPatch(`/api/chores/templates/${t.id}`, {
        title: form.title,
        points: parseInt(form.points, 10) || 0,
        recurring: form.recurring,
        interval_days: form.intervalDays,
      });
      setEditingId(null);
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/chores/templates/${id}`);
    onChanged();
  }

  function startEdit(t: ChoreTemplate) {
    setEditingId(t.id);
    setForm({ title: t.title, points: String(t.points), ageBand: t.age_band as AgeBand, recurring: t.recurring, intervalDays: t.interval_days });
  }

  return (
    <GlassCard glow="radial-gradient(circle, #fbbf24, transparent 70%)">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTree className="size-5 text-amber-300" />
          <h3 className="font-ayuthaya text-lg font-bold">Default Chore Templates</h3>
        </div>
        <span className="text-sm text-white/50">{open ? "Hide" : "Manage"}</span>
      </button>

      {open ? (
        <div className="mt-4 space-y-4">
          {AGE_BANDS.map((band) => (
            <div key={band}>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-white/50 uppercase">
                {AGE_BAND_LABELS[band]}
              </p>
              <ul className="space-y-1.5">
                {templates
                  .filter((t) => t.age_band === band)
                  .map((t) =>
                    editingId === t.id ? (
                      <li key={t.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-white/10 p-2">
                        <Input
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="min-w-32 flex-1 border-white/20 bg-white/5 text-sm text-white"
                        />
                        <Input
                          type="number"
                          value={form.points}
                          onChange={(e) => setForm({ ...form, points: e.target.value })}
                          className="w-16 border-white/20 bg-white/5 text-sm text-white"
                        />
                        <select
                          value={form.intervalDays}
                          onChange={(e) => setForm({ ...form, intervalDays: Number(e.target.value) })}
                          className="rounded-md border border-white/20 bg-white/5 px-1 text-xs text-white"
                        >
                          <option value={1} className="text-black">
                            Daily
                          </option>
                          <option value={7} className="text-black">
                            Weekly
                          </option>
                          <option value={15} className="text-black">
                            Every 15d
                          </option>
                          <option value={30} className="text-black">
                            Monthly
                          </option>
                        </select>
                        <Button type="button" size="sm" disabled={submitting} onClick={() => handleSaveEdit(t)} className="bg-amber-500 hover:bg-amber-400">
                          <Check className="size-3.5" />
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="size-3.5" />
                        </Button>
                      </li>
                    ) : (
                      <li key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
                        <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                        <span className="shrink-0 text-xs text-white/40">
                          {t.points} pts · every {t.interval_days}d
                        </span>
                        <button onClick={() => startEdit(t)} className="shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Edit template">
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Delete template">
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    )
                  )}
              </ul>
            </div>
          ))}

          <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
            <select
              value={form.ageBand}
              onChange={(e) => setForm({ ...form, ageBand: e.target.value as AgeBand })}
              className="rounded-md border border-white/20 bg-white/5 px-2 py-2 text-sm text-white"
            >
              {AGE_BANDS.map((b) => (
                <option key={b} value={b} className="text-black">
                  {AGE_BAND_LABELS[b]}
                </option>
              ))}
            </select>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="New template title"
              className="min-w-40 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
            />
            <Input
              type="number"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: e.target.value })}
              className="w-20 border-white/20 bg-white/5 text-white"
            />
            <select
              value={form.intervalDays}
              onChange={(e) => setForm({ ...form, intervalDays: Number(e.target.value) })}
              className="rounded-md border border-white/20 bg-white/5 px-2 text-sm text-white"
            >
              <option value={1} className="text-black">
                Daily
              </option>
              <option value={7} className="text-black">
                Weekly
              </option>
              <option value={15} className="text-black">
                Every 15d
              </option>
              <option value={30} className="text-black">
                Monthly
              </option>
            </select>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-400">
              <Plus /> Add Template
            </Button>
          </form>
        </div>
      ) : null}
    </GlassCard>
  );
}
