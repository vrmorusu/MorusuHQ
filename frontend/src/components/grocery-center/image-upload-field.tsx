"use client";

import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { apiUploadImage, resolveMediaUrl } from "@/lib/api";

export function ImageUploadField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await apiUploadImage(file);
      onChange(url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const preview = resolveMediaUrl(value);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/5 text-white/50 transition-colors hover:bg-white/10"
        aria-label="Upload photo"
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-cover" />
        ) : (
          <Camera className="size-4" />
        )}
      </button>
      {preview ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Remove photo"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
      {error ? <span className="text-xs text-rose-300">{error}</span> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
