import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { MODULES, getModule } from "@/lib/modules";
import { CrudModule } from "@/components/crud-module";
import { AiMealsView } from "@/components/ai-meals-view";
import { AiAssistantView } from "@/components/ai-assistant-view";
import { ReportsView } from "@/components/reports-view";
import { CalendarView } from "@/components/calendar-center/calendar-view";
import { FinanceView } from "@/components/finance-center/finance-view";
import { GroceryPantryView } from "@/components/grocery-center/grocery-pantry-view";
import { ChoresView } from "@/components/chores-center/chores-view";
import { StudyView } from "@/components/study-center/study-view";
import { MealPrepView } from "@/components/meal-prep-center/meal-prep-view";
import { HealthView } from "@/components/health-center/health-view";

export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

function ModuleBody({ slug }: { slug: string }) {
  switch (slug) {
    case "ai-meals":
      return <AiMealsView />;
    case "ai-assistant":
      return <AiAssistantView />;
    case "reports":
      return <ReportsView />;
    default:
      return <CrudModule slug={slug} />;
  }
}

const SPECIAL_VIEW_SLUGS = new Set([
  "calendar",
  "finance",
  "grocery",
  "pantry",
  "chores",
  "school",
  "sat-tracker",
  "spelling-tracker",
  "shloka-tracker",
  "meals",
  "ai-meals",
  "health",
]);

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const moduleDef = getModule(slug);
  if (!moduleDef && !SPECIAL_VIEW_SLUGS.has(slug)) notFound();

  if (slug === "calendar") {
    return <CalendarView />;
  }

  if (slug === "finance") {
    return <FinanceView />;
  }

  if (slug === "grocery" || slug === "pantry") {
    return <GroceryPantryView />;
  }

  if (slug === "chores") {
    return <ChoresView />;
  }

  if (slug === "school" || slug === "sat-tracker" || slug === "spelling-tracker" || slug === "shloka-tracker") {
    return <StudyView />;
  }

  if (slug === "meals" || slug === "ai-meals") {
    return <MealPrepView />;
  }

  if (slug === "health") {
    return <HealthView />;
  }

  if (!moduleDef) notFound();

  const Icon = moduleDef.icon;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3">
          <Link href="/">
            <ArrowLeft />
            Back to Command Center
          </Link>
        </Button>
        <Card className="mb-6">
          <CardHeader>
            <div className={`mb-2 inline-flex size-12 items-center justify-center rounded-lg ${moduleDef.color}`}>
              <Icon className="size-6" />
            </div>
            <CardTitle className="font-ayuthaya text-2xl font-bold">{moduleDef.name}</CardTitle>
            <CardDescription className="italic">{moduleDef.description}</CardDescription>
          </CardHeader>
        </Card>
        <ModuleBody slug={slug} />
      </main>
    </>
  );
}
