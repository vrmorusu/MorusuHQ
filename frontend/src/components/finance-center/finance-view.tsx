"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { MonthOverview } from "@/components/finance-center/month-overview";
import { QuickAddTransaction } from "@/components/finance-center/quick-add-transaction";
import { AllTransactionsTable } from "@/components/finance-center/all-transactions-table";
import { CategoryBreakdownWidget } from "@/components/finance-center/category-breakdown-widget";
import { TrendWidget } from "@/components/finance-center/trend-widget";
import { UpcomingBillsWidget } from "@/components/finance-center/upcoming-bills-widget";
import { RecurringTransactionsWidget } from "@/components/finance-center/recurring-transactions-widget";
import { BillReminderBanner } from "@/components/finance-center/bill-reminder-banner";
import { apiGet } from "@/lib/api";
import type { FinanceEntry, RecurringRule } from "@/components/finance-center/types";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function FinanceView() {
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [recurring, setRecurring] = useState<RecurringRule[]>([]);

  function loadEntries() {
    apiGet<FinanceEntry[]>("/api/finance/entries").then(setEntries).catch(() => {});
  }

  function loadRecurring() {
    apiGet<RecurringRule[]>("/api/finance/recurring").then(setRecurring).catch(() => {});
  }

  function loadAll() {
    loadEntries();
    loadRecurring();
  }

  useEffect(loadAll, []);

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const monthEntries = useMemo(
    () =>
      entries
        .filter((e) => {
          const d = new Date(`${e.date}T00:00:00`);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [entries, year, month]
  );

  const monthIncome = monthEntries.filter((e) => e.entry_type === "income").reduce((s, e) => s + e.amount, 0);
  const monthExpense = monthEntries.filter((e) => e.entry_type === "expense").reduce((s, e) => s + e.amount, 0);

  const categoryBreakdown = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const e of monthEntries) {
      if (e.entry_type !== "expense") continue;
      const key = e.category?.trim() || "Other/Misc";
      byCategory.set(key, (byCategory.get(key) ?? 0) + e.amount);
    }
    return Array.from(byCategory, ([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  }, [monthEntries]);

  const trend = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString([], { month: "short" }) };
    });
    return months.map(({ year: y, month: m, label }) => {
      const inMonth = entries.filter((e) => {
        const d = new Date(`${e.date}T00:00:00`);
        return d.getFullYear() === y && d.getMonth() === m;
      });
      return {
        label,
        income: inMonth.filter((e) => e.entry_type === "income").reduce((s, e) => s + e.amount, 0),
        expense: inMonth.filter((e) => e.entry_type === "expense").reduce((s, e) => s + e.amount, 0),
      };
    });
  }, [entries]);

  function shiftMonth(delta: number) {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  const monthLabel = monthDate.toLocaleDateString([], { month: "long", year: "numeric" });

  return (
    <div className="finance-center">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between text-white">
          <BrandMark tagline={false} variant="light" />
          <div className="flex items-center gap-2">
            <Link
              href="/modules"
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            >
              <LayoutGrid className="size-4" />
              All Modules
            </Link>
            <Link
              href="/"
              className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="size-4" />
              Command Center
            </Link>
          </div>
        </header>

        <BillReminderBanner entries={entries} />

        <main className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <Reveal delay={0}>
              <MonthOverview
                monthDate={monthDate}
                onPrevMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
                income={monthIncome}
                expense={monthExpense}
              />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={80}>
              <QuickAddTransaction onChanged={loadAll} />
            </Reveal>
          </div>

          <div className="xl:col-span-4">
            <Reveal delay={160}>
              <CategoryBreakdownWidget categories={categoryBreakdown} />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={220}>
              <TrendWidget trend={trend} />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={280}>
              <UpcomingBillsWidget entries={entries} />
            </Reveal>
          </div>

          <div className="xl:col-span-12">
            <Reveal delay={320}>
              <RecurringTransactionsWidget rules={recurring} onChanged={loadAll} />
            </Reveal>
          </div>

          <div className="xl:col-span-12">
            <Reveal delay={360}>
              <AllTransactionsTable monthLabel={monthLabel} entries={monthEntries} onChanged={loadEntries} />
            </Reveal>
          </div>
        </main>
      </div>
    </div>
  );
}
