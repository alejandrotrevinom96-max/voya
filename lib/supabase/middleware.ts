import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[middleware] Supabase env vars missing — letting request through"
    );
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          );
        },
      },
    });

    let user = null;
    try {
      const result = await supabase.auth.getUser();
      user = result.data.user;
    } catch (err) {
      console.error("[middleware] supabase.auth.getUser failed:", err);
    }

    // Rutas protegidas: /dashboard, /trip (excepto /trip/new que también es protegida)
    // /share/* es PÚBLICA (no requiere login)
    const protectedRoutes = ["/dashboard", "/trip"];
    const pathname = request.nextUrl.pathname;
    const isProtected = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Si el user ya está logueado y va a /auth/*, mandarlo al dashboard
    if (user && pathname.startsWith("/auth/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[middleware] unexpected error:", err);
    return supabaseResponse;
  }
}
