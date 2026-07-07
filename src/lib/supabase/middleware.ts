import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/registro",
  "/recuperar-password",
  "/actualizar-password",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  if (pathname.startsWith("/legal/")) return true;
  // Cron/webhook routes authenticate themselves (e.g. a Bearer secret) —
  // they're never called with a browser session, so skip the login gate.
  if (pathname.startsWith("/api/cron/")) return true;
  return false;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && (pathname === "/login" || pathname === "/registro")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (user && !isPublicPath(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    const hasTenant = !!profile?.tenant_id;

    if (!hasTenant && pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (hasTenant && pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}
