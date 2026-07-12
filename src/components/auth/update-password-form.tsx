"use client";

import { useActionState } from "react";
import { updatePassword, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
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
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            required
          />
          <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
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
