import { Lock } from "lucide-react";
import { UpgradeButtons } from "@/components/dashboard/upgrade-buttons";

export function Paywall({
  title,
  description,
  canUpgrade = true,
}: {
  title: string;
  description: string;
  canUpgrade?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {canUpgrade ? (
        <UpgradeButtons />
      ) : (
        <p className="text-xs text-muted-foreground">
          Pide al dueño de la barbería que mejore el plan para desbloquear
          esto.
        </p>
      )}
    </div>
  );
}
