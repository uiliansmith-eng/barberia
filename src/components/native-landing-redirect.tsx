"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsNativeApp } from "@/lib/use-is-native-app";

// The native app's cold-start URL is the bare marketing domain (see
// capacitor.config.ts — it has to stay path-less for Capacitor's
// same-origin navigation check to work). This bounces native launches off
// the marketing page and into the app; /dashboard redirects to /login on
// its own when there's no session, so this covers both cases. A
// client-side router.replace, not a native navigation, so it doesn't touch
// Capacitor's WebView navigation policy at all.
export function NativeLandingRedirect() {
  const isNative = useIsNativeApp();
  const router = useRouter();

  useEffect(() => {
    if (isNative) router.replace("/dashboard");
  }, [isNative, router]);

  return null;
}
