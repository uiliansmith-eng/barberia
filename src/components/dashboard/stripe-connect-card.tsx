"use client";

import { useState, useTransition } from "react";
import { CreditCard, ExternalLink } from "lucide-react";
import {
  createStripeConnectLink,
  setRequireOnlinePayment,
} from "@/app/(app)/dashboard/stripe-actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function StripeConnectCard({
  chargesEnabled,
  requireOnlinePayment,
}: {
  chargesEnabled: boolean;
  requireOnlinePayment: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [required, setRequired] = useState(requireOnlinePayment);
  const [error, setError] = useState<string | null>(null);

  function handleConnect() {
    startTransition(async () => {
      const result = await createStripeConnectLink();
      if ("url" in result) {
        window.location.href = result.url;
      } else {
        setError(result.error);
      }
    });
  }

  function handleToggle(next: boolean) {
    setRequired(next);
    setError(null);
    startTransition(async () => {
      const result = await setRequireOnlinePayment(next);
      if (result.error) {
        setRequired(!next);
        setError(result.error);
      }
    });
  }

  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <CreditCard className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">
          Cobros online:{" "}
          <span className="font-medium text-foreground">
            {chargesEnabled ? "Stripe conectado" : "No conectado"}
          </span>
        </p>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

        {chargesEnabled && (
          <div className="mt-2 flex items-center gap-2">
            <Switch
              checked={required}
              onCheckedChange={handleToggle}
              disabled={pending}
            />
            <span className="text-sm text-foreground/85">
              Exigir pago online al reservar
            </span>
          </div>
        )}
      </div>

      {!chargesEnabled && (
        <Button size="sm" onClick={handleConnect} disabled={pending}>
          {pending ? "Redirigiendo..." : "Conectar con Stripe"}
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
