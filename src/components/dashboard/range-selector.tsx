"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const RANGES = ["Día", "Semana", "Mes"] as const;

export function RangeSelector() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("Semana");

  return (
    <div className="flex gap-1.5 rounded-lg border border-border bg-secondary p-1">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => setRange(r)}
          className={cn(
            "rounded-md px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition",
            range === r && "bg-primary font-bold text-primary-foreground"
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
