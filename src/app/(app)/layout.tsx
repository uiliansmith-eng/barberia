import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app/sidebar";
import { getSubscriptionInfo } from "@/lib/subscription";
import { HideSplashScreen } from "@/components/hide-splash-screen";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = "";
  let role = "";
  let isPaid = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role, tenant_id")
      .eq("id", user.id)
      .single();

    fullName = profile?.full_name ?? user.email ?? "";
    role = profile?.role ?? "";

    if (profile?.tenant_id) {
      isPaid = (await getSubscriptionInfo(profile.tenant_id, supabase)).isPaid;
    }
  }

  return (
    <div className="app-theme flex min-h-screen bg-background text-foreground">
      <HideSplashScreen />
      <AppSidebar fullName={fullName} role={role} isPaid={isPaid} />
      <main className="min-h-screen min-w-0 flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-0 md:pl-[220px]">
        {children}
      </main>
    </div>
  );
}
