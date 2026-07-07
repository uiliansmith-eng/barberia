import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña — BarberFlow AI",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Recupera tu contraseña
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Te enviaremos un enlace para restablecerla.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
