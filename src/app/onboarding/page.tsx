import type { Metadata } from "next";
import { Scissors } from "lucide-react";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export const metadata: Metadata = {
  title: "Configura tu barbería — BarberOS",
};

export default function OnboardingPage() {
  return (
    <div className="dark bg-mesh-dark bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 flex items-center gap-2 font-semibold tracking-tight text-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="h-4 w-4" />
        </span>
        BarberOS
      </div>

      <div className="glass w-full max-w-sm rounded-2xl p-8 shadow-lg">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Configura tu barbería
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Un último paso antes de entrar al panel.
        </p>
        <OnboardingForm />
      </div>
    </div>
  );
}
