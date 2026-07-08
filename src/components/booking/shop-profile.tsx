import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  avg_rating: number | null;
  reviews_count: number;
  price_tier: string | null;
  tags: string[];
  open_now: boolean;
};

type Service = { id: string; name: string; duration_minutes: number; price: number };
type Barber = { id: string; full_name: string; specialty: string | null };
type Hour = { label: string; is_today: boolean; range: string };

type Review = {
  customer_name: string;
  rating: number;
  comment: string | null;
};

type ReviewsData = { average: number; count: number; reviews: Review[] };

const AVATAR_COLORS = ["#c9a227", "#5c7fc9", "#5cc98a", "#e07a5c"];

const GALLERY_TILES = [
  { area: "1 / 1 / 3 / 2", label: "FOTO PRINCIPAL DEL LOCAL" },
  { area: "1 / 2 / 2 / 3", label: "INTERIOR" },
  { area: "1 / 3 / 2 / 4", label: "ESTACIÓN DE CORTE" },
  { area: "2 / 2 / 3 / 3", label: "BARBEROS EN ACCIÓN" },
  { area: "2 / 3 / 3 / 4", label: "PRODUCTOS" },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="text-xs font-bold text-primary">
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export async function ShopProfile({
  tenant,
  services,
  barbers,
  hours,
}: {
  tenant: Tenant;
  services: Service[];
  barbers: Barber[];
  hours: Hour[];
}) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_get_reviews", {
    p_tenant_id: tenant.id,
  });
  const reviewsData = data as unknown as ReviewsData | null;
  const topReviews = reviewsData?.reviews.slice(0, 3) ?? [];

  const minPrice =
    services.length > 0 ? Math.min(...services.map((s) => Number(s.price))) : null;

  return (
    <div className="pb-[100px]">
      {/* TOP BAR */}
      <div className="flex items-center justify-between border-b border-border px-8 py-5 sm:px-12">
        <div className="flex items-center gap-4">
          <Link
            href="/barberias"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Volver al directorio"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/barberias" className="font-logo text-[26px] leading-none">
            BARBER<span className="text-primary">OS</span>
          </Link>
        </div>
      </div>

      {/* GALLERY */}
      <div className="px-8 pt-6 sm:px-12">
        <div
          className="grid h-[220px] gap-2 overflow-hidden rounded-2xl sm:h-[280px] lg:h-[340px]"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          {GALLERY_TILES.map((tile) => (
            <div
              key={tile.label}
              style={{ gridArea: tile.area }}
              className="relative flex items-center justify-center bg-[repeating-linear-gradient(135deg,#241f19,#241f19_10px,#2b241c_10px,#2b241c_20px)]"
            >
              <span className="px-2.5 text-center font-mono text-[11px] tracking-wide text-[#7a7263]">
                {tile.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HEADER INFO */}
      <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-6 sm:px-12">
        <div>
          <h1 className="text-[28px] font-extrabold">{tenant.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            {tenant.reviews_count > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-bold">{tenant.avg_rating}</span>
                <span className="text-[13px] text-muted-foreground">
                  ({tenant.reviews_count} reseñas)
                </span>
              </span>
            )}
            {tenant.reviews_count > 0 && (
              <span className="text-[13px] text-muted-foreground">·</span>
            )}
            <span className="text-[13px] text-muted-foreground">
              {[tenant.price_tier, tenant.tags.join(", ")]
                .filter(Boolean)
                .join(" · ")}
            </span>
            <span className="text-[13px] text-muted-foreground">·</span>
            <span
              className="text-[13px] font-semibold"
              style={{ color: tenant.open_now ? "#5cc98a" : "#8a8378" }}
            >
              {tenant.open_now ? "Abierto ahora" : "Cerrado"}
            </span>
          </div>
          {tenant.address && (
            <p className="mt-2 text-[13px] text-muted-foreground">
              {tenant.address}
            </p>
          )}
        </div>
        <a
          href="#reservar"
          className="whitespace-nowrap rounded-[10px] bg-primary px-[30px] py-3.5 text-[15px] font-bold text-primary-foreground"
        >
          Reservar cita
        </a>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-[22px] px-8 pt-8 sm:px-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex min-w-0 flex-col gap-[22px]">
          {/* SERVICES */}
          <div className="rounded-2xl border border-border bg-card p-[22px]">
            <h2 className="mb-4 text-base font-bold">Servicios y precios</h2>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay servicios publicados.
              </p>
            ) : (
              <div className="flex flex-col">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border-b border-[#262019] py-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-semibold">{s.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {s.duration_minutes} min
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      {Number(s.price).toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BARBERS */}
          <div className="rounded-2xl border border-border bg-card p-[22px]">
            <h2 className="mb-4 text-base font-bold">Barberos disponibles</h2>
            {barbers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay barberos publicados.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {barbers.map((b, i) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-[10px] border border-[#262019] bg-[#161310] p-3"
                  >
                    <span
                      className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#141210]"
                      style={{
                        backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
                      }}
                    >
                      {initials(b.full_name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">
                        {b.full_name}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {b.specialty || "Barbero"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* REVIEWS */}
          <div className="rounded-2xl border border-border bg-card p-[22px]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Reseñas de clientes</h2>
              {topReviews.length > 0 && (
                <a href="#reservar" className="text-[13px] font-bold text-primary">
                  Ver todas →
                </a>
              )}
            </div>
            {topReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay reseñas para {tenant.name}.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {topReviews.map((r, i) => (
                  <div
                    key={i}
                    className="border-b border-[#262019] pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#3a3530] text-xs font-bold">
                          {initials(r.customer_name)}
                        </span>
                        <span className="text-[13px] font-semibold">
                          {r.customer_name}
                        </span>
                      </div>
                      <StarRow rating={r.rating} />
                    </div>
                    {r.comment && (
                      <p className="text-[13px] leading-relaxed text-[#c4bdb1]">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR: HOURS + LOCATION */}
        <div className="flex min-w-0 flex-col gap-[22px]">
          <div className="rounded-2xl border border-border bg-card p-[22px]">
            <h2 className="mb-3.5 text-base font-bold">Horario</h2>
            <div className="flex flex-col gap-0.5">
              {hours.map((h) => (
                <div
                  key={h.label}
                  className="flex items-center justify-between border-b border-[#262019] py-2 last:border-b-0"
                  style={{ color: h.is_today ? "#c9a227" : "#c4bdb1" }}
                >
                  <span
                    className="text-[13px]"
                    style={{ fontWeight: h.is_today ? 700 : 500 }}
                  >
                    {h.label}
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ fontWeight: h.is_today ? 700 : 500 }}
                  >
                    {h.range}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-[22px]">
            <h2 className="mb-3.5 text-base font-bold">Ubicación</h2>
            <div className="relative mb-3 h-[140px] rounded-[10px] bg-[repeating-linear-gradient(135deg,#241f19,#241f19_10px,#2b241c_10px,#2b241c_20px)]">
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-wide text-[#7a7263]">
                MAPA
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-[#c4bdb1]">
              {tenant.address || "Dirección no publicada todavía."}
            </p>
          </div>
        </div>
      </div>

      {/* STICKY RESERVE BAR */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-sidebar-border bg-sidebar px-8 py-4 sm:px-12">
        <div>
          <p className="text-sm font-bold">{tenant.name}</p>
          <p className="text-xs text-muted-foreground">
            {minPrice !== null
              ? `Desde ${minPrice.toFixed(2)}€ · Reserva en línea`
              : "Reserva en línea"}
          </p>
        </div>
        <a
          href="#reservar"
          className="whitespace-nowrap rounded-[10px] bg-primary px-[34px] py-3.5 text-[15px] font-bold text-primary-foreground"
        >
          Reservar cita
        </a>
      </div>
    </div>
  );
}
