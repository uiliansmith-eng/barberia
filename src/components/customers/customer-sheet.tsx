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
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  createCustomer,
  updateCustomer,
  type CustomerActionState,
} from "@/app/(app)/clientes/actions";

export type CustomerFormDefaults = {
  id?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  notes?: string;
};

export function CustomerSheet({
  trigger,
  defaults,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  trigger?: React.ReactNode;
  defaults?: CustomerFormDefaults;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const isEdit = !!defaults?.id;
  const action = isEdit
    ? updateCustomer.bind(null, defaults!.id!)
    : createCustomer;

  const [state, formAction, pending] = useActionState<
    CustomerActionState,
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
          <SheetTitle>{isEdit ? "Editar cliente" : "Nuevo cliente"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Actualiza los datos del cliente."
              : "Completa los datos para añadir un cliente."}
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
                  placeholder="Ej. Ana García"
                  required
                  autoFocus
                />
              </Field>

              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={defaults?.phone}
                    placeholder="Ej. 600 111 222"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={defaults?.email}
                    placeholder="Opcional"
                  />
                </Field>
              </Field>

              <Field>
                <FieldLabel htmlFor="birthDate">Fecha de nacimiento</FieldLabel>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  defaultValue={defaults?.birthDate}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="notes">Notas</FieldLabel>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Opcional"
                  defaultValue={defaults?.notes}
                  rows={3}
                />
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
                  : "Crear cliente"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
