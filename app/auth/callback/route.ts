import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { Database } from "@/types/database";
import { ensureProfileExists } from "@/lib/supabase/client";

function sanitizeNextPath(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/";
  }
  return rawNext;
}

function buildRedirectUrl(request: Request, origin: string, path: string): string {
  const isLocalEnv = process.env.NODE_ENV === "development";
  if (isLocalEnv) {
    return `${origin}${path}`;
  }

  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const hostHeader = request.headers.get("host")?.split(",")[0]?.trim();
  const forwardedProto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${path}`;
  }
  if (
    hostHeader &&
    !hostHeader.startsWith("localhost") &&
    !hostHeader.startsWith("127.0.0.1")
  ) {
    return `${forwardedProto}://${hostHeader}${path}`;
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}${path}`;
  }
  return `${origin}${path}`;
}

function parseCookieHeader(rawHeader: string | null): Record<string, string> {
  if (!rawHeader) return {};
  const map: Record<string, string> = {};
  rawHeader.split(";").forEach((pair) => {
    const [rawKey, ...valParts] = pair.split("=");
    const key = rawKey?.trim();
    if (key) {
      map[key] = decodeURIComponent(valParts.join("=").trim());
    }
  });
  return map;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const errorDesc = searchParams.get("error_description") || searchParams.get("error");
  const safeNext = sanitizeNextPath(searchParams.get("next"));

  if (errorDesc) {
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        origin,
        `/auth?auth_error=${encodeURIComponent(errorDesc)}&next=${encodeURIComponent(safeNext)}`
      )
    );
  }

  const dest = type === "recovery" ? "/auth?mode=reset-password" : safeNext;
  const redirectUrl = buildRedirectUrl(request, origin, dest);
  const redirectResponse = NextResponse.redirect(redirectUrl);

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const cookieStore = await cookies();
  const rawCookieHeader = request.headers.get("cookie");
  const rawCookieMap = parseCookieHeader(rawCookieHeader);

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll() {
        const storeCookies = cookieStore.getAll();
        const storeNames = new Set(storeCookies.map((c) => c.name));
        const merged = [...storeCookies];
        for (const [name, value] of Object.entries(rawCookieMap)) {
          if (!storeNames.has(name) && value) {
            merged.push({ name, value });
          }
        }
        return merged;
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // ignore server component write restrictions
          }
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data?.user) {
        await ensureProfileExists(data.user);
      }
      return redirectResponse;
    }
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        origin,
        `/auth?auth_error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(safeNext)}`
      )
    );
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      if (data?.user) {
        await ensureProfileExists(data.user);
      }
      return redirectResponse;
    }
    return NextResponse.redirect(
      buildRedirectUrl(
        request,
        origin,
        `/auth?auth_error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(safeNext)}`
      )
    );
  }

  return NextResponse.redirect(
    buildRedirectUrl(
      request,
      origin,
      `/auth?auth_error=${encodeURIComponent("Authentication callback did not include a valid verification code.")}`
    )
  );
}
