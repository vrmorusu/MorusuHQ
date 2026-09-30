"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { GroceryListSection } from "@/components/grocery-center/grocery-list-section";
import { PantrySection } from "@/components/grocery-center/pantry-section";
import { apiGet } from "@/lib/api";
import type { GroceryItem, PantryItem } from "@/components/grocery-center/types";

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

export function GroceryPantryView() {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);

  function loadGrocery() {
    apiGet<GroceryItem[]>("/api/grocery/items").then(setGroceryItems).catch(() => {});
  }

  function loadPantry() {
    apiGet<PantryItem[]>("/api/pantry/items").then(setPantryItems).catch(() => {});
  }

  useEffect(() => {
    loadGrocery();
    loadPantry();
  }, []);

  return (
    <div className="grocery-center">
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
            <GroceryListSection items={groceryItems} onChanged={loadGrocery} />
          </Reveal>
          <Reveal delay={120}>
            <PantrySection items={pantryItems} onChanged={loadPantry} />
          </Reveal>
        </main>
      </div>
    </div>
  );
}
