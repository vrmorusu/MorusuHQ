"use client";

import { useEffect, useState } from "react";
import { CalendarSync, Info } from "lucide-react";
import { apiGet } from "@/lib/api";

type GoogleStatus = { configured: boolean; connected: boolean; message: string };

export function GoogleSyncButton() {
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    apiGet<GoogleStatus>("/api/calendar/google/status").then(setStatus).catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowInfo((s) => !s)}
        className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-transform hover:scale-105 active:scale-95"
      >
        <CalendarSync className="size-4" />
        {status?.connected ? "Google Synced" : "Sync Google"}
      </button>
      {showInfo ? (
        <div className="absolute top-full right-0 z-10 mt-2 w-72 rounded-xl bg-black/90 p-3 text-xs text-white/70 shadow-xl">
          <p className="mb-1 flex items-center gap-1.5 font-medium text-white">
            <Info className="size-3.5" /> Google Calendar sync
          </p>
          <p>{status?.message ?? "Checking status…"}</p>
        </div>
      ) : null}
    </div>
  );
}
