"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { RecipeList } from "@/components/meal-prep-center/recipe-list";
import { MealSuggestions } from "@/components/meal-prep-center/meal-suggestions";
import { SchoolLunchMenu } from "@/components/meal-prep-center/school-lunch-menu";
import { apiGet } from "@/lib/api";
import type { Recipe } from "@/components/meal-prep-center/types";

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

export function MealPrepView() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  function loadRecipes() {
    apiGet<Recipe[]>("/api/meals/recipes").then(setRecipes).catch(() => {});
  }

  useEffect(loadRecipes, []);

  return (
    <div className="meal-prep-center">
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

        <main className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <Reveal delay={0}>
              <RecipeList recipes={recipes} onChanged={loadRecipes} />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={80}>
              <MealSuggestions />
            </Reveal>
          </div>

          <div className="xl:col-span-12">
            <Reveal delay={160}>
              <SchoolLunchMenu />
            </Reveal>
          </div>
        </main>
      </div>
    </div>
  );
}
