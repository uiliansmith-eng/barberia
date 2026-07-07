import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        El enlace no es válido o ha caducado
      </h1>
      <p className="max-w-md text-muted-foreground">
        Solicita un nuevo enlace de confirmación o de recuperación de
        contraseña e inténtalo de nuevo.
      </p>
      <Button nativeButton={false} render={<Link href="/login" />}>
        Volver a iniciar sesión
      </Button>
    </div>
  );
}
