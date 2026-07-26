import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccountButton } from "@/components/dashboard/delete-account-button";

export const metadata: Metadata = {
  title: "Cuenta — BarberOS",
};

const roleLabels: Record<string, string> = {
  owner: "Dueño",
  manager: "Gerente",
  barber: "Barbero",
  receptionist: "Recepción",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const isOwner = profile?.role === "owner";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold text-foreground">Tu cuenta</h1>

      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">
            {profile?.full_name || "Usuario"}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {profile?.role ? (roleLabels[profile.role] ?? profile.role) : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-card p-6">
        <div>
          <h2 className="text-sm font-bold text-foreground">Zona de peligro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isOwner
              ? "Eliminar tu cuenta borra también toda tu barbería (citas, clientes, barberos, servicios, inventario) y cancela tu suscripción. Esta acción no se puede deshacer."
              : "Eliminar tu cuenta borra tu acceso a esta barbería. Esta acción no se puede deshacer."}
          </p>
        </div>
        <div>
          <DeleteAccountButton isOwner={isOwner} />
        </div>
      </div>
    </div>
  );
}
