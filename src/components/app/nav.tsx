"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scissors } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agenda", label: "Agenda" },
  { href: "/clientes", label: "Clientes" },
  { href: "/servicios", label: "Servicios" },
  { href: "/empleados", label: "Empleados" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-40 shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scissors className="h-4 w-4" />
            </span>
            BarberFlow AI
          </Link>

          <nav className="hidden items-center gap-1 text-sm sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-muted-foreground transition hover:text-foreground",
                  pathname.startsWith(link.href) &&
                    "bg-primary/10 font-medium text-primary hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </header>
  );
}
