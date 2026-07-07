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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  createService,
  updateService,
  type ServiceActionState,
} from "@/app/(app)/servicios/actions";

export type ServiceFormDefaults = {
  id?: string;
  name?: string;
  durationMinutes?: number;
  price?: number;
  status?: "active" | "inactive";
};

const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

export function ServiceSheet({
  trigger,
  defaults,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  trigger?: React.ReactNode;
  defaults?: ServiceFormDefaults;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const isEdit = !!defaults?.id;
  const action = isEdit
    ? updateService.bind(null, defaults!.id!)
    : createService;

  const [state, formAction, pending] = useActionState<
    ServiceActionState,
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
          <SheetTitle>{isEdit ? "Editar servicio" : "Nuevo servicio"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Actualiza los datos del servicio."
              : "Completa los datos para añadir un servicio."}
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
                  placeholder="Ej. Corte + Barba"
                  required
                  autoFocus
                />
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="durationMinutes">Duración (min)</FieldLabel>
                  <Input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    min={5}
                    max={480}
                    step={5}
                    defaultValue={defaults?.durationMinutes ?? 30}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="price">Precio (€)</FieldLabel>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min={0}
                    step={0.5}
                    defaultValue={defaults?.price ?? 0}
                    required
                  />
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="status">Estado</FieldLabel>
                <Select
                  name="status"
                  defaultValue={defaults?.status ?? "active"}
                  items={statusOptions}
                  required
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  : "Crear servicio"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
