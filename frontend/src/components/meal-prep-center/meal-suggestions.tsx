"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import type { MealSuggestionsResponse } from "@/components/meal-prep-center/types";

export function MealSuggestions() {
  const [data, setData] = useState<MealSuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    setLoading(true);
    apiGet<MealSuggestionsResponse>("/api/ai-meals/suggestions")
      .then(setData)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <GlassCard glow="radial-gradient(circle, #fbbf24, transparent 70%)">
      <div className="mb-1 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Pantry Match</p>
          <h2 className="font-ayuthaya flex items-center gap-2 text-xl font-bold">
            <Sparkles className="size-5 text-amber-300" /> Meal Suggestions
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>
      <p className="mb-3 text-xs text-white/35">
        Rule-based ingredient matching against your pantry (not a live AI call).
      </p>

      {!data ? (
        <p className="text-sm text-white/40 italic">Loading…</p>
      ) : data.suggestions.length === 0 ? (
        <p className="text-sm text-white/40 italic">
          No matches yet — add pantry items and recipes to get suggestions.
        </p>
      ) : (
        <div className="space-y-2">
          {data.suggestions.map((s) => (
            <div key={s.recipe_id} className="rounded-xl bg-white/5 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold">{s.title}</p>
                <span className="text-xs font-medium text-amber-300">{Math.round(s.match_ratio * 100)}% match</span>
              </div>
              {s.matched_ingredients.length > 0 ? (
                <p className="text-xs text-emerald-300">Have: {s.matched_ingredients.join(", ")}</p>
              ) : null}
              {s.missing_ingredients.length > 0 ? (
                <p className="text-xs text-white/40">Need: {s.missing_ingredients.join(", ")}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
