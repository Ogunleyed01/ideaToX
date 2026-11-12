"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User as UserIcon,
  AtSign,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Wand2,
} from "lucide-react";
import {
  createClient,
  isSupabaseConfigured,
  getAuthProviderCapabilities,
  sanitizeUsernameHandle,
  ensureProfileExists,
  type AuthCapabilities,
} from "@/lib/supabase/client";

export type AuthFormMode =
  | "signin"
  | "signup"
  | "magic"
  | "forgot"
  | "reset-password";

interface AuthPassportFormProps {
  initialMode?: AuthFormMode;
  nextPath?: string;
  reason?: string;
  initialError?: string | null;
  onSuccess?: () => void;
  variant?: "modal" | "page";
}

function sanitizeSafeNext(raw?: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/profile";
  }
  return raw;
}

export function AuthPassportForm({
  initialMode = "signin",
  nextPath,
  reason,
  initialError = null,
  onSuccess,
  variant = "modal",
}: AuthPassportFormProps) {
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();
  const [modeState, setModeState] = useState<{
    base: AuthFormMode;
    current: AuthFormMode;
  }>({ base: initialMode, current: initialMode });
  const mode = modeState.base === initialMode ? modeState.current : initialMode;
  const setMode = (nextMode: AuthFormMode) =>
    setModeState({ base: initialMode, current: nextMode });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"github" | "google" | null>(
    null
  );
  const [errorState, setErrorState] = useState<{
    base: string | null;
    current: string | null;
  }>({ base: initialError, current: initialError });
  const errorMessage = errorState.base === initialError ? errorState.current : initialError;
  const setErrorMessage = (nextError: string | null) =>
    setErrorState({ base: initialError, current: nextError });

  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null);

  useEffect(() => {
    let active = true;
    getAuthProviderCapabilities().then((caps) => {
      if (active) setCapabilities(caps);
    });
    return () => {
      active = false;
    };
  }, []);

  const derivedHandle = sanitizeUsernameHandle(
    usernameInput || (email.includes("@") ? email.split("@")[0] : "")
  );

  const resolveCallbackUrl = (extraNext?: string) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const safeNext = sanitizeSafeNext(extraNext ?? nextPath ?? "/profile");
    return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
  };

  const completeSignInNavigation = () => {
    const target = sanitizeSafeNext(nextPath);
    if (onSuccess) {
      onSuccess();
    }
    if (variant === "page") {
      router.replace(target);
    } else if (nextPath) {
      router.push(target);
    }
    router.refresh();
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!isConfigured) {
      setErrorMessage("Supabase environment variables are not configured.");
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("Enter both your email address and password.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErrorMessage(
          error.message.includes("Email not confirmed")
            ? "Please verify your email address from the confirmation link we sent you (or use Magic Link)."
            : error.message
        );
        return;
      }
      if (data.user) {
        await ensureProfileExists(data.user);
      }
      completeSignInNavigation();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to sign in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!isConfigured) {
      setErrorMessage("Supabase environment variables are not configured.");
      return;
    }

    if (!email.trim() || password.length < 6) {
      setErrorMessage("Provide a valid email and a password of at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: resolveCallbackUrl(),
          data: {
            full_name: fullName.trim() || derivedHandle,
            username: derivedHandle,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session && data.user) {
        await ensureProfileExists(data.user);
        completeSignInNavigation();
      } else {
        setSuccessNotice(
          `Confirmation link dispatched to ${email.trim()}. Open the email to activate @${derivedHandle} and finish signing in.`
        );
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to create account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!isConfigured) {
      setErrorMessage("Supabase environment variables are not configured.");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Enter your email address to receive a one-click sign-in link.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: resolveCallbackUrl(),
          data: {
            username: derivedHandle,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessNotice(
        `Magic sign-in link sent to ${email.trim()}. Open it on this browser to authenticate immediately.`
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to send magic link."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email.trim()) {
      setErrorMessage("Enter the email associated with your IdeaToX account.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth?mode=reset-password")}`,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccessNotice(
        `Password reset link sent to ${email.trim()}. Follow the link in your inbox to set a new password.`
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to initiate password reset."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (password.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setSuccessNotice("Password updated successfully! Redirecting to your builder profile...");
      setTimeout(() => {
        completeSignInNavigation();
      }, 900);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: "github" | "google") => {
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!isConfigured) {
      setErrorMessage("Supabase environment variables are not configured.");
      return;
    }

    if (capabilities && !capabilities[provider]) {
      const label = provider === "github" ? "GitHub" : "Google";
      setErrorMessage(
        `${label} OAuth is currently disabled in your Supabase Dashboard (Authentication → Providers). Use Email/Password or Magic Link above, or enable ${label} in Supabase first.`
      );
      return;
    }

    setLoadingProvider(provider);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: resolveCallbackUrl(),
        },
      });
      if (error) {
        setErrorMessage(error.message);
        setLoadingProvider(null);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to initiate OAuth sign-in."
      );
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-5 relative z-10">
      {/* Reason banner if triggered by auth guard */}
      {reason && (
        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <Sparkles size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-snug font-sans">{reason}</span>
        </div>
      )}

      {/* Offline Sandbox Warning (only if .env is missing/placeholder) */}
      {!isConfigured && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-mono space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles size={13} className="text-amber-600" />
            <span>Offline Fallback Mode</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
            Add live Supabase keys to <code>.env.local</code> to enable real developer accounts and cloud persistence.
          </p>
        </div>
      )}

      {/* Mode Switcher Tabs */}
      {mode !== "reset-password" && (
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 border border-zinc-200/80 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMessage(null);
              setSuccessNotice(null);
            }}
            className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              mode === "signin" || mode === "forgot"
                ? "bg-white text-[#111113] shadow-2xs"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
              setSuccessNotice(null);
            }}
            className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white text-[#111113] shadow-2xs"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("magic");
              setErrorMessage(null);
              setSuccessNotice(null);
            }}
            className={`py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              mode === "magic"
                ? "bg-white text-[#111113] shadow-2xs"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            Magic Link
          </button>
        </div>
      )}

      {/* Error & Success Feedback */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span className="leading-snug font-sans">{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
          <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-600" />
          <span className="leading-snug font-sans">{successNotice}</span>
        </div>
      )}

      {/* MODE: SIGN IN */}
      {mode === "signin" && (
        <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Developer Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@domain.dev"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setErrorMessage(null);
                }}
                className="font-mono text-[10px] text-amber-800 hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className="w-full h-11 rounded-2xl bg-[#111113] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? "Authenticating..." : "Sign In to Passport"}</span>
            <ArrowRight size={14} className="text-amber-300" />
          </button>
        </form>
      )}

      {/* MODE: CREATE ACCOUNT */}
      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                Handle
              </label>
              <div className="relative">
                <AtSign
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="alex_systems"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] font-mono text-zinc-500">
            Claimed profile URL: <span className="text-zinc-800 font-semibold">/profile/{derivedHandle}</span>
          </p>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@domain.dev"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Password (min 6 chars)
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className="w-full h-11 rounded-2xl bg-[#111113] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? "Provisioning Passport..." : "Create Developer Passport"}</span>
            <ArrowRight size={14} className="text-amber-300" />
          </button>
        </form>
      )}

      {/* MODE: MAGIC LINK */}
      {mode === "magic" && (
        <form onSubmit={handleMagicLink} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Email for Passwordless Link
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@domain.dev"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className="w-full h-11 rounded-2xl bg-[#111113] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Wand2 size={14} className="text-amber-300" />
            <span>{submitting ? "Sending Link..." : "Send Magic Sign-In Link"}</span>
          </button>
        </form>
      )}

      {/* MODE: FORGOT PASSWORD */}
      {mode === "forgot" && (
        <form onSubmit={handleForgotPassword} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Account Email
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@domain.dev"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className="w-full h-11 rounded-2xl bg-[#111113] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <KeyRound size={14} className="text-amber-300" />
            <span>{submitting ? "Sending Recovery Email..." : "Send Password Reset Link"}</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("signin")}
            className="w-full text-center font-mono text-[11px] text-zinc-500 hover:text-black cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </form>
      )}

      {/* MODE: RESET PASSWORD */}
      {mode === "reset-password" && (
        <form onSubmit={handleUpdatePassword} className="space-y-3.5">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-2xl bg-[#111113] hover:bg-zinc-800 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <span>{submitting ? "Updating Password..." : "Save New Password"}</span>
          </button>
        </form>
      )}

      {/* OAuth Divider + Ready-to-Enable Buttons */}
      {mode !== "reset-password" && (
        <>
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-zinc-200" />
            <span className="shrink mx-3 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Or continue with OAuth
            </span>
            <div className="flex-grow border-t border-zinc-200" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={Boolean(loadingProvider)}
              className="h-10 px-3 rounded-xl bg-[#0D0E12] hover:bg-zinc-800 text-white font-mono text-[11px] font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>
                {loadingProvider === "github" ? "Connecting..." : "GitHub"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={Boolean(loadingProvider)}
              className="h-10 px-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 font-mono text-[11px] font-semibold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>
                {loadingProvider === "google" ? "Connecting..." : "Google"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
