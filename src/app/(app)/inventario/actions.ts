"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { inventoryItemSchema } from "@/lib/validations/inventory";

export type InventoryActionState = {
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

function parseForm(formData: FormData) {
  return inventoryItemSchema.safeParse({
    name: formData.get("name"),
    stock: formData.get("stock"),
    unit: formData.get("unit") ?? "uds",
    lowStockThreshold: formData.get("lowStockThreshold"),
    mediumStockThreshold: formData.get("mediumStockThreshold"),
  });
}

export async function createInventoryItem(
  _prevState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase.from("inventory_items").insert({
    tenant_id: tenantId,
    name: parsed.data.name,
    stock: parsed.data.stock,
    unit: parsed.data.unit,
    low_stock_threshold: parsed.data.lowStockThreshold,
    medium_stock_threshold: parsed.data.mediumStockThreshold,
  });

  if (error) {
    return { error: "No se pudo crear el producto. Inténtalo de nuevo." };
  }

  revalidatePath("/inventario");
  revalidatePath("/dashboard");
  return null;
}

export async function updateInventoryItem(
  itemId: string,
  _prevState: InventoryActionState,
  formData: FormData
): Promise<InventoryActionState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase
    .from("inventory_items")
    .update({
      name: parsed.data.name,
      stock: parsed.data.stock,
      unit: parsed.data.unit,
      low_stock_threshold: parsed.data.lowStockThreshold,
      medium_stock_threshold: parsed.data.mediumStockThreshold,
    })
    .eq("id", itemId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: "No se pudo actualizar el producto. Inténtalo de nuevo." };
  }

  revalidatePath("/inventario");
  revalidatePath("/dashboard");
  return null;
}

export type DeleteInventoryItemResult = { error?: string };

export async function deleteInventoryItem(
  itemId: string
): Promise<DeleteInventoryItemResult> {
  const { supabase, tenantId } = await getTenantId();
  if (!tenantId) return { error: "No se encontró tu barbería" };

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", itemId)
    .eq("tenant_id", tenantId);

  if (error) {
    return { error: "No se pudo eliminar el producto. Inténtalo de nuevo." };
  }

  revalidatePath("/inventario");
  revalidatePath("/dashboard");
  return {};
}
