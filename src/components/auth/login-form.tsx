"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthActionState } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthActionState, FormData>(
    login,
    null
  );

  return (
    <form action={action}>
      <FieldGroup>
        <input type="hidden" name="next" value={next ?? "/dashboard"} />

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
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Link
              href="/recuperar-password"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Iniciar sesión"}
        </Button>
      </FieldGroup>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-primary hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
