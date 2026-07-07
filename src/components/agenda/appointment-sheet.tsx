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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  createAppointment,
  updateAppointment,
  type AppointmentActionState,
} from "@/app/(app)/agenda/actions";
import { toDateKey } from "@/lib/agenda/time";

type Option = { id: string; label: string };

export type AppointmentFormDefaults = {
  id?: string;
  customerId?: string;
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
  notes?: string;
};

export function AppointmentSheet({
  trigger,
  customers,
  barbers,
  services,
  defaults,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  trigger?: React.ReactNode;
  customers: Option[];
  barbers: Option[];
  services: { id: string; label: string; duration: number; price: number }[];
  defaults?: AppointmentFormDefaults;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const isEdit = !!defaults?.id;
  const action = isEdit
    ? updateAppointment.bind(null, defaults!.id!)
    : createAppointment;

  const [state, formAction, pending] = useActionState<
    AppointmentActionState,
    FormData
  >(action, null);

  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state, setOpen]);

  const canSubmit = customers.length > 0 && barbers.length > 0 && services.length > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? "Editar cita" : "Nueva cita"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Modifica los datos o reagenda la cita."
              : "Completa los datos para reservar una cita."}
          </SheetDescription>
        </SheetHeader>

        {!canSubmit ? (
          <div className="px-4 text-sm text-muted-foreground">
            Necesitas al menos un cliente, un barbero y un servicio activos
            para crear citas.
          </div>
        ) : (
          <form action={formAction} className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="customerId">Cliente</FieldLabel>
                  <Select
                    name="customerId"
                    defaultValue={defaults?.customerId}
                    items={customers.map((c) => ({ value: c.id, label: c.label }))}
                    required
                  >
                    <SelectTrigger id="customerId" className="w-full">
                      <SelectValue placeholder="Selecciona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="barberId">Barbero</FieldLabel>
                  <Select
                    name="barberId"
                    defaultValue={defaults?.barberId}
                    items={barbers.map((b) => ({ value: b.id, label: b.label }))}
                    required
                  >
                    <SelectTrigger id="barberId" className="w-full">
                      <SelectValue placeholder="Selecciona un barbero" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbers.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="serviceId">Servicio</FieldLabel>
                  <Select
                    name="serviceId"
                    defaultValue={defaults?.serviceId}
                    items={services.map((s) => ({
                      value: s.id,
                      label: `${s.label} · ${s.duration} min · ${s.price}€`,
                    }))}
                    required
                  >
                    <SelectTrigger id="serviceId" className="w-full">
                      <SelectValue placeholder="Selecciona un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label} · {s.duration} min · {s.price}€
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="responsive">
                  <Field>
                    <FieldLabel htmlFor="date">Fecha</FieldLabel>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      defaultValue={defaults?.date ?? toDateKey(new Date())}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="time">Hora</FieldLabel>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      defaultValue={defaults?.time ?? "10:00"}
                      required
                    />
                  </Field>
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
                    : "Crear cita"}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
