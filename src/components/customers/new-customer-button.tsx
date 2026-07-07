"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { CustomerSheet } from "@/components/customers/customer-sheet";

export function NewCustomerButton() {
  return (
    <CustomerSheet
      trigger={
        <SheetTrigger render={<Button />}>
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </SheetTrigger>
      }
    />
  );
}
