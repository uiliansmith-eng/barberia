"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-7 text-sidebar-foreground">
      <div className="mb-5 border-b border-sidebar-border px-6 pb-7">
        <div className="font-logo text-[28px] leading-none text-sidebar-foreground">
          BARBER<span className="text-primary">OS</span>
        </div>
        <div className="mt-0.5 text-[11px] tracking-wide text-muted-foreground">
          Panel de gerencia
        </div>
      </div>

      <nav className="flex flex-1 flex-col">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
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
        <div className="mb-3 flex items-center gap-2.5">
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
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
