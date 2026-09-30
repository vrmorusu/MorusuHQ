"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet } from "@/lib/api";

type Recipe = { id: number; title: string; tags?: string | null };

const SLOTS = ["Breakfast", "Lunch", "Dinner"];

export function MealsWidget() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    apiGet<Recipe[]>("/api/meals/recipes").then(setRecipes).catch(() => {});
  }, []);

  return (
    <GlassCard glow="radial-gradient(circle, #fb923c, transparent 70%)">
      <p className="mb-3 text-sm italic font-medium text-white/60">Today&rsquo;s Meals</p>
      {recipes.length === 0 ? (
        <p className="text-sm text-white/50 italic">Add recipes to plan today&rsquo;s meals.</p>
      ) : (
        <ul className="space-y-2.5">
          {SLOTS.map((slot, i) => {
            const recipe = recipes[i];
            return (
              <li key={slot} className="flex items-center gap-3">
                <UtensilsCrossed className="size-4 shrink-0 text-orange-300" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-white/40">{slot}</p>
                  <p className="truncate text-sm font-medium">{recipe?.title ?? "—"}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
