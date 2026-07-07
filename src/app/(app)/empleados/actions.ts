"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { barberSchema } from "@/lib/validations/barber";

export type BarberActionState = {
  error?: string;
} | null;

async function getTenantId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, tenantId: null as string | null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  return { supabase, tenantId: profile?.tenant_id ?? null };
}

export async function createBarber(
  _prevState: BarberActionState,
  formData: FormData
): Promise<BarberActionState> {
  const parsed = barberSchema.safeParse({
    fullName: formData.get("fullName"),
    specialty: formData.get("specialty"),
    commissionPct: formData.get("commissionPct"),
    status: formData.get("status") ?? "active",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase.from("barbers").insert({
    tenant_id: tenantId,
    full_name: parsed.data.fullName,
    specialty: parsed.data.specialty || null,
    commission_pct: parsed.data.commissionPct,
    status: parsed.data.status,
  });

  if (error) {
    return { error: "No se pudo crear el barbero. Inténtalo de nuevo." };
  }

  revalidatePath("/empleados");
  return null;
}

export async function updateBarber(
  barberId: string,
  _prevState: BarberActionState,
  formData: FormData
): Promise<BarberActionState> {
  const parsed = barberSchema.safeParse({
    fullName: formData.get("fullName"),
    specialty: formData.get("specialty"),
    commissionPct: formData.get("commissionPct"),
    status: formData.get("status") ?? "active",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase
    .from("barbers")
    .update({
      full_name: parsed.data.fullName,
      specialty: parsed.data.specialty || null,
      commission_pct: parsed.data.commissionPct,
      status: parsed.data.status,
    })
    .eq("id", barberId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: "No se pudo actualizar el barbero. Inténtalo de nuevo." };
  }

  revalidatePath("/empleados");
  revalidatePath(`/empleados/${barberId}`);
  return null;
}

export async function deleteBarber(barberId: string) {
  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return;

  await supabase
    .from("barbers")
    .delete()
    .eq("id", barberId)
    .eq("tenant_id", tenantId);

  revalidatePath("/empleados");
  redirect("/empleados");
}

export type ScheduleActionState = {
  error?: string;
} | null;

export async function saveSchedule(
  barberId: string,
  _prevState: ScheduleActionState,
  formData: FormData
): Promise<ScheduleActionState> {
  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const rows: { tenant_id: string; barber_id: string; weekday: number; start_time: string; end_time: string }[] = [];

  for (let weekday = 0; weekday < 7; weekday++) {
    const enabled = formData.get(`day_${weekday}_enabled`) === "on";
    if (!enabled) continue;

    const startTime = String(formData.get(`day_${weekday}_start`) ?? "");
    const endTime = String(formData.get(`day_${weekday}_end`) ?? "");

    if (!startTime || !endTime) continue;
    if (startTime >= endTime) {
      return { error: "La hora de inicio debe ser anterior a la de cierre" };
    }

    rows.push({
      tenant_id: tenantId,
      barber_id: barberId,
      weekday,
      start_time: startTime,
      end_time: endTime,
    });
  }

  const { error: deleteError } = await supabase
    .from("schedules")
    .delete()
    .eq("barber_id", barberId)
    .eq("tenant_id", tenantId);

  if (deleteError) {
    return { error: "No se pudo guardar el horario. Inténtalo de nuevo." };
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("schedules").insert(rows);
    if (insertError) {
      return { error: "No se pudo guardar el horario. Inténtalo de nuevo." };
    }
  }

  revalidatePath(`/empleados/${barberId}`);
  return null;
}
