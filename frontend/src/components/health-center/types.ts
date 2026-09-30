export type HealthMetric = {
  id: number;
  person: string;
  metric_type: string;
  value: number;
  value_secondary?: number | null;
  unit?: string | null;
  date: string;
  notes?: string | null;
  source: string;
};

export type HealthRecord = {
  id: number;
  family_member: string;
  record_type: string;
  description: string;
  date: string;
};

export type MetricConfig = {
  type: string;
  label: string;
  unit: string;
  icon: string;
  color: string;
  hasSecondary: boolean;
  secondaryLabel?: string;
  higherIsBetter: boolean | null;
};

export const METRIC_CONFIGS: Record<string, MetricConfig> = {
  weight: { type: "weight", label: "Weight", unit: "lbs", icon: "⚖️", color: "rose", hasSecondary: false, higherIsBetter: false },
  height: { type: "height", label: "Height", unit: "in", icon: "📏", color: "sky", hasSecondary: false, higherIsBetter: null },
  steps: { type: "steps", label: "Steps", unit: "steps", icon: "👣", color: "emerald", hasSecondary: false, higherIsBetter: true },
  blood_pressure: {
    type: "blood_pressure",
    label: "Blood Pressure",
    unit: "mmHg",
    icon: "❤️",
    color: "red",
    hasSecondary: true,
    secondaryLabel: "Diastolic",
    higherIsBetter: false,
  },
  blood_sugar: { type: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", icon: "🩸", color: "amber", hasSecondary: false, higherIsBetter: false },
  meditation: { type: "meditation", label: "Meditation", unit: "min", icon: "🧘", color: "violet", hasSecondary: false, higherIsBetter: true },
  exercise: { type: "exercise", label: "Exercise", unit: "min", icon: "🏋️", color: "orange", hasSecondary: false, higherIsBetter: true },
};

export const PERSON_METRICS: Record<string, string[]> = {
  Vamshi: ["weight", "steps", "blood_pressure", "blood_sugar", "meditation", "exercise"],
  Hyma: ["weight", "steps", "blood_pressure", "blood_sugar", "meditation", "exercise"],
  Pranshu: ["weight", "height"],
  Anika: ["weight", "height"],
};

export const HEALTH_PERSONS = [
  { name: "Vamshi", emoji: "👨" },
  { name: "Hyma", emoji: "👩" },
  { name: "Pranshu", emoji: "🧑" },
  { name: "Anika", emoji: "🧒" },
];
