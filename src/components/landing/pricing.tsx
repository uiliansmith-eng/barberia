import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Pro",
    price: "14,99€",
    period: "/mes",
    description: "Para barberías con una sola sucursal.",
    features: [
      "1 sucursal",
      "Hasta 5 barberos",
      "Agenda y clientes ilimitados",
      "Recordatorios por email",
      "Dashboard con KPIs",
    ],
    highlighted: false,
  },
  {
    name: "Business",
    price: "29,99€",
    period: "/mes",
    description: "Para barberías con varias sucursales o equipos grandes.",
    features: [
      "Sucursales ilimitadas",
      "Barberos ilimitados",
      "Recordatorios por email y WhatsApp",
      "Rendimiento por barbero",
      "Soporte prioritario",
    ],
    highlighted: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Precios simples, sin sorpresas
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            14 días de prueba gratis en cualquier plan. Cancela cuando
            quieras.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative border-border bg-card shadow-lg shadow-black/20",
                plan.highlighted &&
                  "border-primary/40 shadow-xl shadow-primary/10 ring-1 ring-primary/10"
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Más popular
                </Badge>
              )}
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground/85">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  nativeButton={false}
                  render={<Link href="/registro" />}
                >
                  Empieza gratis
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
