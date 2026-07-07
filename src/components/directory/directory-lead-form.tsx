"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import {
  submitDirectoryLead,
  type DirectoryLeadActionState,
} from "@/app/anadir-barberia/actions";
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

const sourceOptions = [
  { value: "owner", label: "Soy dueño de la barbería" },
  { value: "team", label: "Trabajo para BarberOS" },
];

let nextRowId = 0;

export function DirectoryLeadForm() {
  const [state, action, pending] = useActionState<
    DirectoryLeadActionState,
    FormData
  >(submitDirectoryLead, null);

  const [rows, setRows] = useState(() => [{ id: nextRowId++ }]);

  if (state?.success) {
    return (
      <div className="glass-strong flex flex-col items-center gap-2 rounded-3xl p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="text-lg font-semibold">¡Solicitud enviada!</h2>
        <p className="text-sm text-muted-foreground">
          Nos pondremos en contacto contigo en breve para activar tu barbería
          en el directorio.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="glass rounded-3xl p-8">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="businessName">Nombre de la barbería</FieldLabel>
          <Input
            id="businessName"
            name="businessName"
            placeholder="Ej. Barbería El Corte"
            required
            autoFocus
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="contactName">Tu nombre</FieldLabel>
          <Input id="contactName" name="contactName" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
          <Input id="phone" name="phone" type="tel" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required />
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Dirección</FieldLabel>
          <Input
            id="address"
            name="address"
            placeholder="Ej. Calle Mayor 12"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="city">Ciudad</FieldLabel>
          <Input id="city" name="city" placeholder="Ej. Madrid" />
          <FieldDescription>Opcional.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="source">¿Quién eres?</FieldLabel>
          <Select
            name="source"
            defaultValue="owner"
            items={sourceOptions}
            required
          >
            <SelectTrigger id="source" className="w-full">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Servicios y precios</FieldLabel>
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div key={row.id} className="flex items-center gap-2">
                <Input
                  name="serviceName"
                  placeholder="Ej. Corte de pelo"
                  className="flex-1"
                />
                <Input
                  name="servicePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Precio €"
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() =>
                    setRows((r) => r.filter((_, idx) => idx !== i))
                  }
                  disabled={rows.length === 1}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                  aria-label="Quitar servicio"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setRows((r) => [...r, { id: nextRowId++ }])}
            className="mt-1 flex items-center gap-1.5 self-start text-sm text-primary hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Añadir servicio
          </button>
          <FieldDescription>Opcional, pero nos ayuda a activarte más rápido.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">Comentarios</FieldLabel>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Cuéntanos algo sobre la barbería..."
          />
          <FieldDescription>Opcional.</FieldDescription>
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando..." : "Enviar solicitud"}
        </Button>
      </FieldGroup>
    </form>
  );
}
