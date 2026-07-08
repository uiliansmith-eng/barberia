"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  createInventoryItem,
  updateInventoryItem,
  type InventoryActionState,
} from "@/app/(app)/inventario/actions";

export type InventoryFormDefaults = {
  id?: string;
  name?: string;
  stock?: number;
  unit?: string;
  lowStockThreshold?: number;
  mediumStockThreshold?: number;
};

export function InventorySheet({
  trigger,
  defaults,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  trigger?: React.ReactNode;
  defaults?: InventoryFormDefaults;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const isEdit = !!defaults?.id;
  const action = isEdit
    ? updateInventoryItem.bind(null, defaults!.id!)
    : createInventoryItem;

  const [state, formAction, pending] = useActionState<
    InventoryActionState,
    FormData
  >(action, null);

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state, setOpen]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Actualiza el stock y los umbrales del producto."
              : "Completa los datos para añadir un producto al inventario."}
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  defaultValue={defaults?.name}
                  placeholder="Ej. Cera moldeadora"
                  required
                  autoFocus
                />
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="stock">Stock</FieldLabel>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={defaults?.stock ?? 0}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="unit">Unidad</FieldLabel>
                  <Input
                    id="unit"
                    name="unit"
                    defaultValue={defaults?.unit ?? "uds"}
                    required
                  />
                </Field>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="lowStockThreshold">
                    Umbral stock bajo
                  </FieldLabel>
                  <Input
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={defaults?.lowStockThreshold ?? 5}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="mediumStockThreshold">
                    Umbral stock medio
                  </FieldLabel>
                  <Input
                    id="mediumStockThreshold"
                    name="mediumStockThreshold"
                    type="number"
                    min={0}
                    step={1}
                    defaultValue={defaults?.mediumStockThreshold ?? 15}
                    required
                  />
                </Field>
              </Field>

              {state?.error && <FieldError>{state.error}</FieldError>}
            </FieldGroup>
          </div>

          <SheetFooter>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear producto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
