"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { ServiceSheet } from "@/components/services/service-sheet";

export function NewServiceButton() {
  return (
    <ServiceSheet
      trigger={
        <SheetTrigger render={<Button />}>
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </SheetTrigger>
      }
    />
  );
}
