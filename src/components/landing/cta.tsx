import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center shadow-lg shadow-primary/20 sm:px-16">
        <div className="relative z-10">
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Digitaliza tu barbería en menos de 10 minutos
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-primary-foreground/80">
            Crea tu cuenta, configura tu primera sucursal y empieza a recibir
            reservas hoy mismo.
          </p>
          <Button
            size="lg"
            className="mt-8 h-12 bg-background px-8 text-base text-foreground hover:bg-background/90"
            nativeButton={false}
            render={<Link href="/registro" />}
          >
            Empieza gratis 14 días
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
