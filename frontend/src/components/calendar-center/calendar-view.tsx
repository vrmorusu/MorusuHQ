"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { MonthGrid, toKey, type DayMarkers } from "@/components/calendar-center/month-grid";
import { PanchangWidget } from "@/components/calendar-center/panchang-widget";
import { HolidaysWidget } from "@/components/calendar-center/holidays-widget";
import { SchoolEventsWidget } from "@/components/calendar-center/school-events-widget";
import { DayDetailPanel, type PersonalEvent } from "@/components/calendar-center/day-detail-panel";
import { EventsRemindersList } from "@/components/calendar-center/events-reminders-list";
import { GoogleSyncButton } from "@/components/calendar-center/google-sync-button";
import { apiGet } from "@/lib/api";

type Holiday = { date: string; localName: string };
type SchoolEvent = { title: string; start: string };

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

export function CalendarView() {
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(() => toKey(new Date()));
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [schoolEvents, setSchoolEvents] = useState<SchoolEvent[]>([]);

  function loadPersonalEvents() {
    apiGet<PersonalEvent[]>("/api/calendar/events").then(setPersonalEvents).catch(() => {});
  }

  useEffect(loadPersonalEvents, []);

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`).then((r) => r.json()),
      fetch(`https://date.nager.at/api/v3/PublicHolidays/${year + 1}/US`).then((r) => r.json()),
    ])
      .then(([a, b]) => setHolidays([...a, ...b]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    apiGet<{ events: SchoolEvent[] }>("/api/calendar/school-events")
      .then((data) => setSchoolEvents(data.events))
      .catch(() => {});
  }, []);

  const markers = useMemo(() => {
    const map: Record<string, DayMarkers> = {};
    const ensure = (key: string) => (map[key] ??= { personal: 0, holiday: [], school: 0 });

    for (const ev of personalEvents) {
      ensure(ev.start_time.slice(0, 10)).personal += 1;
    }
    for (const h of holidays) {
      ensure(h.date).holiday.push(h.localName);
    }
    for (const s of schoolEvents) {
      ensure(s.start.slice(0, 10)).school += 1;
    }
    return map;
  }, [personalEvents, holidays, schoolEvents]);

  const selectedPersonal = personalEvents.filter((e) => e.start_time.slice(0, 10) === selectedKey);
  const selectedHolidays = holidays.filter((h) => h.date === selectedKey).map((h) => h.localName);
  const selectedSchool = schoolEvents.filter((s) => s.start.slice(0, 10) === selectedKey).map((s) => s.title);

  function shiftMonth(delta: number) {
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  }

  return (
    <div className="calendar-center">
      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between text-white">
          <BrandMark tagline={false} variant="light" />
          <div className="flex items-center gap-2">
            <GoogleSyncButton />
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

        <main className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <Reveal delay={0}>
              <MonthGrid
                monthDate={monthDate}
                onPrevMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
                markers={markers}
                selectedKey={selectedKey}
                onSelectDay={setSelectedKey}
              />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={80}>
              <DayDetailPanel
                selectedKey={selectedKey}
                personalEvents={selectedPersonal}
                holidayNames={selectedHolidays}
                schoolEventTitles={selectedSchool}
                onChanged={loadPersonalEvents}
              />
            </Reveal>
          </div>

          <div className="xl:col-span-4">
            <Reveal delay={160}>
              <PanchangWidget dateKey={selectedKey} />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={220}>
              <HolidaysWidget />
            </Reveal>
          </div>
          <div className="xl:col-span-4">
            <Reveal delay={280}>
              <SchoolEventsWidget />
            </Reveal>
          </div>

          <div className="xl:col-span-12">
            <Reveal delay={340}>
              <EventsRemindersList events={personalEvents} onChanged={loadPersonalEvents} />
            </Reveal>
          </div>
        </main>
      </div>
    </div>
  );
}
