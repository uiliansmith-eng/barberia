"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    signup,
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
          <FieldLabel htmlFor="fullName">Nombre completo</FieldLabel>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ej. Carlos Rodríguez"
            required
          />
        </Field>

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

        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldDescription>Mínimo 8 caracteres.</FieldDescription>
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creando cuenta..." : "Crear cuenta gratis"}
        </Button>
      </FieldGroup>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
