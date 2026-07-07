import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingPortal } from "@/components/booking/booking-portal";

type BookingInfo = {
  tenant: { id: string; name: string; slug: string; logo_url: string | null };
  services: { id: string; name: string; duration_minutes: number; price: number }[];
  barbers: { id: string; full_name: string; specialty: string | null }[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_booking_info", { p_slug: slug });
  const info = data as BookingInfo | null;

  return {
    title: info ? `Reservar en ${info.tenant.name}` : "Reservar cita",
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
    <div className="dark bg-mesh-dark bg-background text-foreground min-h-screen">
      <BookingPortal
        tenant={info.tenant}
        services={info.services}
        barbers={info.barbers}
      />
    </div>
  );
}
