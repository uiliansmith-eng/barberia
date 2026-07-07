"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  BarberSheet,
  type BarberFormDefaults,
} from "@/components/employees/barber-sheet";
import { deleteBarber } from "@/app/(app)/empleados/actions";

export function BarberRowActions({
  defaults,
}: {
  defaults: BarberFormDefaults;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <BarberSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        defaults={defaults}
        trigger={
          <SheetTrigger
            render={<Button variant="ghost" size="icon-xs" aria-label="Editar" />}
          >
            <Pencil className="h-3.5 w-3.5" />
          </SheetTrigger>
        }
      />

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="ghost" size="icon-xs" aria-label="Eliminar" />
          }
        >
          <Trash2 className="h-3.5 w-3.5" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {defaults.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará también su horario y su historial de citas. Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={deleteBarber.bind(null, defaults.id!)}>
              <AlertDialogAction type="submit" variant="destructive">
                Eliminar
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
