"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";
import type { StudentSubject } from "@/components/study-center/types";

export function SubjectTabs({
  person,
  subjects,
  activeId,
  onSelect,
  onChanged,
}: {
  person: string;
  subjects: StudentSubject[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"academic" | "non_academic">("academic");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await apiPost("/api/study/subjects", {
      person,
      name,
      category,
      sort_order: subjects.length,
    });
    setName("");
    setAdding(false);
    onChanged();
  }

  return (
    <div className="glass flex flex-wrap items-center gap-1.5 rounded-2xl p-1.5">
      {subjects.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            activeId === s.id ? "bg-blue-500 text-white" : "text-white/60 hover:bg-white/10"
          }`}
        >
          {s.name}
        </button>
      ))}
      {adding ? (
        <form onSubmit={handleAdd} className="flex items-center gap-1.5 rounded-xl bg-white/10 p-1">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Subject/topic name"
            className="h-8 w-40 border-white/20 bg-white/5 text-sm text-white placeholder:text-white/30"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "academic" | "non_academic")}
            className="h-8 rounded-md border border-white/20 bg-white/5 px-1.5 text-xs text-white"
          >
            <option value="academic" className="text-black">
              Academic
            </option>
            <option value="non_academic" className="text-black">
              Non-academic
            </option>
          </select>
          <Button type="submit" size="sm" className="h-8 bg-blue-500 hover:bg-blue-400">
            <Plus className="size-3.5" />
          </Button>
          <button type="button" onClick={() => setAdding(false)} className="rounded-full p-1.5 text-white/40 hover:text-white">
            <X className="size-3.5" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-white/50 hover:bg-white/10 hover:text-white"
        >
          <Plus className="size-3.5" /> Add Subject
        </button>
      )}
    </div>
  );
}
