import { AlertTriangle, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookingUsageBanner({
  used,
  limit,
  isPaid,
}: {
  used: number;
  limit: number;
  isPaid: boolean;
}) {
  if (isPaid) return null;

  const pct = Math.min((used / limit) * 100, 100);
  const reached = used >= limit;
  const near = !reached && pct >= 80;

  return (
    <div
      className={cn(
        "glass flex items-center gap-4 rounded-2xl p-4",
        reached && "border-destructive/40",
        near && "border-amber-500/40"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
          reached && "bg-destructive/10 text-destructive",
          near && "bg-amber-500/10 text-amber-600"
        )}
      >
        {reached || near ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Gauge className="h-4 w-4" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium text-foreground">
            {reached
              ? "Límite del plan gratis alcanzado"
              : near
                ? "Cerca del límite del plan gratis"
                : "Citas este mes (plan gratis)"}
          </p>
          <span className="text-muted-foreground">
            {used} / {limit}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full bg-primary",
              reached && "bg-destructive",
              near && "bg-amber-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        {(reached || near) && (
          <p className="mt-2 text-xs text-muted-foreground">
            {reached
              ? "No se podrán crear más citas este mes hasta que actualices tu plan."
              : "Actualiza tu plan para no quedarte sin citas antes de fin de mes."}
          </p>
        )}
      </div>
    </div>
  );
}
