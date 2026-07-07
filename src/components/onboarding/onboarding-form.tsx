"use client";

import { useActionState } from "react";
import {
  completeOnboarding,
  type OnboardingActionState,
} from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<
    OnboardingActionState,
    FormData
  >(completeOnboarding, null);

  return (
    <form action={action}>
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
          <FieldLabel htmlFor="phone">Teléfono</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="Ej. +34 600 000 000"
          />
          <FieldDescription>Opcional.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="address">Dirección</FieldLabel>
          <Input
            id="address"
            name="address"
            placeholder="Ej. Calle Mayor 12, Madrid"
          />
          <FieldDescription>
            Esta será tu sucursal principal. Podrás añadir más adelante.
          </FieldDescription>
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creando barbería..." : "Crear mi barbería"}
        </Button>
      </FieldGroup>
    </form>
  );
}
