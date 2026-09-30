"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { ChoreColumn } from "@/components/chores-center/chore-column";
import { ChoreTemplatesPanel } from "@/components/chores-center/chore-templates-panel";
import { ChoresLeaderboard } from "@/components/chores-center/chores-leaderboard";
import { apiGet } from "@/lib/api";
import type { Chore, ChoreTemplate, FamilyMember } from "@/components/chores-center/types";

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

const OTHER_MEMBER = { id: "other", name: "Other", emoji: "📋", role: "Adult" };

export function ChoresView() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [templates, setTemplates] = useState<ChoreTemplate[]>([]);

  function loadMembers() {
    apiGet<FamilyMember[]>("/api/family/members").then(setMembers).catch(() => {});
  }
  function loadChores() {
    apiGet<Chore[]>("/api/chores/").then(setChores).catch(() => {});
  }
  function loadTemplates() {
    apiGet<ChoreTemplate[]>("/api/chores/templates").then(setTemplates).catch(() => {});
  }

  useEffect(() => {
    loadMembers();
    loadChores();
    loadTemplates();
  }, []);

  const memberNames = useMemo(() => new Set(members.map((m) => m.name)), [members]);
  const otherChores = useMemo(() => chores.filter((c) => !c.assignee || !memberNames.has(c.assignee)), [chores, memberNames]);

  return (
    <div className="chores-center">
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
            <ChoresLeaderboard members={members} chores={chores} />
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {members.map((m, i) => (
              <Reveal key={m.id} delay={60 + i * 60}>
                <ChoreColumn
                  member={m}
                  chores={chores.filter((c) => c.assignee === m.name)}
                  onChanged={() => {
                    loadChores();
                  }}
                />
              </Reveal>
            ))}
            {otherChores.length > 0 ? (
              <Reveal delay={60 + members.length * 60}>
                <ChoreColumn member={OTHER_MEMBER} chores={otherChores} onChanged={loadChores} />
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={120 + (members.length + 1) * 60}>
            <ChoreTemplatesPanel templates={templates} onChanged={loadTemplates} />
          </Reveal>
        </main>
      </div>
    </div>
  );
}
