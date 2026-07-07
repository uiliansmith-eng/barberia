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
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import {
  createBarber,
  updateBarber,
  type BarberActionState,
} from "@/app/(app)/empleados/actions";

export type BarberFormDefaults = {
  id?: string;
  fullName?: string;
  specialty?: string;
  commissionPct?: number;
  status?: "active" | "inactive";
};

const statusOptions = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
];

export function BarberSheet({
  trigger,
  defaults,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  trigger?: React.ReactNode;
  defaults?: BarberFormDefaults;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const isEdit = !!defaults?.id;
  const action = isEdit
    ? updateBarber.bind(null, defaults!.id!)
    : createBarber;

  const [state, formAction, pending] = useActionState<
    BarberActionState,
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
          <SheetTitle>{isEdit ? "Editar barbero" : "Nuevo barbero"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Actualiza los datos del barbero."
              : "Completa los datos para añadir un barbero."}
          </SheetDescription>
        </SheetHeader>

        <form action={formAction} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={defaults?.fullName}
                  placeholder="Ej. Carlos Ruiz"
                  required
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="specialty">Especialidad</FieldLabel>
                <Input
                  id="specialty"
                  name="specialty"
                  defaultValue={defaults?.specialty}
                  placeholder="Ej. Fade, barba clásica"
                />
                <FieldDescription>Opcional.</FieldDescription>
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="commissionPct">Comisión (%)</FieldLabel>
                  <Input
                    id="commissionPct"
                    name="commissionPct"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={defaults?.commissionPct ?? 0}
                    required
                  />
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
                  : "Crear barbero"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
