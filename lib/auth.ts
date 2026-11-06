import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { IdeaAuthor } from "@/types/idea";

export interface ActiveSessionUser {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  github_url?: string;
  twitter_url?: string;
  discord_url?: string;
  website_url?: string;
  location?: string;
  reputation_score?: number;
  badges?: string[];
  is_sandbox: boolean;
}

export const SANDBOX_PERSONAS: IdeaAuthor[] = [
  {
    username: "you_builder",
    full_name: "You (Active Builder)",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Full-Stack builder & active IdeaToX contributor exploring high-leverage software architectures and production apps.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    location: "Global",
    joined_date: "April 2026",
    reputation_score: 520,
    badges: ["Ideator", "Remixer", "Shipper"],
  },
  {
    username: "adebayo_codes",
    full_name: "Adebayo Ogunlesi",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Staff Distributed Systems Engineer. Passionate about offline-first architectures, edge telemetry, and open protocol design.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    location: "Lagos, Nigeria",
    joined_date: "February 2026",
    reputation_score: 1420,
    badges: ["Ideator", "Shipper", "Architect"],
  },
  {
    username: "sarah_systems",
    full_name: "Sarah Chen",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    bio: "Compiler geek & local-first researcher. Architecting resilient distributed state engines and zero-trust sync protocols.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    website_url: "https://sarahchen.dev",
    location: "San Francisco, CA",
    joined_date: "January 2026",
    reputation_score: 2850,
    badges: ["Ideator", "Remixer", "Architect"],
  },
  {
    username: "maboroshi_io",
    full_name: "Kenji Sato",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Systems tinkerer & hardware hacker. Specializing in embedded ESP32 mesh networks and low-latency WebSockets.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    discord_url: "kenji#1337",
    location: "Tokyo, Japan",
    joined_date: "November 2025",
    reputation_score: 3910,
    badges: ["Ideator", "Shipper", "Remixer"],
  },
  {
    username: "elena_arch",
    full_name: "Elena Rostova",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    bio: "Platform engineer & open-source contributor. Focused on developer tooling, zero-config CLI ergonomics, and Nix derivations.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    location: "Berlin, Germany",
    joined_date: "March 2026",
    reputation_score: 980,
    badges: ["Ideator", "Remixer"],
  },
];

const AUTH_STORAGE_KEY = "ideatox_active_persona";
const AUTH_EVENT_NAME = "ideatox_auth_changed";

/**
 * Retrieves the currently active user session across Supabase Auth and Local Sandbox Personas.
 */
export async function getActiveUser(): Promise<ActiveSessionUser | null> {
  // 1. Check Supabase Auth if credentials are configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Query profile metadata
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        const p = profile as any;
        return {
          id: user.id,
          username: p?.username || user.email?.split("@")[0] || "authenticated_user",
          email: user.email,
          full_name: p?.full_name || user.user_metadata?.full_name || p?.username,
          avatar_url: p?.avatar_url || user.user_metadata?.avatar_url,
          bio: p?.bio,
          github_url: p?.github_url,
          twitter_url: p?.twitter_url,
          discord_url: p?.discord_url,
          website_url: p?.website_url,
          location: p?.location || "Global",
          reputation_score: p?.reputation_score || 350,
          badges: p?.badges || ["Ideator"],
          is_sandbox: false,
        };
      }
    } catch {
      // Supabase lookup failed or network down, fallback to sandbox
    }
  }

  // 2. Local sandbox persona mode
  if (typeof window === "undefined") {
    // Default server-side fallback
    const defaultPersona = SANDBOX_PERSONAS[0];
    return {
      id: `sandbox-${defaultPersona.username}`,
      ...defaultPersona,
      is_sandbox: true,
    };
  }

  const storedPersona = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedPersona === "guest") {
    return null; // Explicitly logged out
  }

  const personaUsername = storedPersona || "you_builder";
  const matchedPersona = SANDBOX_PERSONAS.find(
    (p) => p.username.toLowerCase() === personaUsername.toLowerCase()
  );

  let activePersona: IdeaAuthor = matchedPersona
    ? { ...matchedPersona }
    : {
        username: personaUsername,
        full_name: personaUsername.charAt(0).toUpperCase() + personaUsername.slice(1).replace(/_/g, " "),
        bio: "Active developer exploring high-leverage software blueprints on IdeaToX.",
        reputation_score: 400,
        badges: ["Ideator"],
        location: "Global",
        joined_date: "Recent Builder",
      };

  // Merge any local profile overrides
  try {
    const rawOverrides = localStorage.getItem(`ideatox_profile_overrides_${activePersona.username}`);
    if (rawOverrides) {
      const overrides = JSON.parse(rawOverrides);
      activePersona = { ...activePersona, ...overrides, username: activePersona.username };
    }
  } catch {
    // ignore parse error
  }

  return {
    id: `sandbox-${activePersona.username}`,
    ...activePersona,
    username: activePersona.username,
    is_sandbox: true,
  };
}

