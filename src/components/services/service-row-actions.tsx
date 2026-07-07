"use client";

import { useActionState, useState } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import {
  ServiceSheet,
  type ServiceFormDefaults,
} from "@/components/services/service-sheet";
import {
  toggleServiceStatus,
  deleteService,
  type DeleteServiceResult,
} from "@/app/(app)/servicios/actions";

export function ServiceRowActions({
  defaults,
}: {
  defaults: ServiceFormDefaults;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState<
    DeleteServiceResult,
    void
  >(async () => deleteService(defaults.id!), {});

  return (
    <div className="flex items-center justify-end gap-1">
      <form action={toggleServiceStatus.bind(null, defaults.id!, defaults.status!)}>
        <Button
          type="submit"
          variant="ghost"
          size="icon-xs"
          aria-label={defaults.status === "active" ? "Desactivar" : "Activar"}
        >
          <Power className="h-3.5 w-3.5" />
        </Button>
      </form>

      <ServiceSheet
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
            <AlertDialogTitle>¿Eliminar {defaults.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Si el servicio tiene citas
              asociadas, no se podrá eliminar: desactívalo en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteState?.error && (
            <p className="text-sm text-destructive">{deleteState.error}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deletePending}
              onClick={() => deleteAction()}
            >
              {deletePending ? "Eliminando..." : "Eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
