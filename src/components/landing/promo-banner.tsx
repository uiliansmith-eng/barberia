import Link from "next/link";
import { Sparkles } from "lucide-react";

export function PromoBanner() {
  return (
    <Link
      href="/registro"
      className="flex items-center justify-center gap-2 bg-primary px-6 py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
    >
      <Sparkles className="h-4 w-4 shrink-0" />
      Regístrate hoy y consigue el sistema de reservas online gratis — hasta 50 citas/mes
      <span className="underline underline-offset-2">Empieza gratis →</span>
    </Link>
  );
}
