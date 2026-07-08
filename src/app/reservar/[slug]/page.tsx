import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingPortal } from "@/components/booking/booking-portal";
import { ShopProfile } from "@/components/booking/shop-profile";

type BookingInfo = {
  tenant: {
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
  services: { id: string; name: string; duration_minutes: number; price: number }[];
  barbers: { id: string; full_name: string; specialty: string | null }[];
  hours: { label: string; is_today: boolean; range: string }[];
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const DAY_TO_SCHEMA: Record<string, string> = {
  Lunes: "Monday",
  Martes: "Tuesday",
  Miércoles: "Wednesday",
  Jueves: "Thursday",
  Viernes: "Friday",
  Sábado: "Saturday",
  Domingo: "Sunday",
};

function buildJsonLd(info: BookingInfo) {
  const { tenant } = info;

  const openingHoursSpecification = info.hours
    .filter((h) => h.range !== "Cerrado")
    .map((h) => {
      const [opens, closes] = h.range.split(" – ");
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_TO_SCHEMA[h.label] ?? h.label,
        opens,
        closes,
      };
    });

  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: tenant.name,
    url: `${siteUrl}/reservar/${tenant.slug}`,
    ...(tenant.address && {
      address: { "@type": "PostalAddress", streetAddress: tenant.address },
    }),
    ...(tenant.price_tier && { priceRange: tenant.price_tier }),
    ...(tenant.reviews_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: tenant.avg_rating,
        reviewCount: tenant.reviews_count,
      },
    }),
    ...(openingHoursSpecification.length > 0 && { openingHoursSpecification }),
    ...(info.services.length > 0 && {
      makesOffer: info.services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name },
        price: s.price,
        priceCurrency: "EUR",
      })),
    }),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_booking_info", { p_slug: slug });
  const info = data as unknown as BookingInfo | null;

  if (!info) {
    return { title: "Reservar cita" };
  }

  const { tenant } = info;
  const ratingText =
    tenant.reviews_count > 0
      ? `${tenant.avg_rating}★ (${tenant.reviews_count} reseñas)`
      : null;
  const description = [
    `Reserva tu cita online en ${tenant.name}`,
    tenant.tags.length > 0 ? tenant.tags.join(", ") : null,
    ratingText,
    tenant.address,
  ]
    .filter(Boolean)
    .join(" · ");

  const title = `${tenant.name} — Reserva tu cita`;

  return {
    title,
    description,
    alternates: { canonical: `/reservar/${tenant.slug}` },
    openGraph: {
      title,
      description,
      url: `/reservar/${tenant.slug}`,
      images: [`/reservar/${tenant.slug}/opengraph-image`],
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("public_booking_info", {
    p_slug: slug,
  });

  if (error || !data) notFound();

  const info = data as unknown as BookingInfo;
  const jsonLd = buildJsonLd(info);

  return (
    <div className="app-theme min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShopProfile
        tenant={info.tenant}
        services={info.services}
        barbers={info.barbers}
        hours={info.hours}
      />

      <div id="reservar" className="scroll-mt-6 border-t border-border">
        <BookingPortal
          tenant={info.tenant}
          services={info.services}
          barbers={info.barbers}
        />
      </div>
    </div>
  );
}
