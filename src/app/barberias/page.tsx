import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Scissors, Search, UserSquare2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Buscar barberías — BarberOS",
};

type TenantResult = {
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  services_count: number;
  barbers_count: number;
};

export default async function BarberiasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_list_tenants", {
    p_query: q ?? "",
  });
  const tenants = (data as unknown as TenantResult[] | null) ?? [];

  return (
    <div className="dark bg-mesh-dark bg-background text-foreground min-h-screen">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold tracking-tight">BarberOS</p>
            <p className="text-xs text-muted-foreground">Encuentra tu barbería</p>
          </div>
        </div>

        <div className="glass-strong flex flex-col items-center gap-3 rounded-3xl p-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Busca tu barbería y reserva
          </h1>
          <p className="text-sm text-muted-foreground">
            Todas las barberías que usan BarberOS, en un solo lugar.
          </p>

          <form className="mt-2 w-full max-w-md">
            <div className="glass flex items-center gap-2 rounded-2xl p-2">
              <Search className="ml-2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Nombre de la barbería..."
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <Button type="submit">Buscar</Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-3">
          {tenants.length === 0 ? (
            <p className="glass rounded-2xl p-6 text-center text-sm text-muted-foreground">
              {q
                ? `No encontramos barberías que coincidan con "${q}".`
                : "Todavía no hay barberías registradas."}
            </p>
          ) : (
            tenants.map((t) => (
              <Link
                key={t.slug}
                href={`/reservar/${t.slug}`}
                className="glass flex items-center gap-4 rounded-2xl p-4 transition hover:border-primary/40"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-lg shadow-primary/20">
                  <Scissors className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t.name}</p>
                  {t.address && (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {t.address}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Scissors className="h-3.5 w-3.5" />
                      {t.services_count} servicios
                    </span>
                    <span className="flex items-center gap-1">
                      <UserSquare2 className="h-3.5 w-3.5" />
                      {t.barbers_count} barberos
                    </span>
                  </div>
                </div>
                <Button size="sm" nativeButton={false} render={<span />}>
                  Reservar
                </Button>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
