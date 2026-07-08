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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_booking_info", { p_slug: slug });
  const info = data as unknown as BookingInfo | null;

  return {
    title: info ? `${info.tenant.name} — BarberOS` : "Reservar cita",
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

  return (
    <div className="app-theme min-h-screen bg-background text-foreground">
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
