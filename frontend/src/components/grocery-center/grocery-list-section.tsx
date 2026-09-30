"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, ShoppingCart, Check, Mail, MessageSquareText, Store } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { STORES, type GroceryItem } from "@/components/grocery-center/types";

export function GroceryListSection({ items, onChanged }: { items: GroceryItem[]; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [store, setStore] = useState<string>(STORES[0]);
  const [submitting, setSubmitting] = useState(false);

  const toBuy = items.filter((i) => !i.purchased);
  const purchased = items.filter((i) => i.purchased);

  const grouped = useMemo(() => {
    const map = new Map<string, GroceryItem[]>();
    for (const item of toBuy) {
      const key = item.store || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    const order = [...STORES];
    return Array.from(map.entries()).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  }, [toBuy]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/api/grocery/items", {
        name,
        quantity: parseFloat(quantity) || 1,
        purchased: false,
        store,
      });
      setName("");
      setQuantity("1");
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePurchased(item: GroceryItem) {
    await apiPatch(`/api/grocery/items/${item.id}`, { purchased: !item.purchased });
    onChanged();
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/grocery/items/${id}`);
    onChanged();
  }

  function buildShareText(): string {
    const lines = ["Shopping List:", ""];
    for (const [storeName, storeItems] of grouped) {
      lines.push(`${storeName}:`);
      for (const item of storeItems) lines.push(`- ${item.name} (${item.quantity})`);
      lines.push("");
    }
    return lines.join("\n");
  }

  function handleEmail() {
    const body = encodeURIComponent(buildShareText());
    window.open(`mailto:?subject=${encodeURIComponent("Shopping List")}&body=${body}`, "_blank");
  }

  function handleText() {
    const body = encodeURIComponent(buildShareText());
    window.open(`sms:?&body=${body}`, "_blank");
  }

  return (
    <GlassCard glow="radial-gradient(circle, #a3e635, transparent 70%)">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Grocery Management</p>
          <h2 className="font-ayuthaya text-2xl font-bold">Shopping List</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={handleEmail} title="Email list">
            <Mail className="size-4" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={handleText} title="Text list">
            <MessageSquareText className="size-4" />
          </Button>
          <ShoppingCart className="size-6 text-lime-300" />
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          className="min-w-40 flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
        />
        <Input
          type="number"
          step="0.5"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20 border-white/20 bg-white/5 text-white"
        />
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="rounded-md border border-white/20 bg-white/5 px-2 py-2 text-sm text-white"
        >
          {STORES.map((s) => (
            <option key={s} value={s} className="text-black">
              {s}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={submitting} className="bg-lime-500 hover:bg-lime-400">
          <Plus /> Add
        </Button>
      </form>

      {toBuy.length === 0 && purchased.length === 0 ? (
        <p className="text-sm text-white/40 italic">Nothing on the list yet.</p>
      ) : (
        <div className="space-y-4">
          {grouped.map(([storeName, storeItems]) => (
            <div key={storeName}>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-lime-300 uppercase">
                <Store className="size-3.5" /> {storeName}
              </p>
              <ul className="divide-y divide-white/10">
                {storeItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2">
                    <button
                      onClick={() => togglePurchased(item)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/40 text-white/60 transition-colors hover:bg-white/10"
                      aria-label="Toggle purchased"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
                    <span className="shrink-0 text-xs text-white/40">Qty {item.quantity}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Delete item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {purchased.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-white/40 uppercase">Purchased</p>
              <ul className="divide-y divide-white/10 opacity-50">
                {purchased.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2">
                    <button
                      onClick={() => togglePurchased(item)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full border border-lime-400 bg-lime-400 text-black"
                      aria-label="Toggle purchased"
                    >
                      <Check className="size-3.5" />
                    </button>
                    <span className="flex-1 truncate text-sm font-medium line-through">{item.name}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Delete item"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </GlassCard>
  );
}
