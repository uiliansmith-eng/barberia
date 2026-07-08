import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app/sidebar";

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

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    fullName = profile?.full_name ?? user.email ?? "";
    role = profile?.role ?? "";
  }

  return (
    <div className="app-theme flex min-h-screen bg-background text-foreground">
      <AppSidebar fullName={fullName} role={role} />
      <main className="min-h-screen flex-1 pl-[220px]">{children}</main>
    </div>
  );
}
