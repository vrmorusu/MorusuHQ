"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";

type ReportSummary = {
  period: string;
  chores_completed: number;
  chores_total: number;
  grocery_purchased: number;
  grocery_total: number;
  finance_income: number;
  finance_expense: number;
  finance_balance: number;
  notes_total: number;
  events_this_month: number;
  progress_entries_by_module: Record<string, number>;
};

export function ReportsView() {
  const [data, setData] = useState<ReportSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet<ReportSummary>("/api/reports/summary")
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Could not reach the MorusuHQ API. Make sure the backend is running.
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground italic">Loading…</p>;
  }

  const rows: [string, string][] = [
    ["Chores completed", `${data.chores_completed} / ${data.chores_total}`],
    ["Grocery items purchased", `${data.grocery_purchased} / ${data.grocery_total}`],
    ["Income this month", `$${data.finance_income.toFixed(2)}`],
    ["Expenses this month", `$${data.finance_expense.toFixed(2)}`],
    ["Balance", `$${data.finance_balance.toFixed(2)}`],
    ["Notes on record", `${data.notes_total}`],
    ["Events this month", `${data.events_this_month}`],
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-ayuthaya text-xl">
            <span className="italic font-light">Report for </span>
            <span className="font-bold">{data.period}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between py-2 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {Object.keys(data.progress_entries_by_module).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-ayuthaya">Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {Object.entries(data.progress_entries_by_module).map(([module, count]) => (
                <li key={module} className="flex justify-between">
                  <span className="capitalize">{module}</span>
                  <span className="font-medium">{count} entries</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
