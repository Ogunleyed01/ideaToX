"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow } from "@/types/database";
import {
  isSupabaseConfigured,
  createClient,
  ensureProfileExists,
} from "@/lib/supabase/client";
import { AuthModal } from "@/components/auth-modal";
import type { AuthFormMode } from "@/components/auth-passport-form";
import {
  setActiveAuthSession,
  hydrateUserSupabaseData,
  resetActiveUserSessionCache,
} from "@/lib/ideas";

interface OpenAuthOptions {
  mode?: AuthFormMode;
  reason?: string;
  next?: string;
}

export interface AuthContextValue {
  user: User | null;
  profile: ProfileRow | null;
  isConfigured: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  openAuthModal: (options?: OpenAuthOptions) => void;
  requireAuth: (reason?: string, options?: { next?: string }) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState<boolean>(isConfigured);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthFormMode>("signin");
  const [modalReason, setModalReason] = useState<string | undefined>(undefined);
  const [modalNext, setModalNext] = useState<string | undefined>(undefined);

  const syncUserState = useCallback(async (nextUser: User | null) => {
    setUser(nextUser);
    if (!nextUser) {
      setProfile(null);
      setActiveAuthSession(null, null);
      resetActiveUserSessionCache();
      return;
    }

    const ensuredProfile = await ensureProfileExists(nextUser);
    setProfile(ensuredProfile);
    setActiveAuthSession(nextUser, ensuredProfile);
    await hydrateUserSupabaseData(nextUser.id);
  }, []);

  const refreshAuth = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      await syncUserState(currentUser);
    } catch {
      await syncUserState(null);
    } finally {
      setLoading(false);
    }
  }, [isConfigured, syncUserState]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    let active = true;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      await syncUserState(data?.user ?? null);
      if (active) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      void syncUserState(session?.user ?? null).finally(() => {
        if (active) setLoading(false);
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isConfigured, syncUserState]);

  const openAuthModal = useCallback((options?: OpenAuthOptions) => {
    setModalMode(options?.mode || "signin");
    setModalReason(options?.reason);
    setModalNext(options?.next);
    setModalOpen(true);
  }, []);

  const requireAuth = useCallback(
    (reason?: string, options?: { next?: string }) => {
      if (!isConfigured) {
        return true;
      }
      if (user) {
        return true;
      }
      openAuthModal({
        mode: "signin",
        reason:
          reason ||
          "Sign in to your IdeaToX developer passport to save, star, fork, or collaborate on blueprints.",
        next: options?.next,
      });
      return false;
    },
    [isConfigured, user, openAuthModal]
  );

  const signOut = useCallback(async () => {
    if (isConfigured) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // ignore network errors during signout cleanup
      }
    }
    await syncUserState(null);
    router.refresh();
  }, [isConfigured, router, syncUserState]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isConfigured,
        isAuthenticated: Boolean(user),
        loading,
        refreshAuth,
        signOut,
        openAuthModal,
        requireAuth,
      }}
    >
      {children}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMode={modalMode}
        reason={modalReason}
        nextPath={modalNext}
      />
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
