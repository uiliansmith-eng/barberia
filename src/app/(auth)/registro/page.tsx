import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta — BarberOS",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Empieza gratis 14 días
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Sin tarjeta de crédito. Cancela cuando quieras.
      </p>
      <RegisterForm />
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Al crear una cuenta aceptas nuestros{" "}
        <Link href="/legal/terminos" className="underline">
          Términos
        </Link>{" "}
        y nuestra{" "}
        <Link href="/legal/privacidad" className="underline">
          Política de Privacidad
        </Link>
        .
      </p>
    </>
  );
}
