"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import { AppointmentSheet } from "@/components/agenda/appointment-sheet";

type Option = { id: string; label: string };

export function NewAppointmentButton({
  customers,
  barbers,
  services,
  date,
}: {
  customers: Option[];
  barbers: Option[];
  services: { id: string; label: string; duration: number; price: number }[];
  date: string;
}) {
  return (
    <AppointmentSheet
      customers={customers}
      barbers={barbers}
      services={services}
      defaults={{ date, time: "10:00" }}
      trigger={
        <SheetTrigger render={<Button />}>
          <Plus className="h-4 w-4" />
          Nueva cita
        </SheetTrigger>
      }
    />
  );
}
