import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewInventoryItemButton } from "@/components/inventory/new-item-button";
import { InventoryItemRowActions } from "@/components/inventory/item-row-actions";

export const metadata: Metadata = {
  title: "Inventario — BarberOS",
};

function levelOf(item: {
  stock: number;
  low_stock_threshold: number;
  medium_stock_threshold: number;
}) {
  if (item.stock <= item.low_stock_threshold) return "low" as const;
  if (item.stock <= item.medium_stock_threshold) return "mid" as const;
  return "ok" as const;
}

const levelColor: Record<"low" | "mid" | "ok", string> = {
  low: "#e05c5c",
  mid: "#e0b23c",
  ok: "#5cc98a",
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) redirect("/onboarding");

  const { data: items } = await supabase
    .from("inventory_items")
    .select(
      "id, name, stock, unit, low_stock_threshold, medium_stock_threshold"
    )
    .eq("tenant_id", profile.tenant_id)
    .order("name");

  const lowStockCount = (items ?? []).filter(
    (i) => levelOf(i) === "low"
  ).length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items?.length ?? 0} productos
            {lowStockCount > 0 && (
              <span className="ml-2 rounded-full bg-[#e05c5c]/12 px-2 py-0.5 text-xs font-bold text-[#e05c5c]">
                {lowStockCount} bajo{lowStockCount === 1 ? "" : "s"}
              </span>
            )}
          </p>
        </div>
        <NewInventoryItemButton />
      </div>

      {!items || items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card py-12 text-center text-muted-foreground">
          No hay productos todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const level = levelOf(item);
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: levelColor[level] }}
                    />
                    {item.stock} {item.unit}
                  </p>
                </div>
                <InventoryItemRowActions
                  defaults={{
                    id: item.id,
                    name: item.name,
                    stock: item.stock,
                    unit: item.unit,
                    lowStockThreshold: item.low_stock_threshold,
                    mediumStockThreshold: item.medium_stock_threshold,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
