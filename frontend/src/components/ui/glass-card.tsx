import * as React from "react";

import { cn } from "@/lib/utils";

function GlassCard({
  className,
  glow,
  children,
  ...props
}: React.ComponentProps<"div"> & { glow?: string }) {
  return (
    <div
      data-slot="glass-card"
      className={cn(
        "glass relative overflow-hidden rounded-3xl p-5 text-white",
        className
      )}
      {...props}
    >
      {glow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 size-40 rounded-full opacity-30 blur-3xl"
          style={{ background: glow }}
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

export { GlassCard };
