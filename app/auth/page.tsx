"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Terminal, Sparkles } from "lucide-react";
import {
  AuthPassportForm,
  type AuthFormMode,
} from "@/components/auth-passport-form";
import { ObsidianMegaFooter } from "@/components/obsidian-mega-footer";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawMode = searchParams.get("mode");
  const nextPath = searchParams.get("next") || "/profile";
  const reasonCode = searchParams.get("reason");
  const authError = searchParams.get("auth_error");

  const validModes: AuthFormMode[] = [
    "signin",
    "signup",
    "magic",
    "forgot",
    "reset-password",
  ];
  const initialMode: AuthFormMode =
    rawMode && validModes.includes(rawMode as AuthFormMode)
      ? (rawMode as AuthFormMode)
      : "signin";

  const reasonMessage =
    reasonCode === "auth_required"
      ? `Authentication is required to access ${nextPath}. Sign in or create a developer passport to continue.`
      : undefined;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111113] selection:bg-amber-100 selection:text-amber-900 relative overflow-x-hidden flex flex-col justify-between">
      {/* Subtle Dot Matrix */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: "radial-gradient(#D4D4D8 1.15px, transparent 1.15px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Ambient Editorial Glows */}
      <div className="fixed -top-36 -left-36 w-[520px] h-[520px] rounded-full pointer-events-none z-0 blur-[130px] opacity-35 bg-[radial-gradient(circle,rgba(165,180,252,0.45)_0%,transparent_70%)]" />
      <div className="fixed top-1/3 -right-36 w-[480px] h-[480px] rounded-full pointer-events-none z-0 blur-[140px] opacity-30 bg-[radial-gradient(circle,rgba(253,224,71,0.40)_0%,transparent_70%)]" />

      {/* Top Navigation Strip */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-zinc-300 text-xs font-mono font-semibold text-zinc-700 hover:text-black transition-colors shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>DISCOVERY FEED</span>
        </Link>

        <Link href="/ideas" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#111113] flex items-center justify-center border border-zinc-800 shadow-xs">
            <span className="font-mono text-xs font-bold text-amber-300">&gt;</span>
          </div>
          <span className="font-sans font-bold text-base tracking-tight text-[#111113]">
            IdeaTo<span className="text-amber-700">X</span>
          </span>
        </Link>
      </header>

      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Editorial Identity Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 shadow-xs text-[11px] font-mono font-semibold text-zinc-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PRODUCTION PASSPORT // SUPABASE AUTH</span>
          </div>

          <h1 className="font-sans font-bold text-3xl sm:text-5xl tracking-[-0.03em] text-[#111113] leading-[1.08]">
            Ship blueprints under your{" "}
            <span className="font-serif italic font-normal text-amber-700">
              verified builder identity
            </span>
            .
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-lg">
            Authenticate to publish original software specifications, branch lineage forks, review Feature PRs on your specs, showcase live repositories, and sync your reading list across sessions.
          </p>

          <div className="rounded-2xl bg-[#0D0E12] text-white p-5 border border-zinc-800/90 space-y-3 shadow-lg max-w-md">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Terminal size={12} />
                PASSPORT CAPABILITIES
              </span>
              <span className="text-emerald-400">RLS VERIFIED</span>
            </div>
            <ul className="space-y-2 text-xs font-mono text-zinc-300">
              <li className="flex items-center gap-2">
                <Sparkles size={12} className="text-amber-400 shrink-0" />
                <span>Verified author attribution &amp; reputation ledger</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={12} className="text-amber-400 shrink-0" />
                <span>Maintainer PR merge &amp; team approval rights</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={12} className="text-amber-400 shrink-0" />
                <span>Cloud-synced stars, bookmarks &amp; Builder Inbox</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Passport Auth Card */}
        <div className="lg:col-span-6">
          <div className="rounded-[28px] bg-white border border-zinc-200/90 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.08)] p-6 sm:p-8 space-y-5 relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full blur-2xl opacity-35 bg-gradient-to-br from-amber-200 to-yellow-100"
            />

            <div className="relative z-10">
              <h2 className="text-xl font-sans font-bold text-[#111113]">
                {initialMode === "reset-password"
                  ? "Set Your New Password"
                  : "Sign in or Create Account"}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {initialMode === "reset-password"
                  ? "Enter a strong replacement password for your IdeaToX passport."
                  : "Choose Email & Password, Passwordless Magic Link, or OAuth."}
              </p>
            </div>

            <AuthPassportForm
              initialMode={initialMode}
              nextPath={nextPath}
              reason={reasonMessage}
              initialError={authError}
              onSuccess={() => router.refresh()}
              variant="page"
            />
          </div>
        </div>
      </main>

      <ObsidianMegaFooter />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-xs text-zinc-500">
          INITIALIZING DEVELOPER PASSPORT...
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
