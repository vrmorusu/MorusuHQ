import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { GlassCard } from "@/components/ui/glass-card";
import { MODULES } from "@/lib/modules";

export default function AllModulesPage() {
  return (
    <div className="all-modules-center">
      <div className="mx-auto max-w-6xl px-6 py-6 sm:px-8 sm:py-8">
        <header className="mb-6 flex items-center justify-between text-white">
          <BrandMark tagline={false} variant="light" />
          <Link
            href="/"
            className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="size-4" />
            Command Center
          </Link>
        </header>

        <div className="mb-8 text-white">
          <h1 className="font-ayuthaya">
            <span className="text-2xl italic font-medium text-white/50">All </span>
            <span className="text-4xl font-bold tracking-tight">Morusu</span>
            <span className="text-4xl font-light italic text-white/70">HQ</span>
            <span className="text-2xl italic font-medium text-white/50"> modules</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {MODULES.map(({ slug, name, description, icon: Icon, color }) => (
            <Link key={slug} href={`/modules/${slug}`} className="group">
              <GlassCard
                glow="radial-gradient(circle, #818cf8, transparent 70%)"
                className="h-full transition-transform group-hover:-translate-y-1"
              >
                <div className={`mb-2 inline-flex size-10 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="size-5" />
                </div>
                <p className="font-ayuthaya text-lg font-semibold">{name}</p>
                <p className="text-sm text-white/50 italic">{description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
