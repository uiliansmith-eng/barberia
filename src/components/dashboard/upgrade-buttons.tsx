"use client";

import { useTransition } from "react";
import { createSubscriptionCheckout } from "@/app/(app)/dashboard/subscription-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UpgradeButtons({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  function handleUpgrade(target: "pro" | "business") {
    startTransition(async () => {
      const result = await createSubscriptionCheckout(target);
      if ("url" in result) window.location.href = result.url;
    });
  }

  return (
    <div className={cn("flex gap-2", className)}>
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
  );
}
