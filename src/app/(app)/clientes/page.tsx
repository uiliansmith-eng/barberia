import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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

      <div className="glass rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Última visita</TableHead>
              <TableHead>Total gastado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!customers || customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No hay clientes todavía.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="flex items-center gap-2.5 hover:text-primary"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {c.full_name.charAt(0).toUpperCase()}
                      </span>
                      {c.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.last_visit_at
                      ? new Date(c.last_visit_at).toLocaleDateString("es-ES")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Number(c.total_spent).toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <CustomerRowActions
                      defaults={{
                        id: c.id,
                        fullName: c.full_name,
                        phone: c.phone ?? undefined,
                        email: c.email ?? undefined,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
