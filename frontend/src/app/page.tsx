import Link from "next/link";
import { LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { HeroDateTime } from "@/components/command-center/hero-datetime";
import { WeatherWidget } from "@/components/command-center/weather-widget";
import { QuoteWidget } from "@/components/command-center/quote-widget";
import { FamilyStatusWidget } from "@/components/command-center/family-status-widget";
import { DailyTimelineWidget } from "@/components/command-center/daily-timeline-widget";
import { MealsWidget } from "@/components/command-center/meals-widget";
import { ChoresWidget } from "@/components/command-center/chores-widget";
import { SchoolRemindersWidget } from "@/components/command-center/school-reminders-widget";
import { BillsWidget } from "@/components/command-center/bills-widget";
import { GroceryWidget } from "@/components/command-center/grocery-widget";
import { WeeklyCalendarWidget } from "@/components/command-center/weekly-calendar-widget";

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

export default function Home() {
  return (
    <div className="command-center">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between text-white">
          <BrandMark tagline={false} variant="light" />
          <Link
            href="/modules"
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
          >
            <LayoutGrid className="size-4" />
            All Modules
          </Link>
        </header>

        <main className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-12">
          <div className="sm:col-span-2 xl:col-span-5">
            <Reveal delay={0}>
              <HeroDateTime />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={60}>
              <WeatherWidget />
            </Reveal>
          </div>
          <div className="sm:col-span-2 xl:col-span-3">
            <Reveal delay={120}>
              <FamilyStatusWidget />
            </Reveal>
          </div>

          <div className="sm:col-span-2 xl:col-span-12">
            <Reveal delay={150}>
              <QuoteWidget />
            </Reveal>
          </div>

          <div className="xl:col-span-4 xl:row-span-2">
            <Reveal delay={180}>
              <DailyTimelineWidget />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={240}>
              <MealsWidget />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={300}>
              <ChoresWidget />
            </Reveal>
          </div>

          <div className="xl:col-span-4">
            <Reveal delay={360}>
              <SchoolRemindersWidget />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={420}>
              <BillsWidget />
            </Reveal>
          </div>

          <div className="xl:col-span-4">
            <Reveal delay={480}>
              <GroceryWidget />
            </Reveal>
          </div>
          <div className="sm:col-span-2 xl:col-span-8">
            <Reveal delay={540}>
              <WeeklyCalendarWidget />
            </Reveal>
          </div>
        </main>
      </div>
    </div>
  );
}
