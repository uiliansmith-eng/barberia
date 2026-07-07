"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
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

export function DirectoryLeadForm() {
  const [state, action, pending] = useActionState<
    DirectoryLeadActionState,
    FormData
  >(submitDirectoryLead, null);

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
