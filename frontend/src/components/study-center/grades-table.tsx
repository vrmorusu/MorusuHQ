"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiPatch } from "@/lib/api";
import type { GradeRecord } from "@/components/study-center/types";

export function GradesTable({
  person,
  terms,
  grades,
  onChanged,
}: {
  person: string;
  terms: string[];
  grades: GradeRecord[];
  onChanged: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftMark, setDraftMark] = useState("");
  const [addingClass, setAddingClass] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newPeriod, setNewPeriod] = useState("");

  const subjects = useMemo(() => {
    const seen = new Map<string, string | null>();
    for (const g of grades) {
      if (!seen.has(g.subject)) seen.set(g.subject, g.period_label ?? null);
    }
    return Array.from(seen, ([subject, period]) => ({ subject, period }));
  }, [grades]);

  function findCell(subject: string, term: string) {
    return grades.find((g) => g.subject === subject && g.term_code === term);
  }

  function startEdit(subject: string, term: string, current: string) {
    setEditingKey(`${subject}::${term}`);
    setDraftMark(current);
  }

  async function saveCell(subject: string, term: string, period: string | null) {
    const existing = findCell(subject, term);
    const termOrder = terms.indexOf(term);
    if (!draftMark.trim()) {
      setEditingKey(null);
      return;
    }
    if (existing) {
      await apiPatch(`/api/study/grades/${existing.id}`, { mark: draftMark });
    } else {
      await apiPost("/api/study/grades", {
        person,
        subject,
        period_label: period,
        term_code: term,
        term_order: termOrder,
        mark: draftMark,
      });
    }
    setEditingKey(null);
    onChanged();
  }

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim()) return;
    await apiPost("/api/study/grades", {
      person,
      subject: newSubject,
      period_label: newPeriod || null,
      term_code: terms[0],
      term_order: 0,
      mark: null,
    });
    setNewSubject("");
    setNewPeriod("");
    setAddingClass(false);
    onChanged();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #60a5fa, transparent 70%)">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Report Card</p>
          <h2 className="font-ayuthaya text-2xl font-bold">{person}&apos;s Grades</h2>
        </div>
        <Button type="button" size="sm" onClick={() => setAddingClass((s) => !s)} className="bg-blue-500 hover:bg-blue-400">
          <Plus className="size-3.5" /> Add Class
        </Button>
      </div>

      {addingClass ? (
        <form onSubmit={handleAddClass} className="mb-3 flex flex-wrap gap-2 rounded-xl bg-white/5 p-3">
          <Input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Class name (e.g. Geometry)"
            className="min-w-40 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <Input
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
            placeholder="Period (optional)"
            className="min-w-32 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-400">
            <Check className="size-3.5" /> Save
          </Button>
        </form>
      ) : null}

      {subjects.length === 0 ? (
        <p className="text-sm text-white/40 italic">No classes yet. Add one to start tracking grades.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] text-white/40 uppercase">
                <th className="py-2 pr-3 font-medium">Class</th>
                {terms.map((t) => (
                  <th key={t} className="px-2 py-2 text-center font-medium">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subjects.map(({ subject, period }) => (
                <tr key={subject} className="border-b border-white/5 last:border-0">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{subject}</p>
                    {period ? <p className="text-[11px] text-white/40">{period}</p> : null}
                  </td>
                  {terms.map((term) => {
                    const cell = findCell(subject, term);
                    const key = `${subject}::${term}`;
                    const isEditing = editingKey === key;
                    return (
                      <td key={term} className="px-2 py-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              autoFocus
                              value={draftMark}
                              onChange={(e) => setDraftMark(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveCell(subject, term, period);
                                if (e.key === "Escape") setEditingKey(null);
                              }}
                              className="w-12 rounded border border-white/20 bg-white/10 px-1 py-0.5 text-center text-xs text-white"
                            />
                            <button onClick={() => saveCell(subject, term, period)} className="text-emerald-300">
                              <Check className="size-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(subject, term, cell?.mark ?? "")}
                            className="group flex items-center justify-center gap-1 rounded px-1.5 py-0.5 hover:bg-white/10"
                          >
                            <span className={cell?.mark ? "font-semibold text-blue-200" : "text-white/25"}>
                              {cell?.mark ?? "—"}
                            </span>
                            <Pencil className="size-2.5 text-white/0 group-hover:text-white/40" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
