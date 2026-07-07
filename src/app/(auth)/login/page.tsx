import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión — BarberOS",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Inicia sesión
      </h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Accede al panel de tu barbería.
      </p>
      <LoginForm next={next} />
    </>
  );
}
