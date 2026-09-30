"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { apiGet, apiPatch } from "@/lib/api";

type Item = { id: number; name: string; quantity: number; purchased: boolean };

export function GroceryWidget() {
  const [items, setItems] = useState<Item[]>([]);

  function load() {
    apiGet<Item[]>("/api/grocery/items").then(setItems).catch(() => {});
  }

  useEffect(load, []);

  async function toggle(item: Item) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, purchased: !i.purchased } : i))
    );
    await apiPatch(`/api/grocery/items/${item.id}`, { purchased: !item.purchased });
  }

  const toBuy = items.filter((i) => !i.purchased);

  return (
    <GlassCard glow="radial-gradient(circle, #4ade80, transparent 70%)" className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm italic font-medium text-white/60">Grocery List</p>
        <ShoppingCart className="size-4 text-green-300" />
      </div>
      {toBuy.length === 0 ? (
        <p className="text-sm text-white/50 italic">Nothing to buy — all stocked.</p>
      ) : (
        <ul className="space-y-2">
          {toBuy.slice(0, 6).map((item) => (
            <li key={item.id}>
              <button
                onClick={() => toggle(item)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/10 active:scale-[0.98]"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-white/30">
                  <Check className="size-3.5 opacity-0" />
                </span>
                <span className="truncate text-sm">{item.name}</span>
                {item.quantity > 1 ? (
                  <span className="ml-auto shrink-0 text-xs text-white/40">×{item.quantity}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
