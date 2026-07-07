"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Re-fetches the current (server-rendered) page whenever an appointment for
// this tenant changes — e.g. a customer booking through the public portal —
// so staff see it appear without a manual refresh. RLS still applies to the
// realtime subscription itself, so this only ever receives this tenant's rows.
export function AppointmentsRealtimeRefresher({ tenantId }: { tenantId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (token) {
        // @supabase/ssr's browser client doesn't always push the current
        // session token to the realtime websocket automatically, which
        // makes RLS evaluate the subscription as anon (and silently drop
        // every change). Setting it explicitly before subscribing fixes that.
        supabase.realtime.setAuth(token);
      }

      channel = supabase
        .channel(`appointments-${tenantId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "appointments",
            filter: `tenant_id=eq.${tenantId}`,
          },
          () => router.refresh()
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [tenantId, router]);

  return null;
}
