"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

// Apple rejects apps that let users buy digital subscriptions through a
// non-Apple payment flow from inside the app (App Review 3.1.1). Callers use
// this to hide Stripe checkout/billing-portal CTAs when running in the
// native iOS/Android shell, pointing people to the website instead.
export function useIsNativeApp() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  return isNative;
}
