"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  GitFork,
  Terminal,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Share2,
  ExternalLink,
  GitPullRequest,
  Code2,
  Rocket,
  ShieldCheck,
  Sparkles,
  Layers,
  Globe,
  Plus,
  AlertCircle,
  GitBranch,
  GitMerge,
  XCircle,
  CheckCircle,
  SlidersHorizontal,
  X,
  MessageSquare,
  Heart,
  Send,
  CornerDownRight,
  ArrowRight,
} from "lucide-react";
import {
  getIdeaBySlug,
  getRelatedIdeas,
  getIdeaLineage,
  toggleUpvote,
  hasUserUpvoted,
  addFeatureRequest,
  reviewFeatureRequest,
  addIdeaBuild,
  addIdeaComment,
  toggleCommentLike,
  IdeaLineage,
} from "@/lib/ideas";
import { Idea, IdeaDifficulty, FeatureRequest, IdeaBuild, IdeaComment } from "@/types/idea";
import { ForkModal } from "@/components/fork-modal";
import { LineageTree } from "@/components/lineage-tree";

const DIFFICULTY_CONFIG: Record<
  IdeaDifficulty,
  { label: string; badgeClass: string; bars: number; barColor: string; description: string }
> = {
  beginner: {
    label: "Weekend Build",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bars: 4,
    barColor: "bg-emerald-500",
    description: "Estimated build time: 12-24 hours. Minimal third-party dependencies.",
  },
  intermediate: {
    label: "Side Project",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    bars: 8,
    barColor: "bg-amber-500",
    description: "Estimated build time: 1-2 weeks. Requires state management and API integration.",
  },
  advanced: {
    label: "Full SaaS",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    bars: 11,
    barColor: "bg-indigo-500",
    description: "Estimated build time: 3-6 weeks. Complex real-time, hardware, or multi-tenant architecture.",
  },
};

