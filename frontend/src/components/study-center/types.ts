export type StudySession = {
  id: number;
  subject: string;
  person?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_minutes?: number | null;
  notes?: string | null;
};

export type StudentSubject = {
  id: number;
  person: string;
  name: string;
  category: "academic" | "non_academic";
  sort_order: number;
};

export type GradeRecord = {
  id: number;
  person: string;
  subject: string;
  period_label?: string | null;
  term_code: string;
  term_order: number;
  mark?: string | null;
  is_projected: boolean;
};

export type DailyQuestion = {
  id: number;
  person: string;
  subject: string;
  question: string;
  answer: string;
  explanation?: string | null;
  difficulty: string;
  points: number;
  date_assigned?: string | null;
  answered: boolean;
  submitted_answer?: string | null;
  correct?: boolean | null;
};

export type ShlokaBankItem = {
  id: number;
  title: string;
  text: string;
  meaning?: string | null;
  difficulty: string;
  sort_order: number;
  points: number;
};

export type WeeklyShlokaAssignment = {
  id: number;
  person: string;
  shloka_id: number;
  week_start: string;
  practiced: boolean;
  practiced_date?: string | null;
};

export type WeeklyShlokaWithDetail = {
  assignment: WeeklyShlokaAssignment;
  shloka: ShlokaBankItem;
};

export type ActivityEntry = {
  id: number;
  title: string;
  value?: string | null;
  date: string;
  notes?: string | null;
  status?: string | null;
  person?: string | null;
};

export type StudyPoints = {
  total: number;
  questions: number;
  shloka: number;
  activities: number;
  attendance: number;
};

export type StudySchedule = {
  id: number;
  person: string;
  day_type: "weekday" | "weekend";
  start_time: string;
  end_time: string;
};

export type StudyAttendance = {
  id: number;
  person: string;
  date: string;
  status: "attended" | "missed" | "skipped";
};

export type SyllabusUnit = {
  id: number;
  person: string;
  subject: string;
  title: string;
  parent_id: number | null;
  sort_order: number;
  completed: boolean;
};

export type ReportCardSubject = {
  subject: string;
  mark: string;
  unweighted: number;
  weighted: number;
};

export type ReportCard = {
  unweighted_gpa: number | null;
  weighted_gpa: number | null;
  subjects: ReportCardSubject[];
  analysis: string[];
  analysis_note: string;
};

export type PersonConfig = {
  name: string;
  emoji: string;
  terms: string[];
};

export const PERSONS: PersonConfig[] = [
  { name: "Anika", emoji: "🧒", terms: ["C1", "C2", "S1", "C3", "C4", "S2", "FIN"] },
  { name: "Pranshu", emoji: "🧑", terms: ["C1", "C2", "SE1", "S1", "C3", "C4", "SE2", "S2", "FIN"] },
  { name: "Vamshi", emoji: "👨", terms: [] },
  { name: "Hyma", emoji: "👩", terms: [] },
];
