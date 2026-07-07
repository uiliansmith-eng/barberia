import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Scissors } from "lucide-react";
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
import { NewServiceButton } from "@/components/services/new-service-button";
import { ServiceRowActions } from "@/components/services/service-row-actions";

export const metadata: Metadata = {
  title: "Servicios — BarberFlow AI",
};

export default async function ServicesPage() {
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

  const { data: services } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price, status")
    .eq("tenant_id", profile.tenant_id)
    .order("name");

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Servicios
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services?.length ?? 0} servicios
          </p>
        </div>
        <NewServiceButton />
      </div>

      <div className="glass rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!services || services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No hay servicios todavía.
                </TableCell>
              </TableRow>
            ) : (
              services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Scissors className="h-3.5 w-3.5" />
                      </span>
                      {s.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.duration_minutes} min
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {Number(s.price).toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "active" ? "secondary" : "outline"}>
                      {s.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ServiceRowActions
                      defaults={{
                        id: s.id,
                        name: s.name,
                        durationMinutes: s.duration_minutes,
                        price: Number(s.price),
                        status: s.status,
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
