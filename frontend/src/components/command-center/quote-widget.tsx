"use client";

import { Quote } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements are the key to staggering long-term results.",
  "A family that grows together, glows together.",
  "Discipline is choosing between what you want now and what you want most.",
  "Every day is a fresh start — make it count.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Believe you can, and you're halfway there.",
  "Great things never come from comfort zones.",
  "Teamwork makes the dream work.",
  "It always seems impossible until it's done.",
  "Focus on progress, not perfection.",
  "The only way to do great work is to love what you do.",
  "Push yourself, because no one else is going to do it for you.",
  "A little progress each day adds up to big results.",
  "Dream big, start small, act now.",
  "Your attitude determines your direction.",
  "Hard work beats talent when talent doesn't work hard.",
  "Today's accomplishments were yesterday's impossibilities.",
  "Be so good they can't ignore you.",
  "The future belongs to those who prepare for it today.",
  "Kindness is a language everyone understands.",
  "Learning never exhausts the mind.",
  "You are capable of more than you know.",
  "Every accomplishment starts with the decision to try.",
  "Consistency is what transforms average into excellence.",
  "Together we can do great things.",
  "Choose to shine, every single day.",
  "What we do today, echoes into tomorrow.",
  "Growth begins at the end of your comfort zone.",
];

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function QuoteWidget() {
  const quote = QUOTES[dayOfYear(new Date()) % QUOTES.length];

  return (
    <GlassCard glow="radial-gradient(circle, #c084fc, transparent 70%)" className="flex items-center gap-3">
      <Quote className="size-6 shrink-0 text-violet-300" />
      <p className="font-ayuthaya text-sm leading-snug italic text-white/80">{quote}</p>
    </GlassCard>
  );
}
