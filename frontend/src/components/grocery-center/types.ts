export type GroceryItem = {
  id: number;
  name: string;
  quantity: number;
  purchased: boolean;
  photo_url?: string | null;
  store?: string | null;
};

export const STORES = ["Costco", "Sam's Club", "Indian Store", "Other"] as const;

export type PantryItem = {
  id: number;
  name: string;
  quantity: number;
  unit?: string | null;
  expiry_date?: string | null;
  low_stock: boolean;
  photo_url?: string | null;
};
