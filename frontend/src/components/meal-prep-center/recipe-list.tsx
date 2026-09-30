"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X, ChefHat } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { Recipe } from "@/components/meal-prep-center/types";

type FormState = { title: string; ingredients: string; instructions: string; tags: string };
const EMPTY: FormState = { title: "", ingredients: "", instructions: "", tags: "" };

export function RecipeList({ recipes, onChanged }: { recipes: Recipe[]; onChanged: () => void }) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.ingredients.trim()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        ingredients: form.ingredients,
        instructions: form.instructions || null,
        tags: form.tags || null,
      };
      if (editingId) {
        await apiPatch(`/api/meals/recipes/${editingId}`, payload);
      } else {
        await apiPost("/api/meals/recipes", payload);
      }
      setForm(EMPTY);
      setEditingId(null);
      setShowAdd(false);
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(r: Recipe) {
    setEditingId(r.id);
    setForm({ title: r.title, ingredients: r.ingredients, instructions: r.instructions || "", tags: r.tags || "" });
    setShowAdd(true);
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/meals/recipes/${id}`);
    onChanged();
  }

  return (
    <GlassCard glow="radial-gradient(circle, #fb923c, transparent 70%)">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Meal Prep</p>
          <h2 className="font-ayuthaya flex items-center gap-2 text-2xl font-bold">
            <ChefHat className="size-6 text-orange-300" /> Recipes
          </h2>
        </div>
        <Button
          type="button"
          onClick={() => {
            setShowAdd((s) => !s);
            setEditingId(null);
            setForm(EMPTY);
          }}
          className="bg-orange-500 hover:bg-orange-400"
        >
          <Plus className="size-4" /> Add Recipe
        </Button>
      </div>

      {showAdd ? (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2 rounded-xl bg-white/5 p-3">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Recipe title"
            className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <Textarea
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            placeholder="Ingredients (one per line)"
            className="min-h-20 border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <Textarea
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            placeholder="Instructions (optional)"
            className="min-h-20 border-white/20 bg-white/5 text-white placeholder:text-white/30"
          />
          <div className="flex gap-2">
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Tags (comma separated, optional)"
              className="flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
            />
            <Button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-400">
              <Check className="size-4" /> {editingId ? "Save" : "Add"}
            </Button>
          </div>
        </form>
      ) : null}

      {recipes.length === 0 ? (
        <p className="text-sm text-white/40 italic">No recipes yet. Add your first one above.</p>
      ) : (
        <ul className="space-y-2">
          {recipes.map((r) => (
            <li key={r.id} className="rounded-xl bg-white/5 p-3">
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-semibold">{r.title}</p>
                  {r.tags ? <p className="text-[11px] text-white/40">{r.tags}</p> : null}
                </button>
                <button onClick={() => startEdit(r)} className="shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Edit recipe">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => handleDelete(r.id)} className="shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/10 hover:text-white" aria-label="Delete recipe">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              {expandedId === r.id ? (
                <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2 text-xs text-white/60">
                  <div>
                    <p className="font-semibold text-white/70">Ingredients</p>
                    <p className="whitespace-pre-line">{r.ingredients}</p>
                  </div>
                  {r.instructions ? (
                    <div>
                      <p className="font-semibold text-white/70">Instructions</p>
                      <p className="whitespace-pre-line">{r.instructions}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
