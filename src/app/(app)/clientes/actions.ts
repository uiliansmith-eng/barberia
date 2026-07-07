"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations/customer";

export type CustomerActionState = {
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

export async function createCustomer(
  _prevState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const parsed = customerSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    birthDate: formData.get("birthDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase.from("customers").insert({
    tenant_id: tenantId,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    birth_date: parsed.data.birthDate || null,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: "No se pudo crear el cliente. Inténtalo de nuevo." };
  }

  revalidatePath("/clientes");
  return null;
}

export async function updateCustomer(
  customerId: string,
  _prevState: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const parsed = customerSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    birthDate: formData.get("birthDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase
    .from("customers")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      birth_date: parsed.data.birthDate || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", customerId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: "No se pudo actualizar el cliente. Inténtalo de nuevo." };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${customerId}`);
  return null;
}

export async function deleteCustomer(customerId: string) {
  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return;

  await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .eq("tenant_id", tenantId);

  revalidatePath("/clientes");
  redirect("/clientes");
}
