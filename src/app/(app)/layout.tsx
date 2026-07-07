import { AppSidebar } from "@/components/app/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="bg-mesh-light min-h-screen flex-1 pl-60">
        {children}
      </main>
    </div>
  );
}
