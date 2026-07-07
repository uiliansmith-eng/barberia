import type { Metadata } from "next";
import { Scissors } from "lucide-react";
import { DirectoryLeadForm } from "@/components/directory/directory-lead-form";

export const metadata: Metadata = {
  title: "Añade tu barbería — BarberOS",
};

export default function AnadirBarberiaPage() {
  return (
    <div className="dark bg-mesh-dark bg-background text-foreground min-h-screen">
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-10">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold tracking-tight">BarberOS</p>
            <p className="text-xs text-muted-foreground">
              Añade una barbería al directorio
            </p>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Pon tu barbería en BarberOS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Rellena tus datos y nuestro equipo te contacta para activar tu
            barbería en el directorio y darte de alta en la app.
          </p>
        </div>

        <DirectoryLeadForm />
      </div>
    </div>
  );
}
