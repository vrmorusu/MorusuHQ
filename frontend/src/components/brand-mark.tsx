import Link from "next/link";

export function BrandMark({
  tagline = true,
  variant = "dark",
}: {
  tagline?: boolean;
  variant?: "dark" | "light";
}) {
  const isLight = variant === "light";
  return (
    <Link href="/" className="font-ayuthaya inline-flex flex-col leading-none">
      <span>
        <span className={`text-3xl font-bold tracking-tight ${isLight ? "text-white" : ""}`}>
          Morusu
        </span>
        <span
          className={`text-3xl font-light italic ${isLight ? "text-white/60" : "text-primary/70"}`}
        >
          HQ
        </span>
      </span>
      {tagline ? (
        <span
          className={`text-sm italic font-medium ${isLight ? "text-white/50" : "text-muted-foreground"}`}
        >
          Family Operating System
        </span>
      ) : null}
    </Link>
  );
}
