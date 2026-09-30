export type FinanceEntry = {
  id: number;
  description: string;
  amount: number;
  category?: string | null;
  entry_type: string;
  date: string;
  is_bill: boolean;
  recurring_id?: number | null;
};

export type RecurringRule = {
  id: number;
  description: string;
  amount: number;
  category?: string | null;
  entry_type: string;
  interval_days: number;
  start_date: string;
  next_date: string;
  is_bill: boolean;
  active: boolean;
};
