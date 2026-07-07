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
  CustomerSheet,
  type CustomerFormDefaults,
} from "@/components/customers/customer-sheet";
import { deleteCustomer } from "@/app/(app)/clientes/actions";

export function CustomerRowActions({
  defaults,
}: {
  defaults: CustomerFormDefaults;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <CustomerSheet
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
              Se eliminará también su historial de citas. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={deleteCustomer.bind(null, defaults.id!)}>
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
