"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  GitFork,
  Rocket,
  ShieldCheck,
  Star,
  Globe,
  MapPin,
  Calendar,
  ExternalLink,
  Code2,
  Copy,
  Check,
  Share2,
  AlertCircle,
  Plus,
  Terminal,
  Award,
  Layers,
  CheckCircle2,
  ArrowRight,
  Settings,
  Mail,
  MessageSquare,
} from "lucide-react";
import { getUserProfile, subscribeProfileUpdates } from "@/lib/ideas";
import { UserProfileData, Idea } from "@/types/idea";
import { IdeaCard } from "@/components/idea-card";
import { ForkModal } from "@/components/fork-modal";
import { ObsidianMegaFooter } from "@/components/obsidian-mega-footer";

function UserProfileContent() {
  const params = useParams();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"specs" | "forks" | "builds" | "starred" | "reputation">("specs");
  const [forkModalIdea, setForkModalIdea] = useState<Idea | null>(null);

  // Interaction toasts
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!username) return;
      setLoading(true);
      const data = await getUserProfile(username);
      setProfile(data);
      setLoading(false);
    }
    loadProfile();
    return subscribeProfileUpdates(() => {
      loadProfile();
    });
  }, [username]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setToastMessage("Profile URL copied to clipboard!");
      setTimeout(() => {
        setCopiedLink(false);
        setToastMessage(null);
      }, 3500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-600 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>DECODING ARCHITECT TELEMETRY PROFILE...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-sans font-bold text-[#111113] mb-2">Builder Profile Not Found</h2>
        <p className="text-sm text-zinc-500 max-w-md mb-6 font-sans">
          The requested profile @{username} does not currently have public specifications or activity recorded on IdeaToX.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111113] text-white font-medium text-xs hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Discovery Feed
        </Link>
      </div>
    );
  }

  const { author, specs, forks, builds, starred = [], stats } = profile;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111113] selection:bg-amber-100 selection:text-amber-900 flex flex-col justify-between">
      {/* =========================================================================
          TOP NAVIGATION BAR
         ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-700 hover:text-black transition-colors px-3 py-1.5 rounded-full bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>DISCOVERY FEED</span>
          </Link>

          <span className="hidden sm:inline-block font-mono text-xs text-zinc-300">/</span>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-zinc-500 tracking-wider">
            <span className="uppercase text-amber-700 font-bold">ARCHITECT //</span>
            <span className="text-zinc-800 truncate max-w-[200px] font-semibold">@{author.username}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-mono font-medium transition-colors shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">EDIT PROFILE</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-mono font-medium transition-colors shadow-sm cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500" />}
            <span className="hidden sm:inline">{copiedLink ? "COPIED" : "SHARE PROFILE"}</span>
          </button>

          <Link
            href="/ideas/new"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#111113] hover:bg-zinc-800 text-white text-xs font-mono font-medium transition-all shadow-sm group"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>PUBLISH SPEC</span>
          </Link>
        </div>
      </header>

      {/* =========================================================================
          PROFILE HERO BANNER & IDENTITY
         ========================================================================= */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1 space-y-10">
        <section className="relative rounded-[28px] bg-white border border-zinc-200/90 p-6 sm:p-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Subtle Dual Aurora Background Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-20 w-80 h-80 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-indigo-300 via-purple-200 to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 rounded-full blur-3xl opacity-35 bg-gradient-to-br from-amber-200 via-yellow-100 to-transparent"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
              {/* Avatar with obsidian border */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#0D0E12] border-2 border-zinc-200/80 shadow-lg overflow-hidden flex items-center justify-center font-bold text-white text-2xl shrink-0">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{author.username.slice(0, 2).toUpperCase()}</span>
                )}
              </div>

              {/* Names & Bio */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[#111113]">
                    {author.full_name || author.username}
                  </h1>
                  <span className="font-mono text-xs text-zinc-500 font-medium">
                    @{author.username}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-mono text-amber-900 font-bold">
                    {stats.rankTitle}
                  </span>
                  {author.availability && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {author.availability}
                    </span>
                  )}
                </div>

                {author.headline && (
                  <p className="font-mono text-xs font-semibold text-zinc-700">
                    {author.headline}
                  </p>
                )}

                <p className="text-sm text-[#52525B] max-w-2xl leading-relaxed font-sans">
                  {author.bio || "Systems engineer & software architect. Designing modular blueprints and open-source production architectures."}
                </p>

                {/* Metadata & Location */}
                <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 flex-wrap pt-1">
                  {author.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{author.location}</span>
                    </div>
                  )}
                  {author.joined_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Joined {author.joined_date}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    <span>{stats.reputation} Rep Points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* External Links Pill Container */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-start md:justify-end">
              {author.github_url && (
                <a
                  href={author.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-medium transition-colors border border-zinc-200/80"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
              {author.twitter_url && (
                <a
                  href={author.twitter_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-medium transition-colors border border-zinc-200/80"
                >
                  <span>𝕏 / Twitter</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
              {author.website_url && (
                <a
                  href={author.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-medium transition-colors border border-zinc-200/80"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}
              {author.discord_url && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-mono font-medium border border-indigo-200/80">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{author.discord_url}</span>
                </span>
              )}
              {author.email && (
                <a
                  href={`mailto:${author.email}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono font-medium transition-colors border border-zinc-200/80"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              )}
            </div>
          </div>

          {/* DYNAMIC DEVELOPER BADGES & STACK ROW */}
          <div className="mt-6 pt-5 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold shrink-0">
                EARNED BADGES:
              </span>

              {author.badges?.includes("Ideator") && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px] font-semibold">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Ideator</span>
                </div>
              )}

              {author.badges?.includes("Remixer") && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono text-[11px] font-semibold">
                  <GitFork className="w-3 h-3 text-cyan-600" />
                  <span>Remixer</span>
                </div>
              )}

              {author.badges?.includes("Shipper") && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px] font-semibold">
                  <Rocket className="w-3 h-3 text-emerald-600" />
                  <span>Shipper</span>
                </div>
              )}

              {author.badges?.includes("Architect") && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-mono text-[11px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Architect</span>
                </div>
              )}
            </div>

            {(author.preferred_stack?.length ?? 0) > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold mr-1">
                  STACK:
                </span>
                {author.preferred_stack!.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/80 font-mono text-[11px] text-zinc-700 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            HIGH-CRAFT OBSIDIAN TELEMETRY CONSOLE
           ========================================================================= */}
        <section className="rounded-[24px] bg-[#0D0E12] text-white p-6 sm:p-8 border border-white/[0.08] shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 font-bold">
                TELEMETRY CONSOLE // SPECIFICATION AUDIT
              </span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">
              STATUS: VERIFIED ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Original Blueprints
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
                {String(stats.totalSpecs).padStart(2, "0")}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {stats.totalSpecs > 0 ? "Authored from scratch" : "No original specs yet"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Forks &amp; Remixes
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-amber-400 tracking-tight">
                {String(stats.totalForks).padStart(2, "0")}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Localized &amp; adapted
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Shipped Proof-of-Work
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400 tracking-tight">
                {String(stats.totalBuilds).padStart(2, "0")}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Repositories in production
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Community Stars
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-indigo-400 tracking-tight">
                {stats.totalStars}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Votes earned across specs
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            PORTFOLIO TABS
           ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-1 overflow-x-auto">
            {[
              { id: "specs", label: "Authored Specs", icon: Layers, count: specs.length },
              { id: "forks", label: "Remixes & Forks", icon: GitFork, count: forks.length },
              { id: "builds", label: "Shipped Builds", icon: Rocket, count: builds.length },
              { id: "starred", label: "Starred Specs", icon: Star, count: starred.length },
              { id: "reputation", label: "Reputation & Badges", icon: Award, count: stats.reputation },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-mono text-xs transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-white text-[#111113] border-t border-x border-zinc-200 font-bold shadow-sm"
                      : "text-zinc-500 hover:text-black hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 text-[10px] text-zinc-600 font-semibold">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: AUTHORED SPECS */}
          {activeTab === "specs" && (
            <div className="space-y-6">
              {specs.length === 0 ? (
                <div className="bento-white p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-sans font-semibold text-[#111113]">
                    No Original Specs Authored Yet
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    @{author.username} hasn&apos;t published original blueprints from scratch yet.
                  </p>
                  <Link
                    href="/ideas/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111113] text-white text-xs font-mono font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-300" />
                    <span>Create a Specification</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {specs.map((idea, idx) => (
                    <IdeaCard
                      key={idea.slug}
                      idea={idea}
                      index={idx}
                      onForkClick={(i) => setForkModalIdea(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REMIXES & FORKS */}
          {activeTab === "forks" && (
            <div className="space-y-6">
              {forks.length === 0 ? (
                <div className="bento-white p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center mx-auto">
                    <GitFork className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-sans font-semibold text-[#111113]">
                    No Forks or Remixes Initiated
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    This author hasn&apos;t forked existing community ideas to pivot regions or tech stacks yet.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111113] text-white text-xs font-mono font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    <span>Browse Discovery Feed</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forks.map((forkIdea, idx) => (
                    <div key={forkIdea.slug} className="space-y-2">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-mono text-amber-900">
                        <GitFork className="w-3 h-3 text-amber-700" />
                        <span>Forked from:</span>
                        <Link
                          href={`/ideas/${forkIdea.parent_slug}`}
                          className="font-bold underline hover:text-black truncate"
                        >
                          @{forkIdea.parent_slug}
                        </Link>
                      </div>
                      <IdeaCard
                        idea={forkIdea}
                        index={idx}
                        onForkClick={(i) => setForkModalIdea(i)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHIPPED BUILDS & PROOF-OF-WORK */}
          {activeTab === "builds" && (
            <div className="space-y-6">
              {builds.length === 0 ? (
                <div className="bento-white p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-500 flex items-center justify-center mx-auto">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-sans font-semibold text-[#111113]">
                    No Shipped Repos Linked
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Developers earn the &ldquo;Shipper&rdquo; badge by linking real GitHub implementations to active specifications.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {builds.map((b) => (
                    <div key={b.id} className="bento-white p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                            BLUEPRINT: {b.idea_id}
                          </span>
                          <h4 className="text-base font-sans font-semibold text-[#111113]">
                            <Link href={`/ideas/${b.idea_id}`} className="hover:text-amber-800 transition-colors">
                              {b.idea_id}
                            </Link>
                          </h4>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${
                            b.status === "shipped"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              b.status === "shipped" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                            }`}
                          />
                          {b.status === "shipped" ? "Production Live" : "Active Development"}
                        </span>
                      </div>

                      {b.notes && (
                        <p className="text-xs text-[#52525B] leading-relaxed">
                          {b.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 text-xs font-mono">
                        <a
                          href={b.repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-zinc-800 hover:text-black font-semibold hover:underline"
                        >
                          <Code2 className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{b.repo_url.replace("https://github.com/", "")}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                        </a>

                        {b.live_url && (
                          <a
                            href={b.live_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
                          >
                            <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3 text-emerald-500" />
                          </a>
                        )}

                        <span className="ml-auto text-[10px] text-zinc-400">
                          {b.created_at}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: STARRED SPECS */}
          {activeTab === "starred" && (
            <div className="space-y-6">
              {starred.length === 0 ? (
                <div className="bento-white p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-sans font-semibold text-[#111113]">
                    No Starred Specifications Yet
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Blueprints you bookmark or star across the IdeaToX registry will appear here for fast reference.
                  </p>
                  <Link
                    href="/ideas"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111113] text-white text-xs font-mono font-semibold hover:bg-zinc-800 transition-colors"
                  >
                    <span>Explore Ideas Directory</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {starred.map((idea, idx) => (
                    <IdeaCard
                      key={idea.slug}
                      idea={idea}
                      index={idx}
                      onForkClick={(i) => setForkModalIdea(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REPUTATION & BADGES */}
          {activeTab === "reputation" && (
            <div className="space-y-6">
              <div className="bento-white p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-sans font-bold text-[#111113]">
                    Reputation Telemetry &amp; Scoring System
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                    Reputation is deterministically earned through architectural quality, community validation, and proof-of-work codebases.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">COMMUNITY STARS</span>
                    <div className="text-lg font-mono font-bold text-amber-800">+10 PTS / STAR</div>
                    <p className="text-[11px] text-zinc-500">Earned when peers upvote and bookmark your specifications.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">FORK REMIXES</span>
                    <div className="text-lg font-mono font-bold text-cyan-800">+25 PTS / FORK</div>
                    <p className="text-[11px] text-zinc-500">Awarded when another builder remixes or localizes your idea.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">SHIPPED BUILDS</span>
                    <div className="text-lg font-mono font-bold text-emerald-800">+50 PTS / REPO</div>
                    <p className="text-[11px] text-zinc-500">Rewarded when a functioning repository or live demo is verified.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-1">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase">MERGED PRS</span>
                    <div className="text-lg font-mono font-bold text-purple-800">+30 PTS / MERGE</div>
                    <p className="text-[11px] text-zinc-500">Given when an MVP scope suggestion is approved into HEAD.</p>
                  </div>
                </div>

                {/* Badges Guide */}
                <div className="pt-6 border-t border-zinc-100 space-y-4">
                  <h4 className="text-sm font-sans font-semibold text-[#111113]">Platform Roles &amp; Badges</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-zinc-200 bg-white flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-[#111113]">IDEATOR BADGE</div>
                        <p className="text-xs text-zinc-500 mt-0.5">Author of structured technical architecture blueprints with clear MVP scopes.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-200 bg-white flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
                        <GitFork className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-[#111113]">REMIXER BADGE</div>
                        <p className="text-xs text-zinc-500 mt-0.5">Active remixer pivoting architectures across geographic regions and tech stacks.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-200 bg-white flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Rocket className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-[#111113]">SHIPPER BADGE</div>
                        <p className="text-xs text-zinc-500 mt-0.5">Builder with linked production GitHub repositories and deployed live demos.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-zinc-200 bg-white flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-[#111113]">ARCHITECT BADGE</div>
                        <p className="text-xs text-zinc-500 mt-0.5">Contributor whose proposed Feature PRs have been approved and merged.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* =========================================================================
          OBSIDIAN MEGA FOOTER
         ========================================================================= */}
      <ObsidianMegaFooter />

      {/* =========================================================================
          FORK MODAL FOR REMIXING
         ========================================================================= */}
      {forkModalIdea && (
        <ForkModal
          idea={forkModalIdea}
          isOpen={!!forkModalIdea}
          onClose={() => setForkModalIdea(null)}
        />
      )}

      {/* =========================================================================
          TOAST NOTIFICATION
         ========================================================================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0D0E12] text-white text-xs font-mono border border-white/10 shadow-2xl animate-slideUp">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-600 font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>DECODING ARCHITECT TELEMETRY PROFILE...</span>
          </div>
        </div>
      }
    >
      <UserProfileContent />
    </Suspense>
  );
}
