"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { InventorySheet } from "@/components/inventory/inventory-sheet";

export function NewInventoryItemButton() {
  return (
    <InventorySheet
      trigger={
        <SheetTrigger render={<Button />}>
          <Plus className="h-4 w-4" />
          Nuevo producto
        </SheetTrigger>
      }
    />
  );
}
