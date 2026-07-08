import { createClient } from "@/lib/supabase/server";

export type SubscriptionInfo = {
  plan: string | null;
  status: string | null;
  isPaid: boolean;
};

export async function getSubscriptionInfo(
  tenantId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<SubscriptionInfo> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  const isPaid =
    (subscription?.status === "active" || subscription?.status === "trialing") &&
    (subscription?.plan === "pro" || subscription?.plan === "business");

  return {
    plan: subscription?.plan ?? null,
    status: subscription?.status ?? null,
    isPaid,
  };
}
