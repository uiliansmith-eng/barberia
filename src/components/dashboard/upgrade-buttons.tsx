"use client";

import { useTransition } from "react";
import { createSubscriptionCheckout } from "@/app/(app)/dashboard/subscription-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsNativeApp } from "@/lib/use-is-native-app";

export function UpgradeButtons({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  const isNative = useIsNativeApp();

  function handleUpgrade(target: "pro" | "business") {
    startTransition(async () => {
      const result = await createSubscriptionCheckout(target);
      if ("url" in result) window.location.href = result.url;
    });
  }

  if (isNative) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        Mejora tu plan desde barberos.appstles.com
      </p>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
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
