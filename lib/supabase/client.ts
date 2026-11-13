import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { Database, ProfileRow } from "@/types/database";

export interface AuthCapabilities {
  email: boolean;
  github: boolean;
  google: boolean;
  mailerAutoconfirm: boolean;
}

let cachedCapabilities: AuthCapabilities | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project.supabase.co")
  );
}

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      sameSite: "lax",
      secure: typeof window !== "undefined" ? window.location.protocol === "https:" : false,
      path: "/",
    },
  });
}

export function sanitizeUsernameHandle(raw: string): string {
  const clean = raw
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
  return clean.length >= 2 ? clean : "builder";
}

export async function getAuthProviderCapabilities(): Promise<AuthCapabilities> {
  if (cachedCapabilities) return cachedCapabilities;

  const fallback: AuthCapabilities = {
    email: true,
    github: false,
    google: false,
    mailerAutoconfirm: false,
  };

  if (!isSupabaseConfigured()) {
    return fallback;
  }

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    const settings = (await res.json()) as {
      external?: Record<string, boolean>;
      mailer_autoconfirm?: boolean;
    };
    cachedCapabilities = {
      email: settings.external?.email ?? true,
      github: Boolean(settings.external?.github),
      google: Boolean(settings.external?.google),
      mailerAutoconfirm: Boolean(settings.mailer_autoconfirm),
    };
    return cachedCapabilities;
  } catch {
    return fallback;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function ensureProfileExists(user: User): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured() || !user?.id) return null;
  try {
    const supabase = createClient();
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) {
      return existing;
    }

    const meta = (user.user_metadata || {}) as Record<string, string | undefined>;
    const baseHandle = sanitizeUsernameHandle(
      meta.username ||
        meta.user_name ||
        meta.preferred_username ||
        (user.email ? user.email.split("@")[0] : "") ||
        "builder"
    );
    const uniqueUsername = `${baseHandle.slice(0, 24)}_${user.id.slice(0, 4)}`;

    const { data: inserted, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        username: uniqueUsername,
        full_name: meta.full_name || meta.name || uniqueUsername,
        avatar_url: meta.avatar_url || null,
        bio: meta.bio || "Open-source systems builder & software architect on IdeaToX.",
        github_url: meta.user_name ? `https://github.com/${meta.user_name}` : null,
        location: "Global",
        reputation_score: 300,
        badges: ["Ideator"],
      })
      .select("*")
      .maybeSingle();

    if (!error && inserted) {
      return inserted;
    }

    // Re-read in case concurrent trigger inserted simultaneously
    const { data: retryProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return retryProfile || null;
  } catch {
    return null;
  }
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return await ensureProfileExists(user);
  } catch {
    return null;
  }
}
