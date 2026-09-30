import {
  CalendarDays,
  ListChecks,
  ChefHat,
  ShoppingCart,
  GraduationCap,
  HeartPulse,
  Wallet,
  StickyNote,
  Bot,
  FileBarChart2,
  type LucideIcon,
} from "lucide-react";

export type ModuleDef = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export const MODULES: ModuleDef[] = [
  {
    slug: "calendar",
    name: "Calendar",
    description: "Google Calendar sync for the whole family",
    icon: CalendarDays,
    color: "text-violet-600 bg-violet-100 dark:bg-violet-950 dark:text-violet-400",
  },
  {
    slug: "chores",
    name: "Chores & Rewards",
    description: "Track chores and earn rewards",
    icon: ListChecks,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400",
  },
  {
    slug: "meals",
    name: "Meal Prep",
    description: "Recipes, pantry-match suggestions, and this week's school menu",
    icon: ChefHat,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400",
  },
  {
    slug: "grocery",
    name: "Grocery Management",
    description: "Shopping list plus pantry & fridge inventory",
    icon: ShoppingCart,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400",
  },
  {
    slug: "school",
    name: "Study Tracking",
    description: "Grades, assignments, spelling, SAT/ACT prep & shloka — plus a study timer",
    icon: GraduationCap,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400",
  },
  {
    slug: "health",
    name: "Health Tracking",
    description: "Appointments, vitals, and medications",
    icon: HeartPulse,
    color: "text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400",
  },
  {
    slug: "finance",
    name: "Finance Center",
    description: "Budgets, bills, and expenses",
    icon: Wallet,
    color: "text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400",
  },
  {
    slug: "notes",
    name: "Notes",
    description: "Shared family notes",
    icon: StickyNote,
    color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400",
  },
  {
    slug: "ai-assistant",
    name: "AI Assistant",
    description: "Ask MorusuHQ anything",
    icon: Bot,
    color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-400",
  },
  {
    slug: "reports",
    name: "Monthly Reports",
    description: "A monthly recap of family life",
    icon: FileBarChart2,
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
  },
];

export function getModule(slug: string): ModuleDef | undefined {
  return MODULES.find((m) => m.slug === slug);
}