/**
 * Switches the active local sandbox persona and notifies all listeners.
 */
export function setActivePersona(username: string): ActiveSessionUser {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, username);
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { username } }));
  }

  let persona = SANDBOX_PERSONAS.find((p) => p.username.toLowerCase() === username.toLowerCase());
  if (!persona) {
    persona = {
      username,
      full_name: username.charAt(0).toUpperCase() + username.slice(1).replace(/_/g, " "),
      bio: "Active developer exploring high-leverage software blueprints on IdeaToX.",
      reputation_score: 400,
      badges: ["Ideator"],
      location: "Global",
      joined_date: "Recent Builder",
    };
  }

  return {
    id: `sandbox-${persona.username}`,
    ...persona,
    username: persona.username,
    is_sandbox: true,
  };
}

/**
 * Sign out of both Supabase and Local Sandbox session.
 */
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_STORAGE_KEY, "guest");
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { username: "guest" } }));
  }
}

/**
 * Send passwordless Magic Link (OTP) to email.
 */
export async function signInWithMagicLink(email: string): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `Magic login link dispatched to ${email}. Click the link in your inbox to authenticate!`,
    };
  }

  // Sandbox simulation
  const derivedUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || "you_builder";
  setActivePersona(derivedUsername);

  return {
    success: true,
    message: `[Sandbox] Passwordless link verified! Authenticated as @${derivedUsername}.`,
  };
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { user: data.user } }));
    }

    return {
      success: true,
      message: "Successfully signed in to developer passport.",
    };
  }

  // Sandbox simulation
  const derivedUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || "you_builder";
  setActivePersona(derivedUsername);

  return {
    success: true,
    message: `[Sandbox] Authenticated as @${derivedUsername}.`,
  };
}

/**
 * Sign up with email, password, and profile metadata.
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string,
  username: string,
  fullName: string
): Promise<{ success: boolean; message: string }> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          username: cleanUsername,
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME, { detail: { user: data.user } }));
    }

    return {
      success: true,
      message: data.session
        ? "Account created and authenticated successfully!"
        : "Confirmation email sent! Please check your inbox to activate your developer account.",
    };
  }

  // Sandbox simulation
  setActivePersona(cleanUsername || "you_builder");

  return {
    success: true,
    message: `[Sandbox] Account @${cleanUsername || "you_builder"} created and active.`,
  };
}

/**
 * Listen for authentication and persona changes across tabs and components.
 */
export function onAuthChange(callback: (user: ActiveSessionUser | null) => void): () => void {
  const handler = async () => {
    const user = await getActiveUser();
    callback(user);
  };

  if (typeof window !== "undefined") {
    window.addEventListener(AUTH_EVENT_NAME, handler);
    window.addEventListener("storage", handler);
  }

  let supabaseSubscription: { unsubscribe: () => void } | null = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async () => {
        const user = await getActiveUser();
        callback(user);
      });
      supabaseSubscription = subscription;
    } catch {
      // ignore
    }
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener(AUTH_EVENT_NAME, handler);
      window.removeEventListener("storage", handler);
    }
    supabaseSubscription?.unsubscribe();
  };
}
