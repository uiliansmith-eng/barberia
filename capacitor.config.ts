import type { CapacitorConfig } from "@capacitor/cli";

// BarberOS runs server components, Server Actions, and an auth proxy that a
// static `next export` can't support — so instead of bundling a local build,
// the native shell's WebView navigates straight to the real production site.
// This still gets us a real Android app (native chrome, plugin bridge for
// back button/status bar/push notifications later) without duplicating the
// whole Next.js app as a static bundle.
const config: CapacitorConfig = {
  appId: "com.appstles.barberos",
  appName: "BarberOS",
  webDir: "public",
  server: {
    // Straight to the dashboard, not the marketing landing page — the
    // dashboard itself redirects to /login when there's no session, so
    // this covers both logged-in and logged-out cold starts.
    url: "https://barberos.appstles.com/dashboard",
    cleartext: false,
    // Stripe Connect onboarding (and its own redirect chain) navigates the
    // WebView to stripe.com — Capacitor blocks cross-origin navigation by
    // default, so without this the "Conectar con Stripe" flow silently
    // goes nowhere.
    allowNavigation: ["*.stripe.com"],
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
