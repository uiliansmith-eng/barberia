import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { NewBarberButton } from "@/components/employees/new-barber-button";
import { BarberRowActions } from "@/components/employees/barber-row-actions";

export const metadata: Metadata = {
  title: "Empleados — BarberFlow AI",
};

export default async function EmployeesPage() {
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

  const { data: barbers } = await supabase
    .from("barbers")
    .select("id, full_name, specialty, commission_pct, status")
    .eq("tenant_id", profile.tenant_id)
    .order("full_name");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Empleados
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {barbers?.length ?? 0} barberos
          </p>
        </div>
        <NewBarberButton />
      </div>

      <div className="glass rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Comisión</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!barbers || barbers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay barberos todavía.
                </TableCell>
              </TableRow>
            ) : (
              barbers.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-foreground">
                    <Link
                      href={`/empleados/${b.id}`}
                      className="flex items-center gap-2.5 hover:text-primary"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {b.full_name.charAt(0).toUpperCase()}
                      </span>
                      {b.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {b.specialty ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Number(b.commission_pct)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant={b.status === "active" ? "secondary" : "outline"}>
                      {b.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <BarberRowActions
                      defaults={{
                        id: b.id,
                        fullName: b.full_name,
                        specialty: b.specialty ?? undefined,
                        commissionPct: Number(b.commission_pct),
                        status: b.status,
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
