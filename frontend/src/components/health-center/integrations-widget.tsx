"use client";

import { useEffect, useRef, useState } from "react";
import { Watch, Scale, UploadCloud, Info } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";

type IntegrationStatus = { configured: boolean; connected: boolean; message: string };
type StatusResponse = { wyze: IntegrationStatus; zepp: IntegrationStatus };

export function IntegrationsWidget({ person, onImported }: { person: string; onImported: () => void }) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiGet<StatusResponse>("/api/health-tracking/integrations/status").then(setStatus).catch(() => {});
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      const res = await fetch(
        `${API_BASE}/api/health-tracking/metrics/import-csv?person=${person}&source=zepp`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      setResult(`Imported ${data.imported} reading(s) from Zepp export.`);
      onImported();
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <GlassCard glow="radial-gradient(circle, #38bdf8, transparent 70%)">
      <p className="mb-3 text-sm italic font-medium text-white/60">Sync from Devices</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
            <Watch className="size-4 text-sky-300" /> Zepp / Amazfit
          </p>
          <p className="mb-2 flex items-start gap-1.5 text-xs text-white/50">
            <Info className="mt-0.5 size-3 shrink-0 text-amber-300" /> {status?.zepp.message ?? "Checking…"}
          </p>
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          <Button size="sm" disabled={uploading} onClick={() => inputRef.current?.click()} className="bg-sky-500 hover:bg-sky-400">
            <UploadCloud className="size-3.5" /> {uploading ? "Importing…" : "Import Zepp CSV"}
          </Button>
          {result ? <p className="mt-1.5 text-xs text-emerald-300">{result}</p> : null}
        </div>

        <div className="rounded-xl bg-white/5 p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
            <Scale className="size-4 text-violet-300" /> Wyze Scale
          </p>
          <p className="flex items-start gap-1.5 text-xs text-white/50">
            <Info className="mt-0.5 size-3 shrink-0 text-amber-300" /> {status?.wyze.message ?? "Checking…"}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
