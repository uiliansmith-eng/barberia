import {
  CalendarClock,
  Users,
  Scissors,
  BarChart3,
  BellRing,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: CalendarClock,
    title: "Agenda inteligente",
    description:
      "Calendario diario y semanal por barbero. Crea, reagenda y cancela citas en segundos.",
  },
  {
    icon: Users,
    title: "Clientes y fidelización",
    description:
      "Historial completo de visitas, gasto total y notas para dar un trato personalizado.",
  },
  {
    icon: Scissors,
    title: "Servicios y empleados",
    description:
      "Configura servicios, precios, comisiones y horarios de cada barbero.",
  },
  {
    icon: BarChart3,
    title: "Dashboard con KPIs",
    description:
      "Citas del día, ingresos, clientes recurrentes y servicios más vendidos en tiempo real.",
  },
  {
    icon: BellRing,
    title: "Recordatorios automáticos",
    description:
      "Email y WhatsApp 24h y 2h antes de la cita. Menos ausencias, más ingresos.",
  },
  {
    icon: CreditCard,
    title: "Suscripciones con Stripe",
    description:
      "Prueba gratuita de 14 días y planes Pro y Business listos para cobrar desde el día uno.",
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Todo lo que tu barbería necesita
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Una plataforma, todos los módulos. Sin hojas de cálculo, sin
            WhatsApp desordenado.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border bg-card shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
            >
              <CardHeader>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
