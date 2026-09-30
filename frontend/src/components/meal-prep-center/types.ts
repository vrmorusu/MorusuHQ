export type Recipe = {
  id: number;
  title: string;
  ingredients: string;
  instructions?: string | null;
  tags?: string | null;
};

export type MealSuggestion = {
  recipe_id: number;
  title: string;
  match_ratio: number;
  matched_ingredients: string[];
  missing_ingredients: string[];
};

export type MealSuggestionsResponse = {
  pantry_item_count: number;
  recipe_count: number;
  suggestions: MealSuggestion[];
};

export type SchoolMenuDay = {
  date: string;
  items: string[];
};

export type SchoolMenuMeal = {
  price: number;
  days: SchoolMenuDay[];
};

export type SchoolMenuResponse = {
  name: string;
  breakfast: SchoolMenuMeal;
  lunch: SchoolMenuMeal;
};
