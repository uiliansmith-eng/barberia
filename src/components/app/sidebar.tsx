"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scissors,
  LayoutDashboard,
  CalendarDays,
  Users,
  UserSquare2,
} from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicios", label: "Servicios", icon: Scissors },
  { href: "/empleados", label: "Empleados", icon: UserSquare2 },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dark bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col border-r border-sidebar-border px-4 py-6">
      <Link
        href="/dashboard"
        className="mb-8 flex items-center gap-2 px-2 font-semibold tracking-tight"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Scissors className="h-4 w-4" />
        </span>
        BarberFlow AI
      </Link>

      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-sidebar-foreground",
                active &&
                  "bg-sidebar-primary/15 font-medium text-sidebar-primary hover:bg-sidebar-primary/15 hover:text-sidebar-primary"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <form action={signOut}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Cerrar sesión
        </Button>
      </form>
    </aside>
  );
}
