"use client";

import { useEffect, useState } from "react";
import { Sparkles, Check, X, Plus, Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost } from "@/lib/api";
import type { DailyQuestion } from "@/components/study-center/types";

export function DailyQuestionsPanel({
  person,
  subject,
  onPointsChanged,
}: {
  person: string;
  subject: string;
  onPointsChanged?: () => void;
}) {
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newQ, setNewQ] = useState({ question: "", answer: "", explanation: "" });

  function load() {
    apiGet<DailyQuestion[]>(`/api/study/daily-questions?person=${person}&subject=${encodeURIComponent(subject)}`)
      .then(setQuestions)
      .catch(() => {});
  }

  useEffect(load, [person, subject]);

  async function handleSubmit(q: DailyQuestion) {
    const answer = drafts[q.id];
    if (!answer?.trim()) return;
    await apiPost(`/api/study/daily-questions/${q.id}/answer`, { submitted_answer: answer });
    load();
    onPointsChanged?.();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newQ.question.trim() || !newQ.answer.trim()) return;
    await apiPost("/api/study/daily-questions", {
      person,
      subject,
      question: newQ.question,
      answer: newQ.answer,
      explanation: newQ.explanation || null,
      difficulty: "medium",
      points: 5,
    });
    setNewQ({ question: "", answer: "", explanation: "" });
    setShowAdd(false);
    load();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #38bdf8, transparent 70%)">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Daily Practice — {subject}</p>
          <h2 className="font-ayuthaya text-xl font-bold">3 Questions Today</h2>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdd((s) => !s)}>
          <Plus className="size-3.5" /> Add Question
        </Button>
      </div>
      <p className="mb-4 text-xs text-white/35">
        Built from a starter question bank (no live AI/websearch call happens here).
      </p>

      {showAdd ? (
        <form onSubmit={handleAdd} className="mb-4 space-y-2 rounded-xl bg-white/5 p-3">
          <Input
            value={newQ.question}
            onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
            placeholder="Question"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <div className="flex gap-2">
            <Input
              value={newQ.answer}
              onChange={(e) => setNewQ({ ...newQ, answer: e.target.value })}
              placeholder="Correct answer"
              className="flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
            />
            <Input
              value={newQ.explanation}
              onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })}
              placeholder="Explanation (optional)"
              className="flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
            />
          </div>
          <Button type="submit" size="sm" className="bg-sky-500 hover:bg-sky-400">
            <Check className="size-3.5" /> Save Question
          </Button>
        </form>
      ) : null}

      {questions.length === 0 ? (
        <p className="text-sm text-white/40 italic">No practice questions yet for {subject}. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="rounded-xl bg-white/5 p-3">
              <p className="mb-2 text-sm font-medium">
                {i + 1}. {q.question}
              </p>
              {!q.answered ? (
                <div className="flex gap-2">
                  <Input
                    value={drafts[q.id] || ""}
                    onChange={(e) => setDrafts({ ...drafts, [q.id]: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(q)}
                    placeholder="Your answer…"
                    className="flex-1 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30"
                  />
                  <Button type="button" size="sm" onClick={() => handleSubmit(q)} className="bg-sky-500 hover:bg-sky-400">
                    Check
                  </Button>
                </div>
              ) : (
                <div>
                  <p
                    className={`mb-1.5 flex items-center gap-1.5 text-sm font-medium ${
                      q.correct ? "text-emerald-300" : "text-rose-300"
                    }`}
                  >
                    {q.correct ? <Check className="size-4" /> : <X className="size-4" />}
                    {q.correct ? `Correct! +${q.points} pts` : `Not quite — correct answer: ${q.answer}`}
                  </p>
                  {q.explanation ? (
                    <p className="flex items-start gap-1.5 rounded-lg bg-white/5 px-2.5 py-2 text-xs text-white/60">
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-300" /> {q.explanation}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 flex items-center gap-1.5 text-xs text-white/30">
        <Sparkles className="size-3.5" /> New questions rotate in automatically tomorrow.
      </p>
    </GlassCard>
  );
}
