"use client";

import { Trophy } from "lucide-react";
import type { StudyPoints } from "@/components/study-center/types";

export function StudyPointsBadge({ points }: { points: StudyPoints | null }) {
  return (
    <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
      <Trophy className="size-4 text-amber-300" />
      <span>{points?.total ?? 0} study pts this month</span>
    </div>
  );
}
