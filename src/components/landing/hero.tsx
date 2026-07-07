import Link from "next/link";
import { ArrowRight, CalendarCheck, Euro, UserPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Citas hoy", value: "18", icon: CalendarCheck },
  { label: "Ingresos hoy", value: "€640", icon: Euro },
  { label: "Clientes nuevos", value: "5", icon: UserPlus },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 sm:pt-28">
      <div
        className="pointer-events-none absolute top-[-220px] left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[-80px] right-[8%] -z-10 h-[320px] w-[320px] rounded-full bg-amber-300/15 blur-[110px]"
        aria-hidden
      />

      <div className="mx-auto max-w-4xl text-center">
        <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full border-primary/20 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          Usado por barberías en toda Latinoamérica y España
        </div>

        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          El sistema operativo de tu{" "}
          <span className="text-primary">barbería</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
          Reservas, clientes, agenda y fidelización en un solo lugar.
          BarberOS automatiza lo operativo para que tu equipo se enfoque
          en cortar el pelo, no en el papeleo.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="group/btn h-12 px-8 text-base shadow-lg shadow-primary/25 transition hover:shadow-xl hover:shadow-primary/30"
            nativeButton={false}
            render={<Link href="/registro" />}
          >
            Empieza gratis 14 días
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base transition hover:border-primary/40 hover:bg-primary/5"
            nativeButton={false}
            render={<a href="#pricing" />}
          >
            Ver precios
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Sin tarjeta de crédito · Cancela cuando quieras
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-5xl">
        <div className="glass-strong rounded-2xl p-2 shadow-2xl shadow-primary/10">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarCheck className="h-3.5 w-3.5" />
              app.barberos.ai/agenda
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-xl p-5 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <stat.icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
                <p className="mt-3 text-2xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
