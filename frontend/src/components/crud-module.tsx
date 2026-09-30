"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { CRUD_MODULE_CONFIGS, type FieldConfig } from "@/lib/module-configs";

type Item = Record<string, unknown> & { id: number };

function toInputValue(field: FieldConfig, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (field.type === "datetime" && typeof value === "string") {
    return value.slice(0, 16);
  }
  return String(value);
}

function buildPayload(fields: FieldConfig[], values: Record<string, string | boolean>) {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const raw = values[field.name];
    if (field.type === "checkbox") {
      payload[field.name] = Boolean(raw);
      continue;
    }
    if (raw === undefined || raw === "") {
      continue;
    }
    if (field.type === "number") {
      payload[field.name] = Number(raw);
    } else if (field.type === "datetime") {
      payload[field.name] = new Date(String(raw)).toISOString();
    } else {
      payload[field.name] = raw;
    }
  }
  return payload;
}

export function CrudModule({ slug }: { slug: string }) {
  const config = CRUD_MODULE_CONFIGS[slug];
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!config) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.listPath]);

  if (!config) {
    return <p className="text-sm text-destructive">Unknown module &ldquo;{slug}&rdquo;.</p>;
  }

  async function load() {
    try {
      setLoading(true);
      const data = await apiGet<Item[]>(config.listPath);
      setItems(data);
      setError(null);
    } catch {
      setError(
        "Could not reach the MorusuHQ API. Make sure the backend is running at NEXT_PUBLIC_API_URL."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = buildPayload(config.fields, values);
      await apiPost(config.listPath, payload);
      setValues({});
      await load();
    } catch {
      setError("Could not save. Check the fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(item: Item) {
    if (!config.toggleField) return;
    await apiPatch(config.itemPath(item.id), {
      [config.toggleField]: !item[config.toggleField],
    });
    load();
  }

  async function handleDelete(id: number) {
    await apiDelete(config.itemPath(id));
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {config.fields.map((field) => (
              <div
                key={field.name}
                className={`flex flex-col gap-1.5 ${
                  field.type === "textarea" ? "sm:col-span-2" : ""
                }`}
              >
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    required={field.required}
                    value={(values[field.name] as string) ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    value={(values[field.name] as string) ?? field.options?.[0]?.value ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <Checkbox
                    id={field.name}
                    checked={Boolean(values[field.name])}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.checked }))
                    }
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={
                      field.type === "datetime"
                        ? "datetime-local"
                        : field.type === "date"
                          ? "date"
                          : field.type === "number"
                            ? "number"
                            : "text"
                    }
                    required={field.required}
                    placeholder={field.placeholder}
                    value={toInputValue(field, values[field.name])}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.name]: e.target.value }))
                    }
                  />
                )}
              </div>
            ))}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting}>
                <Plus />
                Add {config.itemLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground italic">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Nothing here yet. Add your first {config.itemLabel.toLowerCase()} above.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{String(item[config.titleField])}</p>
                    <p className="text-xs text-muted-foreground italic truncate">
                      {config.fields
                        .filter((f) => f.name !== config.titleField && item[f.name])
                        .map((f) => String(item[f.name]))
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {config.toggleField ? (
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={Boolean(item[config.toggleField])}
                          onChange={() => handleToggle(item)}
                        />
                        {config.toggleLabel?.(Boolean(item[config.toggleField]))}
                      </label>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
