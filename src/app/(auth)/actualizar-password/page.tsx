import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = {
  title: "Actualizar contraseña — BarberOS",
};

export default function UpdatePasswordPage() {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Crea una nueva contraseña
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Elige una contraseña segura para tu cuenta.
      </p>
      <UpdatePasswordForm />
    </>
  );
}
