"use client";

import { useTransition } from "react";
import { Crown, ExternalLink } from "lucide-react";
import {
  createSubscriptionCheckout,
  createBillingPortalSession,
} from "@/app/(app)/dashboard/subscription-actions";
import { Button } from "@/components/ui/button";

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro",
  business: "Business",
};

export function PlanCard({
  plan,
  status,
}: {
  plan: string | null;
  status: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const isActive =
    (plan === "pro" || plan === "business") &&
    (status === "active" || status === "trialing");

  function handleUpgrade(target: "pro" | "business") {
    startTransition(async () => {
      const result = await createSubscriptionCheckout(target);
      if ("url" in result) window.location.href = result.url;
    });
  }

  function handleManage() {
    startTransition(async () => {
      const result = await createBillingPortalSession();
      if ("url" in result) window.location.href = result.url;
    });
  }

  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Crown className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">
          Tu plan:{" "}
          <span className="font-medium text-foreground">
            {plan && isActive ? PLAN_LABELS[plan] : "Gratis"}
          </span>
        </p>
      </div>

      {plan && isActive ? (
        <Button size="sm" variant="outline" onClick={handleManage} disabled={pending}>
          Gestionar suscripción
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpgrade("pro")}
            disabled={pending}
          >
            Mejorar a Pro
          </Button>
          <Button size="sm" onClick={() => handleUpgrade("business")} disabled={pending}>
            Mejorar a Business
          </Button>
        </div>
      )}
    </div>
  );
}
