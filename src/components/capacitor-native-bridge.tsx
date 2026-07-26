"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

// No-ops outside the native Android/iOS shell (regular browser visits to
// barberos.appstles.com never touch this).
export function CapacitorNativeBridge() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#141210" }).catch(() => {});

    const listener = App.addListener("backButton", () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);

  return null;
}
