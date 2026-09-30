"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { Stopwatch } from "@/components/study-center/stopwatch";
import { StudyCountdownTimer } from "@/components/study-center/study-countdown-timer";
import { StudyScheduleWidget } from "@/components/study-center/study-schedule-widget";
import { StudyPointsBadge } from "@/components/study-center/study-points-badge";
import { GradesTable } from "@/components/study-center/grades-table";
import { ReportCardWidget } from "@/components/study-center/report-card-widget";
import { SubjectTabs } from "@/components/study-center/subject-tabs";
import { DailyQuestionsPanel } from "@/components/study-center/daily-questions-panel";
import { WeeklyShlokaPanel } from "@/components/study-center/weekly-shloka-panel";
import { ActivityLogPanel } from "@/components/study-center/activity-log-panel";
import { SyllabusTree } from "@/components/study-center/syllabus-tree";
import { apiGet } from "@/lib/api";
import {
  PERSONS,
  type StudentSubject,
  type GradeRecord,
  type StudySession,
  type StudyPoints,
} from "@/components/study-center/types";

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

const STUDENTS = new Set(["Anika", "Pranshu"]);

export function StudyView() {
  const [person, setPerson] = useState(PERSONS[0].name);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<number | null>(null);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [points, setPoints] = useState<StudyPoints | null>(null);
  const [syllabusSubject, setSyllabusSubject] = useState<string | null>(null);

  const personConfig = PERSONS.find((p) => p.name === person) ?? PERSONS[0];
  const isStudent = STUDENTS.has(person);

  function loadSubjects() {
    apiGet<StudentSubject[]>(`/api/study/subjects?person=${person}`).then((data) => {
      setSubjects(data);
      setActiveSubjectId((prev) => (prev && data.some((s) => s.id === prev) ? prev : (data[0]?.id ?? null)));
    });
  }

  function loadGrades() {
    apiGet<GradeRecord[]>(`/api/study/grades?person=${person}`)
      .then((data) => {
        setGrades(data);
        const uniqueSubjects = Array.from(new Set(data.map((g) => g.subject)));
        setSyllabusSubject((prev) => (prev && uniqueSubjects.includes(prev) ? prev : (uniqueSubjects[0] ?? null)));
      })
      .catch(() => {});
  }

  function loadSessions() {
    apiGet<StudySession[]>("/api/study/sessions").then(setSessions).catch(() => {});
  }

  function loadPoints() {
    apiGet<StudyPoints>(`/api/study/points?person=${person}`).then(setPoints).catch(() => {});
  }

  useEffect(() => {
    loadSubjects();
    loadGrades();
    loadPoints();
  }, [person]);

  useEffect(loadSessions, []);

  const activeSubject = useMemo(
    () => subjects.find((s) => s.id === activeSubjectId) ?? null,
    [subjects, activeSubjectId]
  );

  const gradeSubjects = useMemo(() => Array.from(new Set(grades.map((g) => g.subject))), [grades]);

  return (
    <div className="study-center">
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

        <main className="space-y-5">
          <Reveal delay={0}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="glass flex flex-wrap gap-1.5 rounded-2xl p-1.5">
                {PERSONS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setPerson(p.name)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-base font-semibold transition-colors ${
                      person === p.name ? "bg-blue-500 text-white" : "text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xl">{p.emoji}</span> {p.name}
                  </button>
                ))}
              </div>
              <StudyPointsBadge points={points} />
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Reveal delay={60}>
              <Stopwatch person={person} defaultSubject={activeSubject?.name} sessions={sessions} onChanged={loadSessions} />
            </Reveal>
            <Reveal delay={90}>
              <StudyCountdownTimer />
            </Reveal>
          </div>

          <Reveal delay={120}>
            <StudyScheduleWidget person={person} onPointsChanged={loadPoints} />
          </Reveal>

          {isStudent ? (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="xl:col-span-8">
                <Reveal delay={160}>
                  <GradesTable person={person} terms={personConfig.terms} grades={grades} onChanged={loadGrades} />
                </Reveal>
              </div>
              <div className="xl:col-span-4">
                <Reveal delay={190}>
                  <ReportCardWidget person={person} />
                </Reveal>
              </div>
            </div>
          ) : null}

          <Reveal delay={220}>
            <SubjectTabs
              person={person}
              subjects={subjects}
              activeId={activeSubjectId}
              onSelect={setActiveSubjectId}
              onChanged={loadSubjects}
            />
          </Reveal>

          {activeSubject ? (
            <Reveal delay={250}>
              {activeSubject.name.toLowerCase() === "shlokas" ? (
                <WeeklyShlokaPanel person={person} onPointsChanged={loadPoints} />
              ) : activeSubject.category === "academic" ? (
                <DailyQuestionsPanel person={person} subject={activeSubject.name} onPointsChanged={loadPoints} />
              ) : (
                <ActivityLogPanel person={person} subject={activeSubject.name} onPointsChanged={loadPoints} />
              )}
            </Reveal>
          ) : null}

          {isStudent && gradeSubjects.length > 0 ? (
            <Reveal delay={280}>
              <div>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {gradeSubjects.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSyllabusSubject(s)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        syllabusSubject === s ? "bg-indigo-500 text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {syllabusSubject ? <SyllabusTree person={person} subject={syllabusSubject} /> : null}
              </div>
            </Reveal>
          ) : null}
        </main>
      </div>
    </div>
  );
}
