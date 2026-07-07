"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations/onboarding";

export type OnboardingActionState = {
  error?: string;
} | null;

export async function completeOnboarding(
  _prevState: OnboardingActionState,
  formData: FormData
): Promise<OnboardingActionState> {
  const parsed = onboardingSchema.safeParse({
    businessName: formData.get("businessName"),
    phone: formData.get("phone"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc("complete_onboarding", {
    business_name: parsed.data.businessName,
    business_phone: parsed.data.phone || "",
    business_address: parsed.data.address || "",
  });

  if (error) {
    return {
      error: "No se pudo crear tu barbería. Inténtalo de nuevo.",
    };
  }

  redirect("/dashboard");
}
