import Link from "next/link";
import { ArrowRight, Check, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustItems = [
  "Sin tarjeta de crédito",
  "Cancela cuando quieras",
  "Soporte en español",
];

export function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="group relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-[oklch(0.68_0.17_60)] px-8 py-16 text-center shadow-xl shadow-primary/25 sm:px-16">
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl"
          aria-hidden
        />
        <Scissors
          className="pointer-events-none absolute top-6 right-8 h-24 w-24 -rotate-12 text-primary-foreground/10"
          aria-hidden
        />

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
            className="group/btn mt-8 h-12 bg-background px-8 text-base text-foreground shadow-lg transition hover:bg-background/90 hover:shadow-xl"
            nativeButton={false}
            render={<Link href="/registro" />}
          >
            Empieza gratis 14 días
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-primary-foreground/70">
            {trustItems.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
