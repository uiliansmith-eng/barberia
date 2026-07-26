"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

// launchAutoHide is off (see capacitor.config.ts) so the native splash
// stays up through the landing-page redirect and the dashboard/login data
// fetch, instead of auto-hiding as soon as the WebView's first response
// lands. Mount this only in layouts the app actually rests on
// ((app), (auth)) — never on the marketing page, which native never
// renders anyway.
export function HideSplashScreen() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide();
    }
  }, []);

  return null;
}
