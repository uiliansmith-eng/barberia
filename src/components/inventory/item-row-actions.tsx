"use client";

import { useActionState, useState } from "react";
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
} from "@/components/ui/alert-dialog";
import {
  InventorySheet,
  type InventoryFormDefaults,
} from "@/components/inventory/inventory-sheet";
import {
  deleteInventoryItem,
  type DeleteInventoryItemResult,
} from "@/app/(app)/inventario/actions";

export function InventoryItemRowActions({
  defaults,
}: {
  defaults: InventoryFormDefaults;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteState, deleteAction, deletePending] = useActionState<
    DeleteInventoryItemResult,
    void
  >(async () => deleteInventoryItem(defaults.id!), {});

  return (
    <div className="flex items-center justify-end gap-1">
      <InventorySheet
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
              Esta acción no se puede deshacer.
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
