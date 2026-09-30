"use client";

import { useState } from "react";
import { Plus, Trash2, Package, AlertTriangle, Sparkles, Info } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiDelete, resolveMediaUrl } from "@/lib/api";
import { ImageUploadField } from "@/components/grocery-center/image-upload-field";
import type { PantryItem } from "@/components/grocery-center/types";

const UNITS = ["pcs", "lbs", "oz", "kg", "g", "L", "gal", "cans", "boxes", "bags"];

export function PantrySection({ items, onChanged }: { items: PantryItem[]; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState(UNITS[0]);
  const [expiryDate, setExpiryDate] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await apiPost("/api/pantry/items", {
        name,
        quantity: parseFloat(quantity) || 1,
        unit,
        expiry_date: expiryDate || null,
        low_stock: lowStock,
        photo_url: photoUrl,
      });
      setName("");
      setQuantity("1");
      setExpiryDate("");
      setLowStock(false);
      setPhotoUrl(null);
      setAnalysisMessage(null);
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await apiDelete(`/api/pantry/items/${id}`);
    onChanged();
  }

  async function handleAnalyze() {
    if (!photoUrl) return;
    setAnalyzing(true);
    try {
      const res = await apiPost<{ available: boolean; detected_items: string[]; message: string }>(
        "/api/pantry/analyze-photo",
        { photo_url: photoUrl }
      );
      setAnalysisMessage(res.message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <GlassCard glow="radial-gradient(circle, #fb923c, transparent 70%)">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm italic font-medium text-white/60">Section</p>
          <h2 className="font-ayuthaya text-2xl font-bold">Pantry &amp; Fridge Inventory</h2>
        </div>
        <Package className="size-6 text-orange-300" />
      </div>

      <form onSubmit={handleAdd} className="mb-4 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <ImageUploadField value={photoUrl} onChange={setPhotoUrl} />
          {photoUrl ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="text-orange-300"
            >
              <Sparkles className="size-3.5" /> {analyzing ? "Analyzing…" : "Analyze photo with AI"}
            </Button>
          ) : null}
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
        </div>
        {analysisMessage ? (
          <p className="flex items-start gap-1.5 rounded-lg bg-white/5 px-2.5 py-2 text-xs text-white/50">
            <Info className="mt-0.5 size-3.5 shrink-0 text-amber-300" /> {analysisMessage}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-md border border-white/20 bg-white/5 px-2 py-2 text-sm text-white"
          >
            {UNITS.map((u) => (
              <option key={u} value={u} className="text-black">
                {u}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="border-white/20 bg-white/5 text-white"
          />
          <label className="flex items-center gap-1.5 text-sm text-white/70">
            <input
              type="checkbox"
              checked={lowStock}
              onChange={(e) => setLowStock(e.target.checked)}
              className="size-4 rounded border-white/30 bg-white/5 accent-amber-400"
            />
            Low stock
          </label>
          <Button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-400">
            <Plus /> Add
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <p className="text-sm text-white/40 italic">Pantry is empty.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {items.map((item) => {
            const photo = resolveMediaUrl(item.photo_url);
            return (
              <li key={item.id} className="flex items-center gap-3 py-2">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={item.name} className="size-8 shrink-0 rounded-lg object-cover" />
                ) : item.low_stock ? (
                  <AlertTriangle className="size-4 shrink-0 text-amber-300" />
                ) : (
                  <span className="size-4 shrink-0" />
                )}
                <span className="flex-1 truncate text-sm font-medium">{item.name}</span>
                <span className="shrink-0 text-xs text-white/40">
                  {item.quantity} {item.unit || ""}
                  {item.expiry_date
                    ? ` · exp ${new Date(`${item.expiry_date}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}`
                    : ""}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="shrink-0 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Delete item"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
