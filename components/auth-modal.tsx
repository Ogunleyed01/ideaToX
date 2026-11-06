"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Terminal,
  AlertCircle,
  Check,
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  SANDBOX_PERSONAS,
  getActiveUser,
  setActivePersona,
  signInWithMagicLink,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  ActiveSessionUser,
} from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "magic_link" | "password" | "oauth" | "sandbox";
}

export function AuthModal({ isOpen, onClose, initialTab = "magic_link" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"magic_link" | "password" | "oauth" | "sandbox">(
    initialTab
  );
  const [passwordMode, setPasswordMode] = useState<"signin" | "signup">("signin");

  // Form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<ActiveSessionUser | null>(null);

  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMessage(null);
      setSuccessMessage(null);
      getActiveUser().then(setCurrentUser);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await signInWithMagicLink(email);
      setSuccessMessage(res.message);
      const updated = await getActiveUser();
      setCurrentUser(updated);

      if (!isConfigured) {
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to dispatch magic link.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (passwordMode === "signin") {
        const res = await signInWithEmailPassword(email, password);
        setSuccessMessage(res.message);
        const updated = await getActiveUser();
        setCurrentUser(updated);
        setTimeout(() => {
          onClose();
        }, 900);
      } else {
        if (!username.trim()) {
          setErrorMessage("Please specify a unique username handle.");
          setLoading(false);
          return;
        }
        const res = await signUpWithEmailPassword(email, password, username, fullName);
        setSuccessMessage(res.message);
        const updated = await getActiveUser();
        setCurrentUser(updated);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Authentication attempt failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setLoadingProvider(provider);
    setErrorMessage(null);

    if (!isConfigured) {
      // In local sandbox mode, quickly authenticate as testing persona
      setActivePersona(provider === "github" ? "adebayo_codes" : "you_builder");
      setSuccessMessage(`[Sandbox] Signed in with ${provider} developer identity.`);
      setTimeout(() => {
        setLoadingProvider(null);
        onClose();
      }, 600);
      return;
    }

    try {
      const supabase = createClient();
      const redirectOrigin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

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
      setErrorMessage(err?.message || "Failed to initiate OAuth authentication.");
      setLoadingProvider(null);
    }
  };

  const handleSelectPersona = (targetUsername: string) => {
    const updated = setActivePersona(targetUsername);
    setCurrentUser(updated);
    setSuccessMessage(`Active testing persona switched to @${targetUsername}!`);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-[28px] bg-white border border-zinc-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scaleUp overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Decorative Dual Aurora Blur */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full blur-2xl opacity-40 bg-gradient-to-br from-amber-200 to-yellow-100"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-2xl opacity-30 bg-gradient-to-br from-indigo-200 to-purple-100"
        />

        {/* Modal Header */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                DEVELOPER PASSPORT • AUTH
              </span>
              {isConfigured ? (
                <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Supabase Live
                </span>
              ) : (
                <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Local Sandbox
                </span>
              )}
            </div>
            <h3 className="text-xl font-sans font-bold text-[#111113]">
              Authenticate to IdeaTo<span className="text-amber-800">X</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1 font-sans">
              Fork blueprints, submit Feature PRs, form teams, and showcase shipped codebases.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-black transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center p-1 rounded-2xl bg-zinc-100 border border-zinc-200/80 relative z-10">
          <button
            type="button"
            onClick={() => {
              setActiveTab("magic_link");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "magic_link"
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <KeyRound size={13} className={activeTab === "magic_link" ? "text-amber-600" : ""} />
            <span>Magic Link</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "password"
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Lock size={13} className={activeTab === "password" ? "text-amber-600" : ""} />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("oauth");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "oauth"
                ? "bg-white text-zinc-900 shadow-sm font-semibold"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Sparkles size={13} className={activeTab === "oauth" ? "text-amber-600" : ""} />
            <span>OAuth</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("sandbox");
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-[#0D0E12] text-amber-300 shadow-sm font-semibold"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Terminal size={13} className={activeTab === "sandbox" ? "text-amber-300" : ""} />
            <span>Sandbox</span>
          </button>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: MAGIC LINK (PASSWORDLESS OTP) */}
        {activeTab === "magic_link" && (
          <form onSubmit={handleMagicLinkSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold">
                Developer Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@ideatox.org"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-sans text-xs text-zinc-900 transition-all outline-none"
                  required
                />
                <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                We'll dispatch a secure, passwordless one-click authentication link directly to your inbox.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-11 px-4 rounded-xl bg-[#0D0E12] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dispatching Magic Link...</span>
                </>
              ) : (
                <>
                  <span>Send Magic Login Link</span>
                  <ArrowRight size={14} className="text-amber-300" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: PASSWORD SIGN IN / SIGN UP */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 relative z-10">
            {/* Mode switch: Sign In vs Sign Up */}
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
              <button
                type="button"
                onClick={() => setPasswordMode("signin")}
                className={`text-xs font-mono pb-1 border-b-2 transition-colors cursor-pointer ${
                  passwordMode === "signin"
                    ? "border-amber-600 font-bold text-amber-900"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Sign In
              </button>
              <span className="text-zinc-300 font-mono">•</span>
              <button
                type="button"
                onClick={() => setPasswordMode("signup")}
                className={`text-xs font-mono pb-1 border-b-2 transition-colors cursor-pointer ${
                  passwordMode === "signup"
                    ? "border-amber-600 font-bold text-amber-900"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Create Account
              </button>
            </div>

            {passwordMode === "signup" && (
              <>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1">
                    Unique Username Handle
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="e.g. adebayo_builds"
                      className="w-full h-10 pl-7 pr-3 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-mono text-xs text-zinc-900 transition-all outline-none"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-xs pointer-events-none">
                      @
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adebayo Ogunlesi"
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-sans text-xs text-zinc-900 transition-all outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@ideatox.org"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-sans text-xs text-zinc-900 transition-all outline-none"
                  required
                />
                <Mail size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-700 font-bold mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-white border border-zinc-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 font-sans text-xs text-zinc-900 transition-all outline-none"
                  required
                  minLength={6}
                />
                <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full h-11 px-4 rounded-xl bg-[#0D0E12] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Passport...</span>
                </>
              ) : (
                <>
                  <span>{passwordMode === "signin" ? "Sign In to Passport" : "Create Developer Account"}</span>
                  <ArrowRight size={14} className="text-amber-300" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: OAUTH PROVIDERS */}
        {activeTab === "oauth" && (
          <div className="space-y-3 relative z-10">
            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={!!loadingProvider}
              className="w-full h-11 px-4 rounded-xl bg-[#0D0E12] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>
                {loadingProvider === "github" ? "Connecting to GitHub..." : "Continue with GitHub Passport"}
              </span>
            </button>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={!!loadingProvider}
              className="w-full h-11 px-4 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-mono text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>
                {loadingProvider === "google" ? "Connecting to Google..." : "Continue with Google Passport"}
              </span>
            </button>

            <p className="text-[11px] text-zinc-500 font-sans leading-relaxed pt-1">
              Note: OAuth requires configured OAuth provider credentials in your Supabase project dashboard. If you don't have OAuth credentials configured, use <strong>Magic Link</strong> or <strong>Password</strong> sign-in!
            </p>
          </div>
        )}

        {/* TAB 4: SANDBOX PERSONA QUICK-SWITCHER */}
        {activeTab === "sandbox" && (
          <div className="space-y-3 relative z-10">
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Terminal size={13} className="text-amber-700" />
                <span>Sandbox Persona Testing Switcher</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                Select an architect identity below to test different roles (Idea Author, PR Reviewer, Collab Applicant, Remixer) instantly.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {SANDBOX_PERSONAS.map((persona) => {
                const isSelected = currentUser?.username.toLowerCase() === persona.username.toLowerCase();
                return (
                  <div
                    key={persona.username}
                    onClick={() => handleSelectPersona(persona.username)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-[#0D0E12] text-white border-zinc-900 shadow-md"
                        : "bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-zinc-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                        {persona.avatar_url ? (
                          <img
                            src={persona.avatar_url}
                            alt={persona.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{persona.username.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans font-bold text-xs truncate">
                            {persona.full_name || persona.username}
                          </span>
                          <span
                            className={`font-mono text-[10px] truncate ${
                              isSelected ? "text-amber-300" : "text-zinc-500"
                            }`}
                          >
                            @{persona.username}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] truncate font-sans ${
                            isSelected ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          {persona.bio}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-amber-400/20 text-amber-300 border border-amber-300/30"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {persona.reputation_score} rep
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check size={12} />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400 hover:text-black">
                          Switch →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-1.5 border-t border-zinc-100">
          <ShieldCheck size={12} className="text-zinc-400" />
          <span>Open-source passport • Row Level Security (RLS) protected</span>
        </div>
      </div>
    </div>
  );
}
