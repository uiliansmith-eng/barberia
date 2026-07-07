import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Necesito tarjeta de crédito para la prueba gratuita?",
    answer:
      "No. Puedes registrar tu barbería y usar BarberFlow AI durante 14 días sin ingresar ningún método de pago.",
  },
  {
    question: "¿Puedo gestionar varias sucursales?",
    answer:
      "Sí. Un mismo tenant puede tener varias sucursales, cada una con su propia agenda, barberos y clientes.",
  },
  {
    question: "¿Cómo funcionan los recordatorios?",
    answer:
      "Enviamos recordatorios automáticos por email 24 horas y 2 horas antes de cada cita. El envío por WhatsApp ya está en la arquitectura y se activa por sucursal.",
  },
  {
    question: "¿Qué pasa cuando termina el trial?",
    answer:
      "Si no eliges un plan, el acceso se bloquea automáticamente al finalizar los 14 días. Tus datos se conservan y se restauran al suscribirte.",
  },
  {
    question: "¿Puedo cancelar cuando quiera?",
    answer:
      "Sí, la suscripción se gestiona con Stripe y puedes cancelarla en cualquier momento desde tu panel de facturación.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Preguntas frecuentes
          </h2>
        </div>

        <Accordion className="mt-12">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
