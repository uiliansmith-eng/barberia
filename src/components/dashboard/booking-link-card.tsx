"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const GUIDES = [
  {
    id: "google",
    label: "Google (recomendado)",
    tag: "Más citas",
    steps: (
      <>
        <p>
          Así es como aparece un botón &quot;Reservar&quot; directamente en
          tu ficha de Google cuando alguien busca tu barbería o
          &quot;barbería cerca de mí&quot;.
        </p>
        <p>
          Si todavía no tienes Perfil de Empresa de Google, créalo gratis en{" "}
          <a
            href="https://business.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            business.google.com
          </a>{" "}
          — es el paso que más citas nuevas suele traer.
        </p>
        <p>Si ya lo tienes:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Entra en{" "}
            <a
              href="https://business.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              business.google.com
            </a>{" "}
            e inicia sesión con la cuenta de tu barbería.
          </li>
          <li>Selecciona tu negocio y pulsa &quot;Editar perfil&quot;.</li>
          <li>
            Busca la sección &quot;Enlace de reservas&quot; (o
            &quot;Reservas&quot; / &quot;Booking link&quot;).
          </li>
          <li>Pega tu link de BarberOS y guarda los cambios.</li>
        </ol>
        <p>
          En unas horas aparecerá el botón de reserva en Google Búsqueda y
          Maps.
        </p>
      </>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    steps: (
      <ol className="list-decimal space-y-1 pl-5">
        <li>Abre tu perfil y pulsa &quot;Editar perfil&quot;.</li>
        <li>En &quot;Enlace del sitio web&quot;, pega tu link de BarberOS.</li>
        <li>
          Menciona en tus historias o publicaciones que ya se puede reservar
          online.
        </li>
      </ol>
    ),
  },
  {
    id: "whatsapp",
    label: "WhatsApp Business",
    steps: (
      <ol className="list-decimal space-y-1 pl-5">
        <li>Ve a Ajustes → Herramientas para empresas → Perfil de empresa.</li>
        <li>En &quot;Sitio web&quot;, pega tu link de BarberOS.</li>
        <li>
          También puedes enviarlo directamente en un mensaje cuando un
          cliente pregunte por disponibilidad.
        </li>
      </ol>
    ),
  },
] as const;

export function BookingLinkCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // Intentionally set after mount (not during the lazy initializer) so the
    // client's first render matches the server's empty-origin HTML — reading
    // window.location here instead would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const url = `${origin}/reservar/${slug}`;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Link2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">Tu link de reservas</p>
          <p className="truncate text-sm font-medium text-foreground">{url}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>

      <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        ¿Dónde pongo este link para conseguir reservas?
      </p>
      <Accordion className="border-b border-border">
        {GUIDES.map((guide) => (
          <AccordionItem key={guide.id} value={guide.id}>
            <AccordionTrigger>
              {guide.label}
              {"tag" in guide && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {guide.tag}
                </span>
              )}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {guide.steps}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
