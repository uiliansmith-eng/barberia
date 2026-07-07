"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="glass flex items-center gap-4 rounded-2xl p-6">
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
  );
}
