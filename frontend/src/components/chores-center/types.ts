export type FamilyMember = {
  id: number;
  name: string;
  role: string;
  emoji: string;
  color: string;
  status: string;
};

export type Chore = {
  id: number;
  title: string;
  assignee?: string | null;
  points: number;
  done: boolean;
  due_date?: string | null;
  recurring: boolean;
  interval_days?: number | null;
};

export type ChoreTemplate = {
  id: number;
  age_band: string;
  title: string;
  points: number;
  recurring: boolean;
  interval_days: number;
};

export const AGE_BANDS = ["young_child", "child", "teen", "adult"] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  young_child: "Young Child (K-2)",
  child: "Child (Grades 3-6)",
  teen: "Teen (Grades 7-12)",
  adult: "Adult",
};

/** Infer an age band from a FamilyMember's free-text role (e.g. "Grade 10", "Parent"). */
export function inferAgeBand(role: string): AgeBand {
  const r = role.toLowerCase();
  if (r.includes("parent") || r.includes("adult") || r.includes("guardian")) return "adult";
  const match = r.match(/grade\s*(\d+)/);
  if (match) {
    const grade = parseInt(match[1], 10);
    if (grade <= 2) return "young_child";
    if (grade <= 6) return "child";
    return "teen";
  }
  return "adult";
}