function IdeaDetailContent() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : "";

  const [idea, setIdea] = useState<Idea | null>(null);
  const [lineage, setLineage] = useState<IdeaLineage | null>(null);
  const [relatedIdeas, setRelatedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive checklist state
  const [checkedFeatures, setCheckedFeatures] = useState<Record<number, boolean>>({});

  // Active view tab
  const [activeTab, setActiveTab] = useState<"spec" | "discussions" | "prs" | "builds" | "lineage">("spec");

  // Interaction feedback states
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(0);
  const [copiedSpec, setCopiedSpec] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Modals state
  const [forkModalOpen, setForkModalOpen] = useState(false);
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [buildModalOpen, setBuildModalOpen] = useState(false);

  // Maintainer view mode
  const [isOwnerView, setIsOwnerView] = useState(true);

  // Feature PR submission form
  const [prActionType, setPrActionType] = useState<"add_feature" | "remove_feature">("add_feature");
  const [prFeatureText, setPrFeatureText] = useState("");
  const [prRationale, setPrRationale] = useState("");

  // Build submission form
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [buildStatus, setBuildStatus] = useState<"shipped" | "building">("building");
  const [buildNotes, setBuildNotes] = useState("");

  // Lists
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [builds, setBuilds] = useState<IdeaBuild[]>([]);

  // Discussion & Comments state
  const [comments, setComments] = useState<IdeaComment[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      setLoading(true);
      const fetchedIdea = await getIdeaBySlug(slug);
      if (fetchedIdea) {
        setIdea(fetchedIdea);
        setStarCount(fetchedIdea.upvotes_count || 0);
        setStarred(hasUserUpvoted(fetchedIdea.slug));
        setFeatureRequests(fetchedIdea.feature_requests || []);
        setBuilds(fetchedIdea.builds || []);
        setComments(fetchedIdea.comments || []);

        const tree = await getIdeaLineage(fetchedIdea.slug);
        setLineage(tree);

        const related = await getRelatedIdeas(fetchedIdea.category, fetchedIdea.slug);
        setRelatedIdeas(related);
      }
      setLoading(false);
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-600 font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>DECODING ARCHITECTURE BLUEPRINT...</span>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 text-amber-700">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-sans font-bold text-[#111113] mb-2">Blueprint Spec Not Found</h2>
        <p className="text-sm text-zinc-500 max-w-md mb-6">
          The requested idea specification does not exist in the active registry or may have been unlisted.
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

  const meta = DIFFICULTY_CONFIG[idea.difficulty] ?? DIFFICULTY_CONFIG.intermediate;
  const completedCount = Object.values(checkedFeatures).filter(Boolean).length;
  const totalFeatures = idea.mvp_features.length;
  const progressPercent = Math.round((completedCount / (totalFeatures || 1)) * 100);

  const toggleFeature = (idx: number) => {
    setCheckedFeatures((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleStar = async () => {
    const prevStarred = starred;
    const prevCount = starCount;
    setStarred(!prevStarred);
    setStarCount(prevStarred ? prevCount - 1 : prevCount + 1);

    try {
      const res = await toggleUpvote(idea.slug);
      setStarred(res.starred);
      setStarCount(res.upvotes_count);
    } catch {
      setStarred(prevStarred);
      setStarCount(prevCount);
    }
  };

  const copySpecMarkdown = () => {
    const md = `# ${idea.title}
> ${idea.hook}

## Problem Statement
${idea.problem_statement}

## MVP Feature Checklist
${idea.mvp_features.map((f, i) => `- [${checkedFeatures[i] ? "x" : " "}] ${f}`).join("\n")}

## Target Architecture
- Category: ${idea.category}
- Difficulty: ${meta.label}
- Region: ${idea.target_region}
- Collaboration: ${idea.collab_status}
- Suggested Stack: ${idea.suggested_stack?.join(", ")}

---
Specification archived on IdeaToX // https://ideatox.space/ideas/${idea.slug}`;

    navigator.clipboard.writeText(md);
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  const copyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const submitFeaturePR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prFeatureText.trim()) return;

    const newPR = await addFeatureRequest(idea.slug, {
      action_type: prActionType,
      feature_text: prFeatureText.trim(),
      rationale: prRationale.trim(),
    });

    if (newPR) {
      setFeatureRequests([newPR, ...featureRequests]);
      setPrFeatureText("");
      setPrRationale("");
      setPrModalOpen(false);
      setBannerNotice(
        `Feature Pull Request submitted: "${newPR.feature_text}". Awaiting maintainer review.`
      );
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  const handleReviewPR = async (prId: string, decision: "approved" | "rejected") => {
    const res = await reviewFeatureRequest(idea.slug, prId, decision);
    if (res.success && res.idea) {
      setIdea(res.idea);
      setFeatureRequests(res.idea.feature_requests || []);
      setBannerNotice(res.message);
      setTimeout(() => setBannerNotice(null), 6000);
    }
  };

  const submitBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    const res = await addIdeaBuild(idea.slug, {
      repo_url: repoUrl.trim(),
      live_url: liveUrl.trim() || undefined,
      status: buildStatus,
      notes: buildNotes.trim() || "Active implementation linked via IdeaToX Showcase.",
    });

    if (res.success && res.build) {
      setBuilds([res.build, ...builds]);
      setIdea((prev) => (prev ? { ...prev, builds_count: res.builds_count } : prev));
      setRepoUrl("");
      setLiveUrl("");
      setBuildNotes("");
      setBuildModalOpen(false);
      setBannerNotice(
        `Proof-of-work build linked successfully for ${res.build.repo_url.replace("https://github.com/", "")}!`
      );
      setTimeout(() => setBannerNotice(null), 5000);
    }
  };

  const handlePostComment = async (parentId?: string | null) => {
    const text = parentId ? replyText : newCommentText;
    if (!text.trim() || !idea) return;

    setIsSubmittingComment(true);
    try {
      const created = await addIdeaComment(idea.slug, text, parentId);
      if (created) {
        setComments((prev) => [...prev, created]);
        if (parentId) {
          setReplyText("");
          setReplyingToId(null);
        } else {
          setNewCommentText("");
        }
        setBannerNotice(
          parentId
            ? "Reply published to architectural discussion thread."
            : "Technical thought posted to discussion registry."
        );
        setTimeout(() => setBannerNotice(null), 4000);
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!idea) return;
    try {
      const res = await toggleCommentLike(idea.slug, commentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, user_liked: res.liked, likes_count: res.count }
            : c
        )
      );
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111113] selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
        {/* TOP NAVIGATION BAR */}
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
              <span className="uppercase text-amber-700 font-bold">SPEC //</span>
              <span className="text-zinc-800 truncate max-w-[200px] font-semibold">{idea.slug}</span>
            </div>
          </div>

          {/* Quick Action cluster */}
          <div className="flex items-center gap-2">
            {/* Upvote / Star Toggle */}
            <button
              type="button"
              onClick={handleStar}
              aria-label="Star this blueprint"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all ${
                starred
                  ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-sm"
                  : "bg-white text-zinc-700 hover:text-black border border-zinc-200 hover:border-zinc-300 shadow-sm"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starred ? "fill-amber-500 text-amber-500" : ""}`} />
              <span>{starCount}</span>
            </button>

            {/* Fork Modal Trigger */}
            <button
              type="button"
              onClick={() => setForkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
            >
              <GitFork className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Fork Blueprint</span>
              <span className="sm:hidden">Fork</span>
            </button>

            <button
              type="button"
              onClick={copyShareLink}
              title="Share Blueprint"
              className="p-2 rounded-full text-zinc-600 hover:text-black bg-white border border-zinc-200 hover:border-zinc-300 transition-colors shadow-sm cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* NOTIFICATION TOAST BANNER */}
        {bannerNotice && (
          <div className="px-4 sm:px-8 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 text-xs font-mono text-amber-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{bannerNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="text-amber-800 hover:text-black font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12">
          {/* HEADER HERO AREA */}
          <div className="space-y-4 max-w-4xl">
            {/* Telemetry pill row */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wider uppercase font-semibold">
              <span className="px-2.5 py-1 rounded-md bg-white text-zinc-800 border border-zinc-200 shadow-sm">
                ARCH // {idea.category}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white text-zinc-800 border border-zinc-200 shadow-sm flex items-center gap-1">
                <Globe className="w-3 h-3 text-amber-600" />
                {idea.target_region}
              </span>
              <span className={`px-2.5 py-1 rounded-md border ${meta.badgeClass}`}>
                {meta.label}
              </span>
              <span
                className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                  idea.collab_status === "seeking_cofounder"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    idea.collab_status === "seeking_cofounder" ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
                {idea.collab_status === "seeking_cofounder" ? "Seeking Co-Founder" : "Open Specification"}
              </span>

              {idea.parent_slug && (
                <Link
                  href={`/ideas/${idea.parent_slug}`}
                  className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 hover:border-indigo-300 flex items-center gap-1.5 transition-colors group"
                >
                  <GitFork className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                  <span>Forked from @{idea.parent_slug}</span>
                </Link>
              )}
            </div>

            {/* Spec Title: Mixed Sans + Italic Serif */}
            <h1 className="text-3xl sm:text-5xl font-sans font-semibold tracking-[-0.035em] text-[#111113] leading-tight">
              {idea.title}
            </h1>

            {/* 1-Sentence Hook */}
            <p className="text-base sm:text-xl text-[#52525B] leading-relaxed font-normal max-w-3xl">
              {idea.hook}
            </p>
          </div>

          {/* TWO-COLUMN ARCHITECTURE GRID */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT / PRIMARY COLUMN: Spec details & tabs (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* NAVIGATION TABS */}
              <div className="flex items-center gap-2 border-b border-zinc-200 pb-1 overflow-x-auto">
                {[
                  { id: "spec", label: "Spec & MVP Scope", icon: Code2, count: totalFeatures },
                  { id: "discussions", label: "Discussions", icon: MessageSquare, count: comments.length },
                  { id: "prs", label: "Feature PRs", icon: GitPullRequest, count: featureRequests.length },
                  { id: "builds", label: "Shipped Builds", icon: Rocket, count: builds.length },
                  { id: "lineage", label: "Lineage Graph", icon: GitBranch, count: (lineage?.children.length ?? 0) + 1 },
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

              {/* TAB 1: SPECIFICATION & MVP FEATURES */}
              {activeTab === "spec" && (
                <div className="space-y-8">
                  {/* Problem Statement Card */}
                  <div className="bento-white p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-100">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-amber-700 flex items-center gap-1.5 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        VALIDATED PROBLEM STATEMENT
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 uppercase">
                        FIELD AUDIT
                      </span>
                    </div>
                    <p className="text-zinc-800 text-sm sm:text-base leading-relaxed font-normal">
                      {idea.problem_statement}
                    </p>
                  </div>

                  {/* Proposed MVP Features Checklist */}
                  <div className="bento-white p-6 sm:p-7 space-y-4">
                    {/* Header with progress */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-sans font-semibold text-[#111113]">MVP Feature Specifications</h3>
                          <span className="font-mono text-[10px] text-amber-800 font-bold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                            {completedCount}/{totalFeatures} Built
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Check features off as you build or export as Markdown tasks.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={copySpecMarkdown}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors shrink-0 cursor-pointer"
                      >
                        {copiedSpec ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied Markdown</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Copy Spec MD</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    {/* Interactive List */}
                    <div className="space-y-2.5 pt-2">
                      {idea.mvp_features.map((feature, idx) => {
                        const isDone = !!checkedFeatures[idx];
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleFeature(idx)}
                            className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                              isDone
                                ? "bg-emerald-50/60 border-emerald-200 text-zinc-500"
                                : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-white text-[#111113]"
                            }`}
                          >
                            <button
                              type="button"
                              className="mt-0.5 text-zinc-400 group-hover:text-amber-500 transition-colors shrink-0"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <div className="flex-1">
                              <span
                                className={`text-sm leading-snug font-medium transition-all ${
                                  isDone ? "line-through text-zinc-400" : ""
                                }`}
                              >
                                {feature}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase font-semibold">
                              MVP-0{idx + 1}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Architecture & Suggested Tech Stack */}
                  <div className="bento-white p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                      <span className="font-mono text-[11px] uppercase tracking-wider text-amber-700 flex items-center gap-1.5 font-bold">
                        <Layers className="w-3.5 h-3.5" />
                        RECOMMENDED INFRASTRUCTURE &amp; TECH STACK
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 uppercase">
                        PRODUCTION READY
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {idea.suggested_stack?.map((tech) => (
                        <div
                          key={tech}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-medium text-zinc-800"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{tech}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-[#52525B] leading-relaxed">
                      Curated for low latency, zero unnecessary DevOps overhead, and rapid single-developer iteration.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB: ARCHITECTURAL DISCUSSIONS & THREADED COMMENTS */}
              {activeTab === "discussions" && (
                <div className="space-y-6">
                  {/* DISCUSSION HEADER BANNER */}
                  <div className="bento-white p-6 sm:p-7">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            RFC &amp; CRITIQUE
                          </span>
                          <span className="text-xs font-mono text-zinc-400">
                            • {comments.length} Technical Thoughts
                          </span>
                        </div>
                        <h3 className="text-xl font-sans font-bold text-[#111113]">
                          Architectural Discussions
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 max-w-xl">
                          Peer reviews, edge-case evaluations, and queries on scalability. Keep feedback focused on concrete trade-offs.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Discussion Active
                        </span>
                      </div>
                    </div>

                    {/* TOP-LEVEL COMMENT COMPOSER */}
                    <div className="mt-5 space-y-3">
                      {/* Architectural Prompt Suggestion Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        <span className="text-[10px] font-mono text-zinc-400 shrink-0">Prompts:</span>
                        {[
                          "How will state sync handle offline conflict resolution?",
                          "Would WebSockets or SSE be better for telemetry?",
                          "What is the estimated memory footprint per worker?",
                          "Interested in co-building the frontend adapter!",
                        ].map((promptChip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewCommentText((prev) => (prev ? `${prev}\n${promptChip}` : promptChip))}
                            className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            + &ldquo;{promptChip.slice(0, 32)}...&rdquo;
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <textarea
                          rows={3}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          placeholder="Share technical observations, suggest alternate libraries, or ask the blueprint author about constraints..."
                          className="w-full rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-xs font-mono text-[#111113] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-y"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-mono text-zinc-400">
                          {newCommentText.length} characters • Markdown formatted
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePostComment(null)}
                          disabled={!newCommentText.trim() || isSubmittingComment}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111113] text-white font-mono text-xs font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmittingComment ? "Posting..." : "Post Thought"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* COMMENTS LIST */}
                  <div className="space-y-4">
                    {comments.filter((c) => !c.parent_comment_id).length === 0 ? (
                      <div className="bento-white p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <h4 className="text-base font-sans font-semibold text-[#111113]">No Technical Comments Yet</h4>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                          Be the first systems engineer to review this specification or raise an architectural query.
                        </p>
                      </div>
                    ) : (
                      comments
                        .filter((c) => !c.parent_comment_id)
                        .map((rootComment) => {
                          const replies = comments.filter((c) => c.parent_comment_id === rootComment.id);
                          const isAuthor = rootComment.user.username === idea.author?.username;

                          return (
                            <div key={rootComment.id} className="bento-white p-5 sm:p-6 space-y-4">
                              {/* COMMENT HEADER */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <Link
                                    href={`/profile/${rootComment.user.username}`}
                                    className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center text-xs font-bold text-zinc-700 shrink-0 hover:border-amber-400 transition-colors"
                                  >
                                    {rootComment.user.avatar_url ? (
                                      <img
                                        src={rootComment.user.avatar_url}
                                        alt={rootComment.user.username}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span>{rootComment.user.username.slice(0, 2).toUpperCase()}</span>
                                    )}
                                  </Link>

                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Link
                                        href={`/profile/${rootComment.user.username}`}
                                        className="text-xs font-sans font-semibold text-[#111113] hover:text-amber-800 transition-colors"
                                      >
                                        {rootComment.user.full_name || rootComment.user.username}
                                      </Link>
                                      <Link
                                        href={`/profile/${rootComment.user.username}`}
                                        className="text-[11px] font-mono text-zinc-400 hover:text-zinc-600"
                                      >
                                        @{rootComment.user.username}
                                      </Link>

                                      {isAuthor && (
                                        <span className="font-mono text-[9px] uppercase tracking-wider text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                          Spec Author
                                        </span>
                                      )}

                                      <span className="font-mono text-[9px] text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200/60">
                                        REP {rootComment.user.reputation_score || 450}
                                      </span>
                                    </div>

                                    <span className="text-[10px] font-mono text-zinc-400">
                                      {rootComment.created_at}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* COMMENT BODY */}
                              <div className="text-xs text-[#27272A] leading-relaxed font-sans pl-1 whitespace-pre-line">
                                {rootComment.content}
                              </div>

                              {/* COMMENT ACTIONS */}
                              <div className="flex items-center gap-3 pt-2 border-t border-zinc-100 font-mono text-xs text-zinc-500">
                                <button
                                  type="button"
                                  onClick={() => handleToggleCommentLike(rootComment.id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                                    rootComment.user_liked
                                      ? "bg-rose-50 text-rose-600 font-semibold"
                                      : "hover:bg-zinc-100 text-zinc-600"
                                  }`}
                                >
                                  <Heart
                                    className={`w-3.5 h-3.5 ${
                                      rootComment.user_liked ? "fill-rose-500 text-rose-500" : ""
                                    }`}
                                  />
                                  <span>{rootComment.likes_count ?? 0}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplyingToId(replyingToId === rootComment.id ? null : rootComment.id);
                                    setReplyText("");
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer ${
                                    replyingToId === rootComment.id ? "bg-zinc-100 font-semibold text-black" : ""
                                  }`}
                                >
                                  <CornerDownRight className="w-3.5 h-3.5" />
                                  <span>Reply {replies.length > 0 ? `(${replies.length})` : ""}</span>
                                </button>
                              </div>

                              {/* INLINE REPLY COMPOSER */}
                              {replyingToId === rootComment.id && (
                                <div className="mt-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 animate-fadeIn">
                                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                                    <span>Replying to @{rootComment.user.username}:</span>
                                    <button
                                      type="button"
                                      onClick={() => setReplyingToId(null)}
                                      className="text-zinc-400 hover:text-black cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <textarea
                                    rows={2}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Add your response or follow-up question..."
                                    className="w-full rounded-xl bg-white border border-zinc-200 p-2.5 text-xs font-mono text-[#111113] placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingToId(null)}
                                      className="px-3 py-1 rounded-lg text-zinc-500 hover:text-black text-xs font-mono cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handlePostComment(rootComment.id)}
                                      disabled={!replyText.trim() || isSubmittingComment}
                                      className="px-3 py-1 rounded-lg bg-[#111113] text-white font-mono text-xs font-semibold hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                                    >
                                      {isSubmittingComment ? "Sending..." : "Submit Reply"}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* NESTED CHILD REPLIES */}
                              {replies.length > 0 && (
                                <div className="ml-4 sm:ml-6 pl-4 border-l-2 border-zinc-200/80 space-y-3 pt-2">
                                  {replies.map((reply) => {
                                    const isReplyAuthor = reply.user.username === idea.author?.username;
                                    return (
                                      <div
                                        key={reply.id}
                                        className="p-3.5 rounded-xl bg-zinc-50/80 border border-zinc-100 space-y-2"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2">
                                            <Link
                                              href={`/profile/${reply.user.username}`}
                                              className="w-6 h-6 rounded-lg bg-zinc-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-zinc-700"
                                            >
                                              {reply.user.avatar_url ? (
                                                <img
                                                  src={reply.user.avatar_url}
                                                  alt={reply.user.username}
                                                  className="w-full h-full object-cover"
                                                />
                                              ) : (
                                                <span>{reply.user.username.slice(0, 2).toUpperCase()}</span>
                                              )}
                                            </Link>
                                            <Link
                                              href={`/profile/${reply.user.username}`}
                                              className="text-xs font-sans font-semibold text-[#111113] hover:text-amber-800"
                                            >
                                              {reply.user.full_name || reply.user.username}
                                            </Link>
                                            <span className="text-[10px] font-mono text-zinc-400">
                                              @{reply.user.username}
                                            </span>
                                            {isReplyAuthor && (
                                              <span className="font-mono text-[8px] uppercase tracking-wider text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200">
                                                Author
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] font-mono text-zinc-400">
                                            {reply.created_at}
                                          </span>
                                        </div>

                                        <p className="text-xs text-[#27272A] leading-relaxed font-sans pl-1 whitespace-pre-line">
                                          {reply.content}
                                        </p>

                                        <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-zinc-500">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleCommentLike(reply.id)}
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                                              reply.user_liked ? "text-rose-600 font-bold" : "hover:text-black"
                                            }`}
                                          >
                                            <Heart
                                              className={`w-3 h-3 ${
                                                reply.user_liked ? "fill-rose-500 text-rose-500" : ""
                                              }`}
                                            />
                                            <span>{reply.likes_count ?? 0}</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FEATURE PULL REQUESTS */}
              {activeTab === "prs" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-sans font-semibold text-[#111113] flex items-center gap-2">
                        <span>Feature Pull Requests</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono text-amber-800 font-bold">
                          {featureRequests.filter((p) => p.status === "pending").length} Pending
                        </span>
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        Propose architectural improvements or MVP scope adjustments to this blueprint.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsOwnerView((prev) => !prev)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors border ${
                          isOwnerView
                            ? "bg-amber-100 text-amber-900 border-amber-300 font-semibold"
                            : "bg-white text-zinc-600 border-zinc-200 hover:text-black"
                        }`}
                        title="Toggle maintainer review controls"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>{isOwnerView ? "Maintainer View" : "Contributor View"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-300" />
                        <span>Propose Feature</span>
                      </button>
                    </div>
                  </div>

                  {featureRequests.length === 0 ? (
                    <div className="bento-white p-10 text-center">
                      <GitPullRequest className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-base font-semibold text-[#111113]">No active Feature PRs yet</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Be the first to propose a feature addition or MVP scope reduction.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {featureRequests.map((pr) => {
                        const isPending = pr.status === "pending";
                        const isAdd = pr.action_type === "add_feature";

                        return (
                          <div
                            key={pr.id}
                            className="bento-white p-5 sm:p-6 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                    isAdd
                                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                      : "bg-rose-50 text-rose-800 border border-rose-200"
                                  }`}
                                >
                                  {isAdd ? "+ ADD FEATURE" : "- REMOVE FEATURE"}
                                </span>
                                <span className="font-bold text-[#111113] text-sm">
                                  {pr.feature_text}
                                </span>
                              </div>

                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold w-fit ${
                                  pr.status === "approved"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : pr.status === "rejected"
                                    ? "bg-red-100 text-red-800 border border-red-300"
                                    : "bg-amber-100 text-amber-800 border border-amber-300"
                                }`}
                              >
                                {pr.status === "approved" ? "Merged ✓" : pr.status}
                              </span>
                            </div>

                            {pr.rationale && (
                              <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                                {pr.rationale}
                              </p>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100 text-[11px] font-mono text-zinc-500">
                              <span>
                                Proposed by <span className="text-[#111113] font-semibold">@{pr.proposer.username}</span> • {pr.created_at}
                              </span>

                              {isPending && isOwnerView && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleReviewPR(pr.id, "rejected")}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-zinc-600 hover:text-rose-700 hover:bg-rose-50 border border-zinc-200 hover:border-rose-200 transition-colors font-semibold"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Decline</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleReviewPR(pr.id, "approved")}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white font-semibold bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                                  >
                                    <GitMerge className="w-3.5 h-3.5" />
                                    <span>Approve &amp; Merge</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SHIPPED BUILDS */}
              {activeTab === "builds" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-sans font-semibold text-[#111113]">Proof-of-Work Showcase</h3>
                      <p className="text-xs text-zinc-500">
                        Code repositories and live demos deployed from this specification.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBuildModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>Link Your Build</span>
                    </button>
                  </div>

                  {builds.length === 0 ? (
                    <div className="bento-white p-10 text-center">
                      <Terminal className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-base font-semibold text-[#111113]">No linked builds yet</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Are you building this? Submit your GitHub repo or live demo to get featured.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {builds.map((b) => (
                        <div
                          key={b.id}
                          className="bento-white p-5 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  b.status === "shipped"
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />
                              <span className="font-mono text-xs uppercase tracking-wider text-zinc-800 font-bold">
                                {b.status === "shipped" ? "Production Live" : "In Active Development"}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-zinc-400">
                              Linked by @{b.builder.username} • {b.created_at}
                            </span>
                          </div>

                          {b.notes && <p className="text-xs text-zinc-700 leading-relaxed font-normal">{b.notes}</p>}

                          <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-zinc-100">
                            <a
                              href={b.repo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-800 hover:text-black hover:underline"
                            >
                              <Code2 className="w-3.5 h-3.5 text-zinc-600" />
                              <span>{b.repo_url.replace("https://github.com/", "")}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-400" />
                            </a>

                            {b.live_url && (
                              <a
                                href={b.live_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                              >
                                <Rocket className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Live Demo</span>
                                <ExternalLink className="w-3 h-3 text-emerald-500" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: LINEAGE GRAPH */}
              {activeTab === "lineage" && lineage && (
                <LineageTree lineage={lineage} onForkClick={() => setForkModalOpen(true)} />
              )}
            </div>

            {/* RIGHT COLUMN: Author card, Complexity Telemetry, and Related (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* AUTHOR CARD */}
              <div className="bento-white p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    ORIGINAL SPEC AUTHOR
                  </span>
                  <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    REP: {idea.author?.reputation_score ?? 1420}
                  </span>
                </div>

                <Link
                  href={`/profile/${idea.author?.username || "adebayo_codes"}`}
                  className="flex items-center gap-3 group/author"
                >
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center font-bold text-zinc-700 text-sm group-hover/author:border-amber-400 transition-colors">
                    {idea.author?.avatar_url ? (
                      <img
                        src={idea.author.avatar_url}
                        alt={idea.author.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{idea.author?.username.slice(0, 2).toUpperCase() ?? "AU"}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-sans font-semibold text-[#111113] group-hover/author:text-amber-800 transition-colors flex items-center gap-1.5">
                      <span>{idea.author?.full_name ?? "Core Architecture Lead"}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover/author:translate-x-0.5 group-hover/author:text-amber-800 transition-all" />
                    </h4>
                    <p className="text-xs text-zinc-500 font-mono">@{idea.author?.username ?? "ideatox"}</p>
                  </div>
                </Link>

                <p className="text-xs text-[#52525B] leading-relaxed">
                  {idea.author?.bio ?? "Open-source systems architect & distributed platform builder. Documenting deterministic engineering blueprints."}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 text-xs font-mono">
                  {idea.author?.github_url && (
                    <a
                      href={idea.author.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors"
                    >
                      GitHub
                    </a>
                  )}
                  {idea.author?.twitter_url && (
                    <a
                      href={idea.author.twitter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors"
                    >
                      X / Twitter
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setForkModalOpen(true)}
                    className="ml-auto text-amber-800 hover:text-black text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <GitFork className="w-3 h-3" />
                    <span>Remix</span>
                  </button>
                </div>

                <Link
                  href={`/profile/${idea.author?.username || "adebayo_codes"}`}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Inspect Architect Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* COMPLEXITY TELEMETRY CARD */}
              <div className="bento-white p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    SCOPE COMPLEXITY
                  </span>
                  <span className="font-mono text-[11px] text-zinc-700 font-bold tabular-nums">
                    {meta.bars} / 12
                  </span>
                </div>

                {/* 12-bar vertical Dew Meter */}
                <div className="flex items-center gap-1 py-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-3 rounded-full transition-all ${
                        i < meta.bars ? meta.barColor : "bg-zinc-100"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-[#52525B] leading-relaxed">{meta.description}</p>

                <div className="pt-2 border-t border-zinc-100 space-y-2 text-xs font-mono text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span>FORKS ON RECORD:</span>
                    <span className="text-[#111113] font-bold">{idea.forks_count ?? 6}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SHIP STATUS:</span>
                    <span className="text-emerald-700 font-bold">
                      {builds.length > 0 ? `${builds.length} Active Builds` : "Unbuilt Concept"}
                    </span>
                  </div>
                </div>
              </div>

              {/* RELATED BLUEPRINTS */}
              {relatedIdeas.length > 0 && (
                <div className="bento-white p-6 space-y-3">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 font-bold block pb-2 border-b border-zinc-100">
                    RELATED IN {idea.category.toUpperCase()}
                  </span>

                  <div className="space-y-2.5">
                    {relatedIdeas.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/ideas/${item.slug}`}
                        className="block p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 transition-colors group"
                      >
                        <h5 className="text-xs font-semibold text-[#111113] group-hover:text-amber-800 line-clamp-1">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{item.hook}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* FOOTER BAR */}
        <footer className="border-t border-zinc-200 px-4 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>IDEATOX BLUEPRINT REGISTRY // 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-black transition-colors font-semibold">
              Feed
            </Link>
            <Link href="/ideas/new" className="text-amber-800 hover:text-black transition-colors font-bold">
              + New Spec
            </Link>
          </div>
        </footer>
      </div>

      {/* FORK BLUEPRINT MODAL */}
      <ForkModal
        idea={idea}
        isOpen={forkModalOpen}
        onClose={() => setForkModalOpen(false)}
        onForkCreated={(newIdea) => {
          setIdea((prev) => (prev ? { ...prev, forks_count: (prev.forks_count || 0) + 1 } : prev));
        }}
      />

      {/* MODAL: PROPOSE FEATURE PR */}
      {prModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPrModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-zinc-200/90 p-6 sm:p-7 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-800 font-bold">
                <GitPullRequest className="w-4 h-4" />
                <span>PROPOSE FEATURE PULL REQUEST</span>
              </div>
              <button
                type="button"
                onClick={() => setPrModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitFeaturePR} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPrActionType("add_feature");
                      setPrFeatureText("");
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-mono transition-all font-semibold ${
                      prActionType === "add_feature"
                        ? "bg-[#111113] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    + Add New Feature
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrActionType("remove_feature");
                      if (idea.mvp_features[0]) setPrFeatureText(idea.mvp_features[0]);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-mono transition-all font-semibold ${
                      prActionType === "remove_feature"
                        ? "bg-[#111113] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    - Remove Feature
                  </button>
                </div>
              </div>

              {prActionType === "add_feature" ? (
                <div>
                  <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                    Proposed Feature Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={prFeatureText}
                    onChange={(e) => setPrFeatureText(e.target.value)}
                    placeholder="e.g. WebAuthn biometric login, Offline SQLite sync"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                    Select Feature to Remove / Deprecate
                  </label>
                  <select
                    value={prFeatureText}
                    onChange={(e) => setPrFeatureText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
                  >
                    {idea.mvp_features.map((f, i) => (
                      <option key={i} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  Architectural Rationale
                </label>
                <textarea
                  rows={3}
                  value={prRationale}
                  onChange={(e) => setPrRationale(e.target.value)}
                  placeholder={
                    prActionType === "add_feature"
                      ? "Why should this be part of the core specification? What user friction does it eliminate?"
                      : "Why is this feature bloated, redundant, or unnecessary for the initial MVP?"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPrModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-mono text-zinc-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 transition-colors shadow-sm"
                >
                  Submit Feature PR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK BUILD */}
      {buildModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setBuildModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-[28px] bg-white border border-zinc-200/90 p-6 sm:p-7 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-800 font-bold">
                <Rocket className="w-4 h-4" />
                <span>LINK A SHIPPED / IN-PROGRESS BUILD</span>
              </div>
              <button
                type="button"
                onClick={() => setBuildModalOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={submitBuild} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  GitHub Repository URL *
                </label>
                <input
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://project.vercel.app"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  Current Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuildStatus("building")}
                    className={`px-3 py-2 rounded-xl text-xs font-mono transition-all font-semibold ${
                      buildStatus === "building"
                        ? "bg-[#111113] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    In Active Dev
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuildStatus("shipped")}
                    className={`px-3 py-2 rounded-xl text-xs font-mono transition-all font-semibold ${
                      buildStatus === "shipped"
                        ? "bg-[#111113] text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    Production Shipped
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  Progress Notes / Tech Highlights
                </label>
                <textarea
                  rows={2}
                  value={buildNotes}
                  onChange={(e) => setBuildNotes(e.target.value)}
                  placeholder="e.g. Alpha prototype functioning on Vercel Edge Runtime. Seeking frontend contributors!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBuildModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-mono text-zinc-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 shadow-sm transition-colors"
                >
                  Submit Build Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function IdeaDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-600 font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>INITIALIZING SPEC TELEMETRY...</span>
          </div>
        </div>
      }
    >
      <IdeaDetailContent />
    </Suspense>
  );
}
