"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    forgotPassword,
    null
  );

  if (state?.success) {
    return (
      <div className="text-center">
        <p className="text-sm text-foreground/85">{state.success}</p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={action}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@barberia.com"
            required
          />
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Enviando..." : "Enviar enlace de recuperación"}
        </Button>
      </FieldGroup>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
