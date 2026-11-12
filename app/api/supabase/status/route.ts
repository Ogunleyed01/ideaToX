import { NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";

export async function GET() {
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    return NextResponse.json({
      status: "offline_fallback",
      configured: false,
      message:
        "Supabase credentials not configured in .env.local. Platform is running in local sandbox mode.",
      setup_instructions: [
        "1. Create a Supabase project at https://supabase.com",
        "2. Copy NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
        "3. Run SQL migrations in supabase/migrations/ via Supabase SQL Editor",
        "4. Run 'npm run db:seed' to populate initial blueprint ideas",
      ],
    });
  }

  try {
    const supabase = await createClient();

    const [
      ideasRes,
      profilesRes,
      bookmarksRes,
      collabRes,
      notificationsRes,
      profileV2ColsRes,
    ] = await Promise.all([
      supabase.from("ideas").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("bookmarks").select("user_id").limit(1),
      supabase.from("collaboration_requests").select("id").limit(1),
      supabase.from("notifications").select("id").limit(1),
      supabase.from("profiles").select("headline").limit(1),
    ]);

    const ideasCount = ideasRes.count ?? 0;
    const profilesCount = profilesRes.count ?? 0;

    const v2MigrationReady =
      !bookmarksRes.error &&
      !collabRes.error &&
      !notificationsRes.error &&
      !profileV2ColsRes.error;

    let authProviders: Record<string, boolean> = { email: true, github: false, google: false };
    let mailerAutoconfirm = false;

    try {
      const settingsRes = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
        {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
          cache: "no-store",
        }
      );
      if (settingsRes.ok) {
        const settings = (await settingsRes.json()) as {
          external?: Record<string, boolean>;
          mailer_autoconfirm?: boolean;
        };
        authProviders = {
          email: settings.external?.email ?? true,
          github: Boolean(settings.external?.github),
          google: Boolean(settings.external?.google),
        };
        mailerAutoconfirm = Boolean(settings.mailer_autoconfirm);
      }
    } catch {
      // ignore provider probe failures
    }

    return NextResponse.json({
      status: "connected",
      configured: true,
      v2_migration_ready: v2MigrationReady,
      auth: {
        providers: authProviders,
        mailer_autoconfirm: mailerAutoconfirm,
      },
      counts: {
        ideas: ideasCount,
        profiles: profilesCount,
      },
      message: v2MigrationReady
        ? `Supabase connected (${ideasCount} ideas, ${profilesCount} profiles, v2 production schema active).`
        : `Supabase connected (${ideasCount} ideas, ${profilesCount} profiles). Run supabase/migrations/20261111000000_production_auth_and_persistence.sql in SQL Editor to activate v2 tables & RLS counter triggers.`,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to reach Supabase database";
    return NextResponse.json(
      {
        status: "error",
        configured: true,
        message,
      },
      { status: 500 }
    );
  }
}
