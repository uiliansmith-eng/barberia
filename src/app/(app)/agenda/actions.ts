"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { appointmentSchema } from "@/lib/validations/appointment";
import { combineDateAndTime } from "@/lib/agenda/time";

export type AppointmentActionState = {
  error?: string;
} | null;

async function getTenantId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, tenantId: null, locationId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, location_id")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    tenantId: profile?.tenant_id ?? null,
    locationId: profile?.location_id ?? null,
  };
}

export async function createAppointment(
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const parsed = appointmentSchema.safeParse({
    customerId: formData.get("customerId"),
    barberId: formData.get("barberId"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId, locationId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes, price")
    .eq("id", parsed.data.serviceId)
    .single();

  if (!service) return { error: "Servicio no válido" };

  const startsAt = combineDateAndTime(parsed.data.date, parsed.data.time);
  const endsAt = new Date(
    startsAt.getTime() + service.duration_minutes * 60_000
  );

  const { error } = await supabase.from("appointments").insert({
    tenant_id: tenantId,
    location_id: locationId,
    customer_id: parsed.data.customerId,
    barber_id: parsed.data.barberId,
    service_id: parsed.data.serviceId,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    price: service.price,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: "No se pudo crear la cita. Inténtalo de nuevo." };
  }

  revalidatePath("/agenda");
  return null;
}

export async function updateAppointment(
  appointmentId: string,
  _prevState: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const parsed = appointmentSchema.safeParse({
    customerId: formData.get("customerId"),
    barberId: formData.get("barberId"),
    serviceId: formData.get("serviceId"),
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes, price")
    .eq("id", parsed.data.serviceId)
    .single();

  if (!service) return { error: "Servicio no válido" };

  const startsAt = combineDateAndTime(parsed.data.date, parsed.data.time);
  const endsAt = new Date(
    startsAt.getTime() + service.duration_minutes * 60_000
  );

  const { error } = await supabase
    .from("appointments")
    .update({
      customer_id: parsed.data.customerId,
      barber_id: parsed.data.barberId,
      service_id: parsed.data.serviceId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      price: service.price,
      notes: parsed.data.notes || null,
      status: "scheduled",
    })
    .eq("id", appointmentId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: "No se pudo actualizar la cita. Inténtalo de nuevo." };
  }

  revalidatePath("/agenda");
  return null;
}

export async function cancelAppointment(appointmentId: string) {
  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return;

  await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId)
    .eq("tenant_id", tenantId);

  revalidatePath("/agenda");
}
