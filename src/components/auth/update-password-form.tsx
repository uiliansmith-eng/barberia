"use client";

import { useActionState } from "react";
import { updatePassword, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    updatePassword,
    null
  );

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Actualizando..." : "Actualizar contraseña"}
        </Button>
      </FieldGroup>
    </form>
  );
}
