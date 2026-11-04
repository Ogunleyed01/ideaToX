import { NextResponse } from "next/server";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/server";

export async function GET() {
  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    return NextResponse.json({
      status: "offline_fallback",
      configured: false,
      message:
        "Supabase credentials not configured in .env.local. Platform is running in zero-friction offline sandbox mode using in-memory and seed data.",
      setup_instructions: [
        "1. Create a Supabase project at https://supabase.com",
        "2. Copy NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
        "3. Run SQL migration in supabase/migrations/20261104000000_init_schema.sql via Supabase SQL Editor",
        "4. Run 'npm run db:seed' to populate initial blueprint ideas",
      ],
    });
  }

  try {
    const supabase = await createClient();

    const [ideasRes, profilesRes] = await Promise.all([
      supabase.from("ideas").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const ideasCount = ideasRes.count ?? 0;
    const profilesCount = profilesRes.count ?? 0;

    return NextResponse.json({
      status: "connected",
      configured: true,
      counts: {
        ideas: ideasCount,
        profiles: profilesCount,
      },
      message: `Supabase connected successfully. Database contains ${ideasCount} ideas and ${profilesCount} profiles.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        configured: true,
        message: err.message || "Failed to reach Supabase database",
      },
      { status: 500 }
    );
  }
}
