"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  GitFork,
  Plus,
  Trash2,
  CheckCircle,
  Layers,
  Globe,
  Terminal,
  Zap,
  Code2,
} from "lucide-react";
import { z } from "zod";
import { Idea, IdeaCategory, IdeaDifficulty, CollabStatus } from "@/types/idea";
import { getIdeaBySlug, saveNewIdea } from "@/lib/ideas";

const IdeaSubmissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80, "Title is too long"),
  hook: z.string().min(10, "Hook must be at least 10 characters").max(140, "Hook must be 140 characters or fewer"),
  problem_statement: z.string().min(20, "Problem statement must be at least 20 characters"),
  mvp_features: z.array(z.string().min(3, "Feature description too short")).min(2, "At least 2 MVP features required"),
  category: z.enum(["web", "mobile", "ai", "cli", "hardware", "extension"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  target_region: z.string().min(2, "Region is required"),
  collab_status: z.enum(["open", "seeking_cofounder"]),
  suggested_stack: z.array(z.string()).min(1, "Specify at least 1 technology tag"),
  parent_slug: z.string().nullable().optional(),
});

const QUICK_PROMPTS = [
  "Offline-first PWA expense splitter for roommates with WhatsApp split links",
  "Zero-config CLI tool that turns messy Git commits into polished weekly standups",
  "IoT ESP32 smart meter for sharing excess solar battery power with neighbors",
  "Chrome extension hibernating 50+ open tabs into searchable contextual workspaces",
];

const CATEGORIES: { id: IdeaCategory; label: string; icon: any }[] = [
  { id: "web", label: "Web App", icon: Globe },
  { id: "mobile", label: "Mobile PWA", icon: Layers },
  { id: "ai", label: "AI & Agents", icon: Sparkles },
  { id: "cli", label: "CLI & Systems", icon: Terminal },
  { id: "hardware", label: "Hardware & IoT", icon: Zap },
  { id: "extension", label: "Browser Extension", icon: Code2 },
];

function NewIdeaFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forkSlug = searchParams.get("fork");
  const promptParam = searchParams.get("prompt");
  const categoryParam = searchParams.get("category");

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState(promptParam || "");
  const [isExpandingAI, setIsExpandingAI] = useState(false);
  const [aiTelemetryStep, setAiTelemetryStep] = useState<string | null>(null);

  // Form Fields State
  const [parentIdea, setParentIdea] = useState<Idea | null>(null);
  const [title, setTitle] = useState("");
  const [hook, setHook] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [mvpFeatures, setMvpFeatures] = useState<string[]>([
    "One-click authentication & session initialization",
    "Real-time local state caching with offline fallback",
    "Automated export and webhook dispatch trigger",
  ]);
  const [newFeatureInput, setNewFeatureInput] = useState("");
  const [category, setCategory] = useState<IdeaCategory>(
    categoryParam && ["web", "mobile", "ai", "cli", "hardware", "extension"].includes(categoryParam)
      ? (categoryParam as IdeaCategory)
      : "web"
  );
  const [difficulty, setDifficulty] = useState<IdeaDifficulty>("intermediate");
  const [targetRegion, setTargetRegion] = useState("Global");
  const [collabStatus, setCollabStatus] = useState<CollabStatus>("open");
  const [stackTags, setStackTags] = useState<string[]>(["Next.js", "TypeScript", "Tailwind CSS"]);
  const [newTagInput, setNewTagInput] = useState("");

  // Validation & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Parent Idea if Forking
  useEffect(() => {
    async function loadForkParent() {
      if (!forkSlug) return;
      const parent = await getIdeaBySlug(forkSlug);
      if (parent) {
        setParentIdea(parent);
        setTitle(`Remix: ${parent.title}`);
        setHook(`Remix variant: ${parent.hook}`);
        setProblemStatement(parent.problem_statement);
        setMvpFeatures(parent.mvp_features);
        setCategory(parent.category);
        setDifficulty(parent.difficulty);
        setTargetRegion(parent.target_region);
        if (parent.suggested_stack) setStackTags(parent.suggested_stack);
      }
    }
    loadForkParent();
  }, [forkSlug]);

  const handleAiExpand = async (overridePrompt?: string) => {
    const promptToUse = overridePrompt || aiPrompt;
    if (!promptToUse.trim()) return;

    setIsExpandingAI(true);
    setAiTelemetryStep("Parsing architectural parameters...");

    try {
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse }),
      });

      if (!res.ok) throw new Error("AI specification compiler response error");

      setAiTelemetryStep("Structuring MVP deliverables...");
      const data = await res.json();

      if (data.title) setTitle(data.title);
      if (data.hook) setHook(data.hook);
      if (data.problem_statement) setProblemStatement(data.problem_statement);
      if (Array.isArray(data.mvp_features) && data.mvp_features.length > 0) {
        setMvpFeatures(data.mvp_features);
      }
      if (data.category) setCategory(data.category);
      if (data.difficulty) setDifficulty(data.difficulty);
      if (data.target_region) setTargetRegion(data.target_region);
      if (Array.isArray(data.suggested_stack)) setStackTags(data.suggested_stack);

      setErrors({});
    } catch (err) {
      console.error("AI Spec generation error:", err);
    } finally {
      setIsExpandingAI(false);
      setAiTelemetryStep(null);
    }
  };

  const addFeature = () => {
    if (!newFeatureInput.trim()) return;
    setMvpFeatures([...mvpFeatures, newFeatureInput.trim()]);
    setNewFeatureInput("");
  };

  const removeFeature = (index: number) => {
    if (mvpFeatures.length <= 2) return;
    setMvpFeatures(mvpFeatures.filter((_, i) => i !== index));
  };

  const addTag = (tagToAdd?: string) => {
    const val = (tagToAdd || newTagInput).trim();
    if (!val || stackTags.includes(val)) return;
    setStackTags([...stackTags, val]);
    setNewTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setStackTags(stackTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      hook: hook.trim(),
      problem_statement: problemStatement.trim(),
      mvp_features: mvpFeatures.map((f) => f.trim()).filter(Boolean),
      category,
      difficulty,
      target_region: targetRegion.trim() || "Global",
      collab_status: collabStatus,
      suggested_stack: stackTags,
      parent_slug: parentIdea ? parentIdea.slug : null,
    };

    const result = IdeaSubmissionSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    const generatedSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) + `-${Math.random().toString(36).substring(2, 6)}`;

    const newIdeaObj: Idea = {
      ...payload,
      slug: generatedSlug,
      parent_idea_id: parentIdea ? (parentIdea.id || parentIdea.slug) : null,
      upvotes_count: 1,
      forks_count: 0,
      builds_count: 0,
      is_seeded: false,
      created_at: new Date().toISOString(),
      author: {
        username: "you_founder",
        full_name: "Technical Author",
        reputation_score: 150,
      },
      feature_requests: [],
      builds: [],
    };

    saveNewIdea(newIdeaObj);
    router.push(`/ideas/${generatedSlug}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111113] selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
        {/* TOP NAVIGATION HUD */}
        <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
              <span className="uppercase text-amber-700 font-bold">STUDIO //</span>
              <span className="text-zinc-800 font-semibold">
                {parentIdea ? `FORK BLUEPRINT (${parentIdea.slug})` : "NEW SPECIFICATION SYNTHESIS"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">AUTOSAVE STANDBY</span>
          </div>
        </header>

        {/* MAIN BODY FORM */}
        <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-8">
          {/* FORK HEADER BADGE (If applicable) */}
          {parentIdea && (
            <div className="bento-white p-5 border-amber-300 bg-amber-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                  <GitFork className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-800 font-bold">
                    FORKING BLUEPRINT LINEAGE
                  </h4>
                  <p className="text-sm text-zinc-800 font-semibold">
                    Remixing from <span className="text-[#111113]">{parentIdea.title}</span>
                  </p>
                </div>
              </div>
              <Link
                href={`/ideas/${parentIdea.slug}`}
                className="text-xs font-mono font-bold text-amber-800 hover:text-black hover:underline shrink-0"
              >
                View Parent Spec →
              </Link>
            </div>
          )}

          {/* PAGE TITLE & SUBTITLE (Strict Anti-Slop) */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-sans font-semibold tracking-[-0.035em] text-[#111113]">
              {parentIdea ? (
                <>
                  Remix &amp; Fork{" "}
                  <span className="font-serif italic font-normal text-amber-700">Architectural Spec</span>
                </>
              ) : (
                <>
                  Synthesize a New{" "}
                  <span className="font-serif italic font-normal text-amber-700">Project Blueprint</span>
                </>
              )}
            </h1>
            <p className="text-base sm:text-lg text-[#52525B] leading-relaxed max-w-2xl font-normal">
              Publish structured, buildable project specifications with verifiable deliverables. No vague pitch decks.
            </p>
          </div>

          {/* AI SPEC HELPER (Auto-Expand with AI) */}
          <div className="bento-white p-6 sm:p-7 border-amber-200 shadow-[0_20px_50px_-15px_rgba(245,158,11,0.08)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-amber-800 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI ARCHITECTURAL SPEC EXPANDER</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400 font-semibold uppercase">
                DETERMINISTIC COMPILER
              </span>
            </div>

            <p className="text-xs text-[#52525B] leading-relaxed">
              Type a 1-sentence concept or constraint. The engine will synthesize the Problem Statement, 3-point MVP checklist, and optimal tech stack.
            </p>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAiExpand())}
                  placeholder="e.g. Offline-first PWA for campus laundry queue tracking with QR codes"
                  disabled={isExpandingAI}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 font-sans"
                />
                <button
                  type="button"
                  onClick={() => handleAiExpand()}
                  disabled={isExpandingAI || !aiPrompt.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <Wand2 className={`w-3.5 h-3.5 text-amber-300 ${isExpandingAI ? "animate-spin" : ""}`} />
                  <span>{isExpandingAI ? "Expanding..." : "Auto-Expand"}</span>
                </button>
              </div>

              {isExpandingAI && (
                <div className="flex items-center gap-2 font-mono text-[11px] text-amber-800 font-semibold pt-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>{aiTelemetryStep}</span>
                </div>
              )}

              {/* Quick Prompts */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono text-[10px] text-zinc-400 uppercase font-semibold">
                  PRESETS:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(qp);
                      handleAiExpand(qp);
                    }}
                    className="text-[11px] font-mono text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded-md transition-colors truncate max-w-[280px]"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STRUCTURED FORM */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. TITLE & 1-SENTENCE HOOK */}
            <div className="bento-white p-6 sm:p-7 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold block pb-3 border-b border-zinc-100">
                01 // CORE IDENTITY &amp; ELEVATOR HOOK
              </span>

              {/* Title */}
              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  Project Blueprint Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed SQLite over Tailscale Mesh"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 font-sans"
                />
                {errors.title && <p className="text-xs text-rose-600 mt-1 font-mono font-medium">{errors.title}</p>}
              </div>

              {/* 1-Sentence Hook */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono text-zinc-600 uppercase tracking-wider font-semibold">
                    1-Sentence Pitch Hook *
                  </label>
                  <span
                    className={`font-mono text-[10px] tabular-nums font-semibold ${
                      hook.length > 140 ? "text-rose-600 font-bold" : "text-zinc-400"
                    }`}
                  >
                    {hook.length}/140 chars
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={hook}
                  onChange={(e) => setHook(e.target.value)}
                  placeholder="e.g. Global low-latency embedded database replica mesh running over WireGuard overlays."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 font-sans"
                />
                {errors.hook && <p className="text-xs text-rose-600 mt-1 font-mono font-medium">{errors.hook}</p>}
              </div>
            </div>

            {/* 2. CATEGORY, DIFFICULTY & TARGET REGION */}
            <div className="bento-white p-6 sm:p-7 space-y-6">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold block pb-3 border-b border-zinc-100">
                02 // TAXONOMY &amp; COMPLEXITY TIER
              </span>

              {/* Category Pill Selector */}
              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-2 font-semibold">
                  Primary Architectural Domain *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-mono transition-all text-left cursor-pointer ${
                          active
                            ? "bg-[#111113] text-white border-[#111113] font-bold shadow-sm"
                            : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Region Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                    Scope Complexity *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as IdeaDifficulty)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
                  >
                    <option value="beginner">Weekend Build (Beginner / 12-24h)</option>
                    <option value="intermediate">Side Project (Intermediate / 1-2 weeks)</option>
                    <option value="advanced">Full SaaS (Advanced / Multi-tenant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                    Target Region / Market *
                  </label>
                  <input
                    type="text"
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value)}
                    placeholder="e.g. Global, Nigeria, US, India, Europe"
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>
              </div>

              {/* Collaboration Status */}
              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-2 font-semibold">
                  Collaboration Posture
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCollabStatus("open")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      collabStatus === "open"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-medium"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1.5 text-emerald-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Open Specification</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">
                      Free for anyone to build, prototype, or fork without restriction.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCollabStatus("seeking_cofounder")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      collabStatus === "seeking_cofounder"
                        ? "bg-amber-50 border-amber-300 text-amber-950 font-medium"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="font-mono text-xs font-bold flex items-center gap-1.5 text-amber-800">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Seeking Technical Co-Founder</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">
                      Looking for core systems engineers or domain partners to collaborate directly.
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. PROBLEM STATEMENT */}
            <div className="bento-white p-6 sm:p-7 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold block pb-3 border-b border-zinc-100">
                03 // THE CORE PROBLEM STATEMENT
              </span>

              <div>
                <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
                  Problem Statement &amp; User Friction *
                </label>
                <textarea
                  rows={4}
                  required
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Who is experiencing the pain and why do current tools fail? Describe the structural friction..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 resize-none leading-relaxed font-sans"
                />
                {errors.problem_statement && (
                  <p className="text-xs text-rose-600 mt-1 font-mono font-medium">{errors.problem_statement}</p>
                )}
              </div>
            </div>

            {/* 4. PROPOSED MVP FEATURES */}
            <div className="bento-white p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold">
                  04 // MVP DELIVERABLES (CHECKABLE ROADMAP)
                </span>
                <span className="font-mono text-[10px] text-zinc-500 font-semibold">
                  {mvpFeatures.length} FEATURES
                </span>
              </div>

              <div className="space-y-2.5">
                {mvpFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-400 font-bold w-6">0{idx + 1}.</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...mvpFeatures];
                        updated[idx] = e.target.value;
                        setMvpFeatures(updated);
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400 font-sans font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      disabled={mvpFeatures.length <= 2}
                      className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 disabled:opacity-20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Feature row */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newFeatureInput}
                  onChange={(e) => setNewFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  placeholder="Add an MVP feature deliverable..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* 5. SUGGESTED TECH STACK */}
            <div className="bento-white p-6 sm:p-7 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-bold block pb-3 border-b border-zinc-100">
                05 // SUGGESTED INFRASTRUCTURE &amp; TECH STACK
              </span>

              <div className="flex flex-wrap gap-2">
                {stackTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono font-semibold text-zinc-800"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-zinc-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Type tech tag (e.g. Redis, WebAssembly, Go) and press Enter..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={() => addTag()}
                  className="px-4 py-2 rounded-full text-xs font-mono font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON & ACTIONS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200">
              <Link
                href="/"
                className="text-xs font-mono font-semibold text-zinc-500 hover:text-black transition-colors"
              >
                ← Discard and Return to Feed
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-mono text-xs font-bold text-white bg-[#111113] hover:bg-zinc-800 shadow-md active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-amber-300" />
                <span>{isSubmitting ? "PUBLISHING TO REGISTRY..." : "PUBLISH SPECIFICATION"}</span>
              </button>
            </div>
          </form>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-zinc-200 px-4 sm:px-8 py-5 font-mono text-[10px] text-zinc-500 uppercase tracking-wider text-center sm:text-left">
          IDEATOX ARCHITECTURAL STUDIO // SPECIFICATION SYNTHESIZER 2.0
        </footer>
      </div>
    </div>
  );
}

export default function NewIdeaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-sm text-zinc-600">
          INITIALIZING ARCHITECTURAL STUDIO...
        </div>
      }
    >
      <NewIdeaFormContent />
    </Suspense>
  );
}
