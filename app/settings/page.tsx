"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Globe,
  Code2,
  Mail,
  MessageSquare,
  Sparkles,
  Plus,
  X,
  ArrowUpRight,
  Sliders,
  ShieldCheck,
  User,
  AlertCircle,
  KeyRound,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ObsidianMegaFooter } from "@/components/obsidian-mega-footer";
import {
  getActiveBuilderProfile,
  updateUserProfile,
  resetUserProfile,
} from "@/lib/ideas";
import { createClient, sanitizeUsernameHandle } from "@/lib/supabase/client";
import { IdeaAuthor } from "@/types/idea";

const AVAILABILITY_OPTIONS = [
  {
    value: "Open to Co-Founding",
    desc: "Ready to team up on high-leverage MVP builds.",
    dot: "bg-emerald-400",
  },
  {
    value: "Seeking Side-Projects",
    desc: "Looking for weekend sprints & open-source PRs.",
    dot: "bg-amber-400",
  },
  {
    value: "Available for Freelance",
    desc: "Taking scoped architectural consulting & builds.",
    dot: "bg-cyan-400",
  },
  {
    value: "Mentoring Only",
    desc: "Happy to review specs & give architecture feedback.",
    dot: "bg-purple-400",
  },
  {
    value: "Heads-Down Shipping",
    desc: "Deep in build mode; notifications selectively read.",
    dot: "bg-zinc-400",
  },
];

