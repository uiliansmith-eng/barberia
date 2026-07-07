"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Funciones" },
  { href: "#pricing", label: "Precios" },
  { href: "#faq", label: "Preguntas" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scissors className="h-4 w-4" />
          </span>
          BarberOS
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/barberias" className="text-sm text-muted-foreground hover:text-foreground">
            Buscar barbería
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Iniciar sesión
          </Link>
          <Button size="sm" nativeButton={false} render={<Link href="/registro" />}>
            Empieza gratis
          </Button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            <Link href="/barberias" onClick={() => setOpen(false)}>
              Buscar barbería
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}>
              Iniciar sesión
            </Link>
            <Button
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href="/registro" />}
            >
              Empieza gratis
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
