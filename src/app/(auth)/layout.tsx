import Link from "next/link";
import { Scissors } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark bg-mesh-dark bg-background text-foreground flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-semibold tracking-tight text-foreground"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scissors className="h-4 w-4" />
        </span>
        BarberOS
      </Link>
      <div className="glass w-full max-w-sm rounded-2xl p-8 shadow-lg">
        {children}
      </div>
    </div>
  );
}