const STACK_PRESETS = [
  "Next.js",
  "TypeScript",
  "React",
  "Tailwind CSS",
  "Supabase",
  "PostgreSQL",
  "SQLite",
  "Rust",
  "Go",
  "Python",
  "Node.js",
  "Docker",
  "WebAssembly",
  "ESP32",
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupMode =
    searchParams.get("setup") === "profile" ||
    searchParams.get("welcome") === "true";

  const {
    user,
    profile: authProfile,
    isConfigured,
    isAuthenticated,
    loading: authLoading,
    refreshAuth,
    signOut,
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [usernameInput, setUsernameInput] = useState("you_builder");
  const [dismissSetupNotice, setDismissSetupNotice] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Sign-out error:", err);
      setIsSigningOut(false);
    }
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState<IdeaAuthor>({
    username: "you_builder",
    full_name: "",
    headline: "",
    avatar_url: "",
    bio: "",
    email: "",
    availability: "Open to Co-Founding",
    preferred_stack: [],
    github_url: "",
    twitter_url: "",
    discord_url: "",
    website_url: "",
    location: "",
    reputation_score: 520,
    badges: ["Ideator", "Remixer", "Shipper"],
  });

  useEffect(() => {
    if (!authLoading && isConfigured && !isAuthenticated) {
      router.replace("/auth?next=/settings&reason=auth_required");
    }
  }, [authLoading, isConfigured, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || (isConfigured && !isAuthenticated)) return;

    let active = true;
    async function init() {
      const profile = await getActiveBuilderProfile(authProfile?.username);
      if (!active) return;
      setForm({
        ...profile,
        full_name: profile.full_name || "",
        headline: profile.headline || "",
        avatar_url: profile.avatar_url || "",
        bio: profile.bio || "",
        email: profile.email || "",
        availability: profile.availability || "Open to Co-Founding",
        preferred_stack: profile.preferred_stack || [],
        github_url: profile.github_url || "",
        twitter_url: profile.twitter_url || "",
        discord_url: profile.discord_url || "",
        website_url: profile.website_url || "",
        location: profile.location || "",
      });
      setUsernameInput(profile.username || "you_builder");
      setLoading(false);
    }
    void init();
    return () => {
      active = false;
    };
  }, [authLoading, isConfigured, isAuthenticated, authProfile?.username]);

  const showToast = (msg: string) => {
    setErrorNotice(null);
    setSavedNotice(msg);
    setTimeout(() => {
      setSavedNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  const toggleStackTag = (tag: string) => {
    const current = form.preferred_stack || [];
    if (current.includes(tag)) {
      setForm({ ...form, preferred_stack: current.filter((t) => t !== tag) });
    } else if (current.length < 12) {
      setForm({ ...form, preferred_stack: [...current, tag] });
    }
  };

  const handleAddCustomTag = () => {
    const clean = customTag.trim();
    if (!clean) return;
    const current = form.preferred_stack || [];
    if (!current.some((t) => t.toLowerCase() === clean.toLowerCase()) && current.length < 12) {
      setForm({ ...form, preferred_stack: [...current, clean] });
    }
    setCustomTag("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorNotice(null);
    try {
      const updated = await updateUserProfile({
        username: form.username,
        newUsername: usernameInput,
        full_name: form.full_name?.trim() || usernameInput,
        headline: form.headline?.trim(),
        avatar_url: form.avatar_url?.trim() || undefined,
        bio: form.bio?.trim(),
        email: form.email?.trim() || undefined,
        availability: form.availability,
        preferred_stack: form.preferred_stack || [],
        github_url: form.github_url?.trim() || undefined,
        twitter_url: form.twitter_url?.trim() || undefined,
        discord_url: form.discord_url?.trim() || undefined,
        website_url: form.website_url?.trim() || undefined,
        location: form.location?.trim() || "Global",
      });
      setForm(updated);
      setUsernameInput(updated.username);
      await refreshAuth();
      showToast(
        isAuthenticated
          ? "Developer profile saved and synced with Supabase."
          : "Developer profile updated locally across IdeaToX."
      );
    } catch (err) {
      setErrorNotice(
        err instanceof Error ? err.message : "Failed to save profile settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaults = resetUserProfile(form.username);
    setForm({
      ...defaults,
      preferred_stack: defaults.preferred_stack || [],
    });
    setUsernameInput(defaults.username);
    showToast("Local profile overrides restored to defaults.");
  };

  const handlePasswordUpdate = async () => {
    setPasswordNotice(null);
    if (!isConfigured || !user) return;
    if (newPassword.length < 6) {
      setPasswordNotice({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }
    setPasswordSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice({
        type: "success",
        text: "Account password updated successfully.",
      });
    } catch (err) {
      setPasswordNotice({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const selectedAvailability =
    AVAILABILITY_OPTIONS.find((a) => a.value === form.availability) ||
    AVAILABILITY_OPTIONS[0];

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

      <FloatingNavbar onOpenSearch={() => router.push("/ideas")} />

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 flex-1">
        {/* Top Page Title & Sync Pill */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 shadow-sm text-[11px] font-mono font-semibold text-zinc-700 mb-4">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>BUILDER IDENTITY // ACCOUNT PREFERENCES</span>
            </div>
            <h1 className="font-sans font-bold text-3xl sm:text-5xl tracking-[-0.03em] text-[#111113] leading-[1.08]">
              Developer{" "}
              <span className="font-serif italic font-normal text-amber-700">
                Profile &amp; Settings
              </span>
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-zinc-600 max-w-2xl">
              Customize how your architect card, availability beacon, and engineering channels appear on published blueprints, PRs, and collaboration pitches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-mono text-[11px] font-semibold ${
                isAuthenticated
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAuthenticated ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {isAuthenticated
                ? "LIVE SUPABASE + LOCAL SYNC"
                : "LOCAL PERSISTENCE MODE"}
            </span>

            <Link
              href={`/profile/${encodeURIComponent(form.username)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-xs font-mono font-semibold text-[#111113] shadow-sm transition-colors"
            >
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>VIEW PUBLIC PROFILE</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </div>
        </div>

        {/* New Account First-Time Profile Setup Banner */}
        {isSetupMode && !dismissSetupNotice && (
          <aside
            aria-label="Welcome new account setup"
            className="mb-8 rounded-2xl bg-amber-50/90 border border-amber-300 p-5 sm:p-6 shadow-sm relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                      WELCOME NEW ARCHITECT
                    </span>
                    <h2 className="text-base font-semibold text-zinc-900 font-sans">
                      Setup your Architect Profile &amp; Preferences
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed mt-1">
                    Your account has been initialized with default placeholders. Take 30 seconds to choose your public @handle, engineering headline, bio, and preferred stack below so other builders and founders can discover and collaborate with you.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissSetupNotice(true)}
                className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Dismiss welcome message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}

        {/* Save Status Toast Banner */}
        {savedNotice && (
          <div className="mb-8 rounded-2xl bg-[#0D0E12] text-white px-5 py-3.5 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{savedNotice}</span>
            </div>
            <Link
              href={`/profile/${encodeURIComponent(form.username)}`}
              className="font-mono text-xs text-amber-300 hover:text-amber-200 inline-flex items-center gap-1 shrink-0"
            >
              <span>Inspect updated profile</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {errorNotice && (
          <div className="mb-8 rounded-2xl bg-rose-50 text-rose-900 px-5 py-3.5 border border-rose-200 shadow-sm flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}

        {loading ? (
          <div className="rounded-[28px] bg-white border border-zinc-200/80 p-16 text-center font-mono text-xs text-zinc-500">
            LOADING BUILDER TELEMETRY CONFIGURATION...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: OBSIDIAN LIVE CARD PREVIEW */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
              <div className="rounded-[28px] bg-[#0D0E12] text-white p-6 border border-white/[0.1] shadow-2xl relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-30 bg-amber-400/40"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                      LIVE ARCHITECT BADGE
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.07] border border-white/[0.1] font-mono text-[10px] text-zinc-200">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${selectedAvailability.dot}`}
                      />
                      {form.availability || "Open to Co-Founding"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/15 overflow-hidden flex items-center justify-center font-mono font-bold text-lg text-amber-300 shrink-0">
                      {form.avatar_url ? (
                        <img
                          src={form.avatar_url}
                          alt={form.full_name || form.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{form.username.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-sans font-bold text-white truncate">
                        {form.full_name || form.username}
                      </h2>
                      <p className="font-mono text-xs text-amber-300 truncate">
                        @{form.username}
                      </p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {form.headline || "Full-Stack Systems Architect"}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-zinc-300 leading-relaxed line-clamp-3">
                    {form.bio ||
                      "Add a concise engineering bio so collaborators know what systems you love building."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {form.location || "Global"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <ShieldCheck className="w-3 h-3" />
                      {form.reputation_score ?? 520} rep
                    </span>
                  </div>

                  {/* Stack Pills Preview */}
                  {(form.preferred_stack?.length ?? 0) > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/[0.08]">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                        PREFERRED STACK
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {form.preferred_stack!.slice(0, 6).map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.08] font-mono text-[10px] text-zinc-200"
                          >
                            {tech}
                          </span>
                        ))}
                        {form.preferred_stack!.length > 6 && (
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.05] font-mono text-[10px] text-zinc-400">
                            +{form.preferred_stack!.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Channel Presence */}
                  <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-wrap gap-2">
                    {form.github_url && (
                      <span className="px-2 py-1 rounded-lg bg-white/[0.06] font-mono text-[10px] text-zinc-300">
                        GitHub Linked
                      </span>
                    )}
                    {form.discord_url && (
                      <span className="px-2 py-1 rounded-lg bg-white/[0.06] font-mono text-[10px] text-zinc-300">
                        Discord: {form.discord_url}
                      </span>
                    )}
                    {form.website_url && (
                      <span className="px-2 py-1 rounded-lg bg-white/[0.06] font-mono text-[10px] text-zinc-300">
                        Website Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Avatar Quick Presets */}
              <div className="rounded-[24px] bg-white border border-zinc-200/80 p-5 shadow-sm">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-3">
                  QUICK PORTRAIT PRESETS
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((url, idx) => {
                    const selected = form.avatar_url === url;
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setForm({ ...form, avatar_url: url })}
                        aria-label={`Select portrait preset ${idx + 1}`}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selected
                            ? "border-[#111113] scale-105 shadow-md"
                            : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Avatar preset ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: FORM MODULES */}
            <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
              {/* Module 1: Identity & Bio */}
              <section className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 font-bold">
                      01 // CORE IDENTITY
                    </span>
                    <h2 className="text-lg font-sans font-bold text-[#111113]">
                      Builder Persona &amp; Manifesto Bio
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 font-mono text-[11px] font-semibold text-zinc-600">
                    @{sanitizeUsernameHandle(usernameInput || form.username)}
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="settings-username"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                  >
                    Public Developer Handle (@username)
                  </label>
                  <div className="flex items-center rounded-xl border border-zinc-200 bg-[#FAF9F6] px-3.5 focus-within:ring-2 focus-within:ring-amber-400/50 focus-within:border-amber-500">
                    <span className="font-mono text-sm text-zinc-400 mr-1">@</span>
                    <input
                      id="settings-username"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="your_handle"
                      className="w-full py-2.5 bg-transparent font-mono text-sm text-[#111113] focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] font-mono text-zinc-400">
                    Profile URL: /profile/{sanitizeUsernameHandle(usernameInput || form.username)} (lowercase letters, digits, underscores)
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="settings-full-name"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      Display Name
                    </label>
                    <input
                      id="settings-full-name"
                      type="text"
                      value={form.full_name || ""}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="e.g. Tunde Adebayo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-sm text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-location"
                      className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      Region / Timezone
                    </label>
                    <input
                      id="settings-location"
                      type="text"
                      value={form.location || ""}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Lagos, Nigeria (WAT)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-sm text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="settings-headline"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                  >
                    Architectural Headline
                  </label>
                  <input
                    id="settings-headline"
                    type="text"
                    value={form.headline || ""}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    placeholder="e.g. Staff Systems Engineer · Offline-First CRDTs"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-sm text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="settings-bio"
                      className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600"
                    >
                      Engineering Focus / Bio
                    </label>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {(form.bio || "").length}/280
                    </span>
                  </div>
                  <textarea
                    id="settings-bio"
                    rows={3}
                    maxLength={280}
                    value={form.bio || ""}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Describe the systems, tools, and problem domains you specialize in..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-sm text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500 resize-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="settings-avatar-url"
                    className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                  >
                    Custom Avatar Image URL
                  </label>
                  <input
                    id="settings-avatar-url"
                    type="url"
                    value={form.avatar_url || ""}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500"
                  />
                </div>
              </section>

              {/* Module 2: Availability & Stack */}
              <section className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="pb-4 border-b border-zinc-100">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 font-bold">
                    02 // COLLABORATION SIGNAL
                  </span>
                  <h2 className="text-lg font-sans font-bold text-[#111113]">
                    Availability Status &amp; Preferred Stack
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABILITY_OPTIONS.map((opt) => {
                    const selected = form.availability === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, availability: opt.value })}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          selected
                            ? "bg-[#0D0E12] text-white border-[#0D0E12] shadow-md"
                            : "bg-[#FAF9F6] text-[#111113] border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-xs font-sans font-bold">
                            <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                            {opt.value}
                          </span>
                          {selected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          )}
                        </div>
                        <p
                          className={`mt-1 text-[11px] leading-snug ${
                            selected ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                      Preferred Engineering Stack ({form.preferred_stack?.length || 0}/12)
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {STACK_PRESETS.map((tech) => {
                      const active = form.preferred_stack?.includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => toggleStackTag(tech)}
                          className={`px-3 py-1.5 rounded-full font-mono text-xs transition-colors cursor-pointer border ${
                            active
                              ? "bg-[#111113] text-white border-[#111113]"
                              : "bg-[#FAF9F6] text-zinc-700 border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          {active ? `✓ ${tech}` : `+ ${tech}`}
                        </button>
                      );
                    })}

                    {/* Render custom user-added tags not in presets */}
                    {(form.preferred_stack || [])
                      .filter((t) => !STACK_PRESETS.includes(t))
                      .map((custom) => (
                        <button
                          key={custom}
                          type="button"
                          onClick={() => toggleStackTag(custom)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs cursor-pointer"
                        >
                          <span>{custom}</span>
                          <X className="w-3 h-3" />
                        </button>
                      ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomTag();
                        }
                      }}
                      placeholder="Add custom framework or tool (e.g. Drizzle, Zig)..."
                      className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-mono font-semibold text-zinc-800 border border-zinc-200 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Module 3: Social & Collaboration Links */}
              <section className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="pb-4 border-b border-zinc-100">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-700 font-bold">
                    03 // CHANNELS &amp; HANDLES
                  </span>
                  <h2 className="text-lg font-sans font-bold text-[#111113]">
                    Developer Links &amp; Contact Endpoints
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="settings-github"
                      className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                      GitHub Profile URL
                    </label>
                    <input
                      id="settings-github"
                      type="url"
                      value={form.github_url || ""}
                      onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-twitter"
                      className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      <span className="text-zinc-400">𝕏</span>
                      X / Twitter URL
                    </label>
                    <input
                      id="settings-twitter"
                      type="url"
                      value={form.twitter_url || ""}
                      onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                      placeholder="https://x.com/handle"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-discord"
                      className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                      Discord Handle
                    </label>
                    <input
                      id="settings-discord"
                      type="text"
                      value={form.discord_url || ""}
                      onChange={(e) => setForm({ ...form, discord_url: e.target.value })}
                      placeholder="e.g. you_builder#0402"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="settings-website"
                      className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      <Globe className="w-3.5 h-3.5 text-zinc-400" />
                      Portfolio / Website
                    </label>
                    <input
                      id="settings-website"
                      type="url"
                      value={form.website_url || ""}
                      onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                      placeholder="https://your-domain.dev"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="settings-email"
                      className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                    >
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      Public Collaboration Email
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      value={form.email || ""}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="builder@ideatox.dev"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                </div>
              </section>

              {/* Module 4: Account Security, Password & Session */}
              {isConfigured && user && (
                <section className="rounded-[28px] bg-white border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-100">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-amber-700 font-bold">
                        04 // ACCOUNT SECURITY &amp; PASSPORT
                      </span>
                      <h2 className="text-lg font-sans font-bold text-[#111113]">
                        Authentication Credentials &amp; Session
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 font-mono text-[11px] font-semibold text-emerald-800">
                      {user.email || "Authenticated Session"}
                    </span>
                  </div>

                  {passwordNotice && (
                    <div
                      className={`rounded-xl px-4 py-2.5 border text-xs font-medium flex items-center gap-2 ${
                        passwordNotice.type === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : "bg-rose-50 border-rose-200 text-rose-900"
                      }`}
                    >
                      {passwordNotice.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{passwordNotice.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="settings-new-password"
                        className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                        New Account Password
                      </label>
                      <input
                        id="settings-new-password"
                        type="password"
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="settings-confirm-password"
                        className="block font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5"
                      >
                        Confirm New Password
                      </label>
                      <input
                        id="settings-confirm-password"
                        type="password"
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF9F6] text-xs font-mono text-[#111113] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      disabled={passwordSaving || !newPassword}
                      onClick={() => void handlePasswordUpdate()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                      <span>{passwordSaving ? "Updating..." : "Update Password"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSigningOut}
                      onClick={() => void handleSignOut()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 border border-rose-200 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className={`w-3.5 h-3.5 ${isSigningOut ? "animate-spin text-rose-600" : ""}`} />
                      <span>{isSigningOut ? "Signing Out..." : "Sign Out of IdeaToX"}</span>
                    </button>
                  </div>
                </section>
              )}

              {/* Save / Reset Controls */}
              <div className="rounded-[24px] bg-white border border-zinc-200/90 px-6 py-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111113] hover:bg-zinc-800 disabled:opacity-60 text-white text-xs sm:text-sm font-sans font-semibold transition-all shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{saving ? "Saving Identity..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <ObsidianMegaFooter />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-600 font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>LOADING BUILDER TELEMETRY SETTINGS...</span>
          </div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
