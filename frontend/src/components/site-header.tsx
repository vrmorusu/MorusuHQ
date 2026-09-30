import { BrandMark } from "@/components/brand-mark";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-8 py-3">
        <BrandMark tagline={false} />
      </div>
    </header>
  );
}
