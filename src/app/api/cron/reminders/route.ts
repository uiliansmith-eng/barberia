import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { processReminders } from "@/lib/reminders/process";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Config error" },
      { status: 503 }
    );
  }

  const [result24h, result2h] = await Promise.all([
    processReminders(supabase, 24),
    processReminders(supabase, 2),
  ]);

  return NextResponse.json({ result24h, result2h });
}
