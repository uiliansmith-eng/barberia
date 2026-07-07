"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { serviceSchema } from "@/lib/validations/service";

export type ServiceActionState = {
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

export async function createService(
  _prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    status: formData.get("status") ?? "active",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase.from("services").insert({
    tenant_id: tenantId,
    name: parsed.data.name,
    duration_minutes: parsed.data.durationMinutes,
    price: parsed.data.price,
    status: parsed.data.status,
  });

  if (error) {
    return { error: "No se pudo crear el servicio. Inténtalo de nuevo." };
  }

  revalidatePath("/servicios");
  return null;
}

export async function updateService(
  serviceId: string,
  _prevState: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
    status: formData.get("status") ?? "active",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase
    .from("services")
    .update({
      name: parsed.data.name,
      duration_minutes: parsed.data.durationMinutes,
      price: parsed.data.price,
      status: parsed.data.status,
    })
    .eq("id", serviceId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: "No se pudo actualizar el servicio. Inténtalo de nuevo." };
  }

  revalidatePath("/servicios");
  return null;
}

export async function toggleServiceStatus(
  serviceId: string,
  currentStatus: string
) {
  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return;

  await supabase
    .from("services")
    .update({ status: currentStatus === "active" ? "inactive" : "active" })
    .eq("id", serviceId)
    .eq("tenant_id", tenantId);

  revalidatePath("/servicios");
}

export type DeleteServiceResult = { error?: string };

export async function deleteService(
  serviceId: string
): Promise<DeleteServiceResult> {
  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("tenant_id", tenantId);

  if (error) {
    return {
      error:
        "No se puede eliminar: este servicio tiene citas asociadas. Desactívalo en su lugar.",
    };
  }

  revalidatePath("/servicios");
  return {};
}
