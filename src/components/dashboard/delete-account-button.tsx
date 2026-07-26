"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMyAccount } from "@/app/(app)/cuenta/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteAccountButton({ isOwner }: { isOwner: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteMyAccount();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="h-3.5 w-3.5" />
        Eliminar cuenta
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isOwner ? "Eliminar tu cuenta y tu negocio" : "Eliminar tu cuenta"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isOwner
              ? "Esto borra permanentemente tu barbería: citas, clientes, barberos, servicios, inventario y reseñas. El resto del personal perderá el acceso. Cancela también tu suscripción activa. No se puede deshacer."
              : "Esto borra permanentemente tu cuenta y tu acceso a esta barbería. No se puede deshacer."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? "Eliminando..." : "Sí, eliminar definitivamente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
