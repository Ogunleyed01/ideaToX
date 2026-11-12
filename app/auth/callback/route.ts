import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const dest =
        type === "recovery" ? "/auth?mode=reset-password" : safeNext;
      return NextResponse.redirect(buildRedirectUrl(request, origin, dest));
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
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      const dest =
        type === "recovery" ? "/auth?mode=reset-password" : safeNext;
      return NextResponse.redirect(buildRedirectUrl(request, origin, dest));
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
