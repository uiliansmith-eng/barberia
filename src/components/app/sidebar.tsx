"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Resumen", gated: false },
  { href: "/agenda", label: "Citas", gated: true },
  { href: "/clientes", label: "Clientes", gated: true },
  { href: "/empleados", label: "Barberos", gated: false },
  { href: "/servicios", label: "Servicios", gated: false },
  { href: "/inventario", label: "Inventario", gated: true },
];

const roleLabels: Record<string, string> = {
  owner: "Dueño",
  manager: "Gerente",
  barber: "Barbero",
  receptionist: "Recepción",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AppSidebar({
  fullName,
  role,
  isPaid,
}: {
  fullName: string;
  role: string;
  isPaid: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground md:hidden"
        style={{
          height: "calc(3.5rem + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="font-logo text-xl leading-none text-sidebar-foreground">
          BARBER<span className="text-primary">OS</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[220px] shrink-0 -translate-x-full flex-col border-r border-sidebar-border bg-sidebar pt-[calc(1.75rem+env(safe-area-inset-top))] pb-7 text-sidebar-foreground transition-transform duration-200 md:translate-x-0 md:pt-7",
          open && "translate-x-0"
        )}
      >
        <div className="mb-5 flex items-center justify-between border-b border-sidebar-border px-6 pb-7">
          <div>
            <div className="font-logo text-[28px] leading-none text-sidebar-foreground">
              BARBER<span className="text-primary">OS</span>
            </div>
            <div className="mt-0.5 text-[11px] tracking-wide text-muted-foreground">
              Panel de gerencia
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 border-l-[3px] border-transparent px-6 py-[11px] text-sm font-medium text-muted-foreground transition hover:text-sidebar-foreground",
                  active &&
                    "border-primary bg-sidebar-accent font-bold text-sidebar-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-[2px]",
                    active ? "bg-primary" : "bg-muted-foreground/40"
                  )}
                />
                <span className="flex-1">{link.label}</span>
                {link.gated && !isPaid && (
                  <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-primary">
                    PRO
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 border-t border-sidebar-border px-6 pt-5">
          <Link
            href="/cuenta"
            onClick={() => setOpen(false)}
            className="mb-3 flex items-center gap-2.5 rounded-lg -mx-1.5 px-1.5 py-1 hover:bg-sidebar-accent"
          >
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">
              {getInitials(fullName)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">
                {fullName || "Usuario"}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {roleLabels[role] ?? (role || "—")}
              </div>
            </div>
          </Link>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
