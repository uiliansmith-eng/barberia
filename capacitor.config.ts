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
    // Keep this the bare origin, no path — Capacitor's cross-origin
    // navigation check gets flaky if server.url includes a path, and
    // wrongly treats same-origin links (e.g. the sidebar) as external,
    // bouncing them out to the system browser. The redirect off the
    // marketing landing page for native cold starts happens client-side
    // instead (see NativeLandingRedirect).
    url: "https://barberos.appstles.com",
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
