export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Utilities",
  "Rent/Mortgage",
  "Transportation",
  "Dining",
  "Entertainment",
  "Healthcare",
  "Insurance",
  "Education",
  "Shopping",
  "Travel",
  "Subscriptions",
  "Childcare",
  "Other/Misc",
] as const;

export const INCOME_CATEGORIES = ["Salary/Income", "Bonus", "Gift", "Interest/Investments", "Other/Misc"] as const;

export function categoriesFor(entryType: string): readonly string[] {
  return entryType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
