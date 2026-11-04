"use client";

import React, { useState } from "react";
import { X, Sparkles, Terminal, AlertCircle, Check } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setLoadingProvider(provider);
    setErrorMessage(null);

    if (!isConfigured) {
      // In local-first sandbox mode, notify user
      setTimeout(() => {
        setLoadingProvider(null);
        onClose();
      }, 500);
      return;
    }

    try {
      const supabase = createClient();
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${redirectOrigin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoadingProvider(null);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to initiate authentication.");
      setLoadingProvider(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] bg-white border border-zinc-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Aurora Blur */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-2xl opacity-40 bg-gradient-to-br from-amber-200 to-yellow-100"
        />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                DEVELOPER PASSPORT
              </span>
            </div>
            <h3 className="text-xl font-sans font-bold text-[#111113]">
              Authenticate to IdeaTo<span className="text-amber-800">X</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Fork blueprints, submit Feature PRs, and showcase shipped codebases.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Status / Sandbox notice */}
        {!isConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles size={13} className="text-amber-600" />
              <span>Local Sandbox Mode Active</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
              Supabase credentials are not connected in .env.local. You are automatically authenticated as <strong>@you_builder</strong> for full local testing.
            </p>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 relative z-10">
          {/* GitHub OAuth Button */}
          <button
            type="button"
            onClick={() => handleOAuthSignIn("github")}
            disabled={!!loadingProvider}
            className="w-full h-11 px-4 rounded-2xl bg-[#0D0E12] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>
              {loadingProvider === "github" ? "Connecting to GitHub..." : "Continue with GitHub"}
            </span>
          </button>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => handleOAuthSignIn("google")}
            disabled={!!loadingProvider}
            className="w-full h-11 px-4 rounded-2xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-mono text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>
              {loadingProvider === "google" ? "Connecting to Google..." : "Continue with Google"}
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] font-mono text-zinc-400">
          Open-source passport • Zero passwords stored • RLS protected
        </div>
      </div>
    </div>
  );
}
