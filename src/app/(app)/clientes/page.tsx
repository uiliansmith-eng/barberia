import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { NewCustomerButton } from "@/components/customers/new-customer-button";
import { CustomerRowActions } from "@/components/customers/customer-row-actions";

export const metadata: Metadata = {
  title: "Clientes — BarberFlow AI",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) redirect("/onboarding");

  let query = supabase
    .from("customers")
    .select("id, full_name, phone, email, last_visit_at, total_spent")
    .eq("tenant_id", profile.tenant_id)
    .order("full_name");

  if (q) {
    const safeQ = q.replace(/[,()%*]/g, "");
    if (safeQ) {
      query = query.or(`full_name.ilike.%${safeQ}%,phone.ilike.%${safeQ}%`);
    }
  }

  const { data: customers } = await query;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customers?.length ?? 0} clientes
          </p>
        </div>
        <NewCustomerButton />
      </div>

      <form className="relative max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o teléfono..."
          className="pl-9"
        />
      </form>

      {!customers || customers.length === 0 ? (
        <div className="glass rounded-2xl py-12 text-center text-muted-foreground">
          No hay clientes todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {customers.map((c) => (
            <div
              key={c.id}
              className="glass flex items-center gap-4 rounded-2xl p-4"
            >
              <Link
                href={`/clientes/${c.id}`}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20"
              >
                {c.full_name.charAt(0).toUpperCase()}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/clientes/${c.id}`}
                  className="truncate font-semibold text-foreground hover:text-primary"
                >
                  {c.full_name}
                </Link>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {c.phone ?? "—"} {c.email ? `· ${c.email}` : ""}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Última visita{" "}
                  <span className="text-foreground">
                    {c.last_visit_at
                      ? new Date(c.last_visit_at).toLocaleDateString("es-ES")
                      : "—"}
                  </span>
                  {" · "}
                  <span className="font-medium text-primary">
                    {Number(c.total_spent).toFixed(2)}€
                  </span>
                </p>
              </div>
              <CustomerRowActions
                defaults={{
                  id: c.id,
                  fullName: c.full_name,
                  phone: c.phone ?? undefined,
                  email: c.email ?? undefined,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
