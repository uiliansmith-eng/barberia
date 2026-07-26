"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

// No-ops outside the native Android/iOS shell (regular browser visits to
// barberos.appstles.com never touch this).
export function CapacitorNativeBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#141210" }).catch(() => {});

    // Safety net: launchAutoHide is off (capacitor.config.ts) so
    // HideSplashScreen can cover the landing-page redirect without a
    // flash. If that never mounts — an error page, a slow network — don't
    // leave people staring at the splash forever.
    const failSafe = setTimeout(() => {
      SplashScreen.hide().catch(() => {});
    }, 6000);

    const listener = App.addListener("backButton", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      clearTimeout(failSafe);
      listener.then((l) => l.remove());
    };
  }, []);

  return null;
}
