"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";

type Suggestion = {
  recipe_id: number;
  title: string;
  match_ratio: number;
  matched_ingredients: string[];
  missing_ingredients: string[];
};

type SuggestionsResponse = {
  pantry_item_count: number;
  recipe_count: number;
  suggestions: Suggestion[];
};

export function AiMealsView() {
  const [data, setData] = useState<SuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  function load() {
    setLoading(true);
    apiGet<SuggestionsResponse>("/api/ai-meals/suggestions")
      .then((d) => {
        setData(d);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Could not reach the MorusuHQ API. Make sure the backend is running.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground italic">
          {data
            ? `Matching ${data.recipe_count} recipe(s) against ${data.pantry_item_count} pantry item(s).`
            : "Loading pantry and recipes…"}
        </p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <Sparkles /> Refresh suggestions
        </Button>
      </div>

      {data?.suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No matches yet — add pantry items and recipes to get suggestions.
        </p>
      ) : (
        <div className="grid gap-3">
          {data?.suggestions.map((s) => (
            <Card key={s.recipe_id}>
              <CardHeader>
                <CardTitle className="font-ayuthaya flex items-center justify-between">
                  <span>{s.title}</span>
                  <span className="text-sm font-light italic text-primary/70">
                    {Math.round(s.match_ratio * 100)}% match
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                {s.matched_ingredients.length > 0 && (
                  <p>
                    <span className="text-muted-foreground">Have: </span>
                    {s.matched_ingredients.join(", ")}
                  </p>
                )}
                {s.missing_ingredients.length > 0 && (
                  <p>
                    <span className="text-muted-foreground">Need: </span>
                    {s.missing_ingredients.join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
