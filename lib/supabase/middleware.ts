import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database";

function sanitizeRedirectPath(rawNext: string | null, fallback = "/profile"): string {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return fallback;
  }
  return rawNext;
}

function buildSafeRedirectUrl(
  request: NextRequest,
  targetPathname: string,
  searchParams?: Record<string, string>,
  rawSearch?: string
): URL {
  const url = request.nextUrl.clone();
  url.pathname = targetPathname;
  url.search = rawSearch ?? "";

  if (searchParams) {
    Object.entries(searchParams).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }

  if (process.env.NODE_ENV !== "development") {
    const forwardedHost = request.headers
      .get("x-forwarded-host")
      ?.split(",")[0]
      ?.trim();
    const hostHeader = request.headers.get("host")?.split(",")[0]?.trim();
    const forwardedProto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      "https";

    const resolvedHost =
      forwardedHost ||
      (hostHeader &&
      !hostHeader.startsWith("localhost") &&
      !hostHeader.startsWith("127.0.0.1")
        ? hostHeader
        : "");

    if (resolvedHost) {
      url.protocol = `${forwardedProto}:`;
      url.host = resolvedHost;
      url.port = "";
    } else if (
      process.env.NEXT_PUBLIC_SITE_URL &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      const site = new URL(process.env.NEXT_PUBLIC_SITE_URL);
      url.protocol = site.protocol;
      url.host = site.host;
      url.port = site.port;
    }
  }

  return url;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("your-project.supabase.co")
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  // If Supabase falls back to Site URL (e.g. /?code=... or /auth?code=...),
  // auto-forward the authorization code to /auth/callback so it is exchanged immediately
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  if ((code || tokenHash) && pathname !== "/auth/callback") {
    const callbackUrl = buildSafeRedirectUrl(
      request,
      "/auth/callback",
      undefined,
      request.nextUrl.search
    );
    const redirectResponse = NextResponse.redirect(callbackUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  const isProtectedRoute =
    pathname === "/ideas/new" ||
    pathname.startsWith("/ideas/new/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/profile" ||
    pathname === "/profile/";

  if (isProtectedRoute && !user) {
    const authUrl = buildSafeRedirectUrl(request, "/auth", {
      next: `${pathname}${search}`,
      reason: "auth_required",
    });

    const redirectResponse = NextResponse.redirect(authUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  const isAuthPage = pathname === "/auth" || pathname === "/auth/";
  const mode = request.nextUrl.searchParams.get("mode");

  if (isAuthPage && user && mode !== "reset-password") {
    const targetPath = sanitizeRedirectPath(
      request.nextUrl.searchParams.get("next"),
      "/profile"
    );
    const [destPath, destQuery] = targetPath.split("?");
    const redirectUrl = buildSafeRedirectUrl(
      request,
      destPath || "/profile",
      undefined,
      destQuery ? `?${destQuery}` : ""
    );

    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
