import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Encuentra tu barbería — BarberOS",
};

type TenantResult = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  services_count: number;
  barbers_count: number;
  avg_rating: number | null;
  reviews_count: number;
  price_tier: string | null;
  tags: string[];
  open_now: boolean;
};

const FILTERS = [
  { id: "todos", label: "Todos" },
  { id: "corte-clasico", label: "Corte clásico", service: "Corte clásico" },
  { id: "barba", label: "Barba", service: "Barba" },
  { id: "tinte", label: "Tinte", service: "Tinte" },
  { id: "abierto", label: "Abierto ahora", openNow: true },
  { id: "top", label: "Mejor calificados", sort: "rating" },
] as const;

export default async function BarberiasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; area?: string; filter?: string }>;
}) {
  const { q, area, filter } = await searchParams;
  const activeFilter =
    FILTERS.find((f) => f.id === filter) ?? FILTERS[0];

  const supabase = await createClient();
  const { data } = await supabase.rpc("public_list_tenants", {
    p_query: q ?? "",
    p_area: area ?? "",
    p_service: "service" in activeFilter ? activeFilter.service : "",
    p_open_now: "openNow" in activeFilter ? activeFilter.openNow : false,
    p_sort: "sort" in activeFilter ? activeFilter.sort : "",
  });
  const shops = (data as unknown as TenantResult[] | null) ?? [];

  function filterHref(filterId: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (area) params.set("area", area);
    if (filterId !== "todos") params.set("filter", filterId);
    const qs = params.toString();
    return qs ? `/barberias?${qs}` : "/barberias";
  }

  return (
    <div className="app-theme min-h-screen bg-background text-foreground">
      {/* TOP BAR */}
      <div className="flex items-center justify-between border-b border-border px-8 py-5 sm:px-12">
        <Link href="/barberias" className="font-logo text-[26px] leading-none">
          BARBER<span className="text-primary">OS</span>
        </Link>
        <div className="flex items-center gap-5 text-[13px] text-muted-foreground">
          <Link href="/#features" className="hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="/" className="hover:text-foreground">
            Para negocios
          </Link>
        </div>
      </div>

      {/* HERO / SEARCH */}
      <div className="px-8 pt-10 pb-7 sm:px-12">
        <h1 className="mb-1.5 text-[30px] font-extrabold">
          Encuentra tu barbería
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {shops.length} {shops.length === 1 ? "barbería" : "barberías"} en el
          directorio
        </p>

        <form className="mb-4 flex flex-col gap-2.5 sm:flex-row">
          <div className="flex flex-[2] items-center gap-2.5 rounded-[10px] border border-border bg-card px-4 py-3">
            <span className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/60" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre o servicio"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <div className="flex flex-1 items-center gap-2.5 rounded-[10px] border border-border bg-card px-4 py-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-primary" />
            <input
              name="area"
              defaultValue={area}
              placeholder="Ubicación"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          {filter && <input type="hidden" name="filter" value={filter} />}
          <button
            type="submit"
            className="flex items-center justify-center rounded-[10px] bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.id === activeFilter.id;
            return (
              <Link
                key={f.id}
                href={filterHref(f.id)}
                className={
                  active
                    ? "rounded-full border border-primary bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground"
                    : "rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 gap-[22px] px-8 pt-2 pb-14 sm:grid-cols-2 sm:px-12 lg:grid-cols-3">
        {shops.length === 0 ? (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            {q || area || filter
              ? "No encontramos barberías que coincidan con tu búsqueda."
              : "Todavía no hay barberías registradas."}
          </p>
        ) : (
          shops.map((shop) => (
            <Link
              key={shop.slug}
              href={`/reservar/${shop.slug}`}
              className="overflow-hidden rounded-[14px] border border-border bg-card"
            >
              <div className="relative flex h-[150px] w-full items-center justify-center bg-[repeating-linear-gradient(135deg,#241f19,#241f19_10px,#2b241c_10px,#2b241c_20px)]">
                <span className="font-mono text-[11px] tracking-wide text-[#7a7263]">
                  FOTO DE LA BARBERÍA
                </span>
                {shop.price_tier && (
                  <span className="absolute top-2.5 right-2.5 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold">
                    {shop.price_tier}
                  </span>
                )}
              </div>

              <div className="px-[18px] pt-4 pb-[18px]">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <p className="text-base font-bold">{shop.name}</p>
                  {shop.reviews_count > 0 && (
                    <span className="flex shrink-0 items-center gap-1">
                      <span className="h-[7px] w-[7px] rounded-full bg-primary" />
                      <span className="text-[13px] font-bold">
                        {shop.avg_rating}
                      </span>
                    </span>
                  )}
                </div>
                <p className="mb-2.5 text-xs text-muted-foreground">
                  {shop.reviews_count}{" "}
                  {shop.reviews_count === 1 ? "reseña" : "reseñas"}
                  {shop.address ? ` · ${shop.address}` : ""}
                </p>

                {shop.tags.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {shop.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-xl bg-[#262019] px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#262019] pt-3">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: shop.open_now ? "#5cc98a" : "#8a8378" }}
                  >
                    {shop.open_now ? "Abierto ahora" : "Cerrado"}
                  </span>
                  <span className="text-[13px] font-bold text-primary">
                    Ver perfil →
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <p className="pb-14 text-center text-sm text-muted-foreground">
        ¿No encuentras tu barbería?{" "}
        <Link href="/anadir-barberia" className="text-primary hover:underline">
          Añádela al directorio
        </Link>
      </p>
    </div>
  );
}
