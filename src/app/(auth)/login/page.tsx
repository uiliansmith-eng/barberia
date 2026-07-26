import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — BarberOS",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; deleted?: string }>;
}) {
  const { next, deleted } = await searchParams;

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Inicia sesión
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Accede al panel de tu barbería.
      </p>
      {deleted && (
        <p className="mb-4 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground">
          Tu cuenta se ha eliminado correctamente.
        </p>
      )}
      <LoginForm next={next} />
    </>
  );
}
