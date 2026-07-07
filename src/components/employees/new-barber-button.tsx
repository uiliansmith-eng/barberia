"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { BarberSheet } from "@/components/employees/barber-sheet";

export function NewBarberButton() {
  return (
    <BarberSheet
      trigger={
        <SheetTrigger render={<Button />}>
          <Plus className="h-4 w-4" />
          Nuevo barbero
        </SheetTrigger>
      }
    />
  );
}
