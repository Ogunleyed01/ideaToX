"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  GitFork,
  Terminal,
  Layers,
  Globe,
  Zap,
  Code2,
  CheckCircle2,
  Rocket,
  ShieldCheck,
  Award,
  BookOpen,
  Users,
  Check,
  ExternalLink,
  ChevronDown,
  GitPullRequest,
  Heart,
  Star,
  Flame,
  Lightbulb,
} from "lucide-react";
import { FloatingNavbar } from "@/components/floating-navbar";
import { ObsidianMegaFooter } from "@/components/obsidian-mega-footer";

const PILLARS = [
  {
    step: "01",
    title: "Structured Specifications",
    tagline: "No walls of text. Pure engineering clarity.",
    description:
      "Every idea on IdeaToX follows a strict schema: a 140-character hook, a validated problem statement, checkable MVP deliverables, target regions, and recommended technology stacks.",
    icon: Layers,
    color: "from-amber-500/20 to-amber-500/0",
    badge: "Anti-Slop Schema",
    features: [
      "Standardized 5-bullet MVP checklist",
      "Explicit difficulty tiers: Weekend, Side Project, Full SaaS",
      "Target geography tagging (Global, Nigeria, US, India, etc.)",
      "Tech stack constraints (Next.js, Rust, Flutter, ESP32)",
    ],
  },
  {
    step: "02",
    title: "Chaos Synthesizer & AI Spec Assistant",
    tagline: "From 1-line prompt to comprehensive blueprint in seconds.",
    description:
      "Stuck on what to build? The interactive 3-Reel Chaos Machine spins audience, problem, and wildcard technical constraints. Or write a one-line idea and let our AI expand it into production-ready specifications.",
    icon: Sparkles,
    color: "from-indigo-500/20 to-indigo-500/0",
    badge: "Gemini 2.5 Flash",
    features: [
      "3-reel generative mechanical slot synthesizer",
      "Deterministic local fallback when offline",
      "Instant architectural validation & pass/fail audit",
      "Direct conversion into community-forkable specs",
    ],
  },
  {
    step: "03",
    title: "Git-Style Lineage & Feature PRs",
    tagline: "Branching ideas the way engineers branch code.",
    description:
      "Good ideas evolve through remixing. Fork any specification to adapt it for your local country, different stack, or specialized niche. Propose scope additions or removals via Community Feature PRs.",
    icon: GitFork,
    color: "from-purple-500/20 to-purple-500/0",
    badge: "Lineage Graph",
    features: [
      "Self-referencing parent/child fork lineage tree",
      "Full attribute inheritance with pivot diff tracking",
      "Community Feature PRs (+ Add / - Remove Scope)",
      "Idea author 1-click Approve & Merge workflow",
    ],
  },
  {
    step: "04",
    title: "Proof-of-Work Shipped Showcase",
    tagline: "Bridging the gap between concept and production code.",
    description:
      "An idea is only as good as its implementation. Developers link their public GitHub repositories and live deployments directly to the spec, building verifiable portfolio street cred.",
    icon: Rocket,
    color: "from-emerald-500/20 to-emerald-500/0",
    badge: "Verified Builds",
    features: [
      "Showcase GitHub repo and live production demo links",
      "Status tracking: Currently Building vs. Shipped",
      "Automated reputation score rewards for verified builders",
      "Direct contributor attribution on the original blueprint",
    ],
  },
];

const REPUTATION_CRITERIA = [
  { action: "Community Star / Upvote", points: "+10 pts", recipient: "Idea Author" },
  { action: "Fork / Remix Created", points: "+25 pts", recipient: "Parent Spec Author" },
  { action: "Feature PR Merged", points: "+30 pts", recipient: "PR Proposer" },
  { action: "Proof-of-Work Build Shipped", points: "+50 pts", recipient: "Developer Builder" },
];

const BADGES = [
  {
    name: "Ideator",
    icon: Lightbulb,
    color: "text-amber-500 bg-amber-50 border-amber-200",
    criteria: "Authored original, verified project blueprints in the registry.",
  },
  {
    name: "Remixer",
    icon: GitFork,
    color: "text-purple-500 bg-purple-50 border-purple-200",
    criteria: "Forked existing concepts to adapt for regional niches or alternative stacks.",
  },
  {
    name: "Shipper",
    icon: Rocket,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
    criteria: "Turned raw blueprints into working code with live URLs and GitHub repositories.",
  },
  {
    name: "Architect",
    icon: ShieldCheck,
    color: "text-indigo-500 bg-indigo-50 border-indigo-200",
    criteria: "Authored community feature pull requests approved and merged by spec owners.",
  },
];

const ABOUT_FAQS = [
  {
    q: "Can anyone build the project ideas posted on IdeaToX?",
    a: "Yes, 100%. All ideas submitted to IdeaToX are published as open concepts under an open-source ethos. Anyone is welcome and encouraged to implement, fork, or commercialize any blueprint found in the registry.",
  },
  {
    q: "How does the Forking (Remixing) mechanic work?",
    a: "When you fork a spec, a new draft is pre-filled with the original idea's data. You can adapt the problem statement, add regional constraints (e.g. pivoting an expense splitter for MPesa in Kenya), or change the suggested stack. The new spec permanently credits the parent idea with an interactive Lineage Graph.",
  },
  {
    q: "What prevents IdeaToX from filling up with generic AI slop?",
    a: "Our strict anti-slop guidelines require checkable MVP bullet points, explicit difficulty ratings, and strict schema validation. We deliberately eliminate unstructured text walls in favor of concise, actionable engineering blueprints.",
  },
  {
    q: "How do I claim an idea or show that I built it?",
    a: "Navigate to any idea page, switch to the 'Shipped Builds' tab, and click 'Submit Build / Demo'. Submit your public GitHub repo URL and live URL. Once linked, you earn +50 reputation points and the Shipper badge on your developer profile.",
  },
  {
    q: "What is the technical stack powering IdeaToX?",
    a: "IdeaToX is built with Next.js 16 App Router, TypeScript, Tailwind CSS, Supabase (PostgreSQL with Row Level Security), and Google Gemini 2.5 Flash for AI specification compilation.",
  },
];

export default function AboutPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111113] selection:bg-amber-100 selection:text-amber-900 relative overflow-x-hidden">
      {/* Background Dot Matrix Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: "radial-gradient(#D4D4D8 1.15px, transparent 1.15px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Ambient Pastel Auroras */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none z-0 blur-[130px] opacity-40 bg-[radial-gradient(circle,rgba(165,180,252,0.42)_0%,rgba(196,181,253,0.18)_45%,transparent_70%)]" />
      <div className="fixed top-1/4 -right-40 w-[550px] h-[550px] rounded-full pointer-events-none z-0 blur-[140px] opacity-35 bg-[radial-gradient(circle,rgba(253,224,71,0.40)_0%,rgba(251,191,36,0.16)_45%,transparent_70%)]" />

      {/* Floating Dynamic Island Navbar */}
      <FloatingNavbar onOpenSearch={() => {}} />

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* =========================================================================
            1. HERO STAGE
           ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-sm text-xs font-mono font-medium text-zinc-700 mb-6">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>PLATFORM SPECIFICATION // ARCHITECTURE MANIFESTO</span>
          </div>

          <h1 className="font-sans font-bold text-4xl sm:text-6xl md:text-7xl tracking-[-0.04em] text-[#111113] leading-[1.08] mb-6">
            The GitHub + Dribbble for{" "}
            <span className="font-serif italic font-normal text-amber-600 block sm:inline">
              project ideas & specs
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Growing developers struggle with what to build next, while senior engineers and founders have high-value specs scattered across messy text walls. IdeaToX gives ideas version-control, forkable lineages, and verifiable proof-of-work.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/ideas"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#111113] text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-md group"
            >
              <span>Explore 50+ Blueprints</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-50 transition-colors border border-zinc-200/90 shadow-sm"
            >
              <Sparkles size={15} className="text-amber-500" />
              <span>Compile a Spec with AI</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-3xl bg-white/70 border border-zinc-200/80 backdrop-blur-md shadow-sm">
            <div className="text-center p-2">
              <div className="font-mono font-bold text-2xl sm:text-3xl text-[#111113]">50+</div>
              <div className="text-xs text-zinc-500 mt-0.5">Curated Blueprints</div>
            </div>
            <div className="text-center p-2 border-l border-zinc-200/60">
              <div className="font-mono font-bold text-2xl sm:text-3xl text-amber-600">4 Tiers</div>
              <div className="text-xs text-zinc-500 mt-0.5">Lineage Depths</div>
            </div>
            <div className="text-center p-2 border-l border-zinc-200/60">
              <div className="font-mono font-bold text-2xl sm:text-3xl text-indigo-600">100%</div>
              <div className="text-xs text-zinc-500 mt-0.5">Open & Free to Build</div>
            </div>
            <div className="text-center p-2 border-l border-zinc-200/60">
              <div className="font-mono font-bold text-2xl sm:text-3xl text-emerald-600">0 Slop</div>
              <div className="text-xs text-zinc-500 mt-0.5">Checkable MVPs Only</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. THE PROBLEM & PHILOSOPHY
           ========================================================================= */}
        <section className="mb-28">
          <div className="p-8 sm:p-14 rounded-[32px] bg-[#0D0E12] text-white border border-white/[0.08] relative overflow-hidden shadow-2xl">
            {/* Console Glow */}
            <div className="pointer-events-none absolute -top-24 right-0 w-[450px] h-[300px] bg-amber-500/10 rounded-full blur-[110px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-[450px] h-[300px] bg-indigo-500/10 rounded-full blur-[110px]" />

            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono mb-6 border border-white/10">
                <Terminal size={12} />
                <span>ARCHITECTURE MANIFESTO // WHY SPEC BEFORE CODE</span>
              </div>

              <h2 className="font-sans font-bold text-3xl sm:text-5xl tracking-[-0.035em] text-white leading-tight mb-6">
                Most software projects fail because of{" "}
                <span className="font-serif italic font-normal text-amber-300">
                  ambiguous scope
                </span>
                , not coding skill.
              </h2>

              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed mb-8">
                Every developer has experienced tutorial purgatory: you know how to write React, Node, or Python, but you spend 3 days agonizing over what to build next. Meanwhile, ideas on Reddit or Twitter are unstructured paragraphs with no defined MVP boundary.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="text-amber-400 font-mono text-xs mb-1">01 / FOR BUILDERS</div>
                  <div className="font-semibold text-white text-sm mb-1">Ready-to-Code Specs</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Stop guessing architecture. Get 5 checkable features, recommended tech stacks, and realistic time estimates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="text-indigo-400 font-mono text-xs mb-1">02 / FOR IDEATORS</div>
                  <div className="font-semibold text-white text-sm mb-1">Find Serious Collaborators</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Formalize your real-world domain pain point into an open blueprint and attract technical builders ready to co-found.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div className="text-emerald-400 font-mono text-xs mb-1">03 / FOR REMIXERS</div>
                  <div className="font-semibold text-white text-sm mb-1">Niche & Local Pivots</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Fork proven concepts for specific emerging markets or offline-first constraints while preserving attribution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. THE 4 CORE MECHANICS
           ========================================================================= */}
        <section className="mb-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-sm text-xs font-mono font-medium text-zinc-700 mb-4">
              <span>HOW IDEATOX WORKS</span>
            </div>
            <h2 className="font-sans font-bold text-3xl sm:text-5xl tracking-[-0.035em] text-[#111113]">
              Four primitives of{" "}
              <span className="font-serif italic font-normal text-amber-600">
                idea version control
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.step}
                  className="rounded-[28px] bg-white border border-zinc-200/80 p-8 sm:p-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.06)] flex flex-col justify-between relative overflow-hidden group hover:border-zinc-300 transition-all"
                >
                  <div
                    className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${pillar.color} blur-3xl pointer-events-none`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-mono font-bold shadow-sm">
                        <Icon size={22} className="text-amber-400" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
                          STEP {pillar.step}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-xs font-mono font-medium">
                          {pillar.badge}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-sans font-bold text-2xl text-[#111113] tracking-tight mb-2">
                      {pillar.title}
                    </h3>
                    <p className="font-serif italic text-amber-700 text-sm mb-4">
                      {pillar.tagline}
                    </p>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-zinc-100">
                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-3">
                      SPECIFICATION ATTRIBUTES
                    </div>
                    <ul className="space-y-2">
                      {pillar.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-zinc-700">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            4. REPUTATION ALGORITHM & DEVELOPER BADGES
           ========================================================================= */}
        <section className="mb-28">
          <div className="rounded-[32px] bg-white border border-zinc-200/80 p-8 sm:p-12 shadow-sm">
            <div className="max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-mono mb-4 border border-amber-200">
                <Award size={12} />
                <span>TELEMETRY & PROOF-OF-WORK METRICS</span>
              </div>
              <h2 className="font-sans font-bold text-3xl sm:text-4xl text-[#111113] tracking-tight">
                The Developer Reputation Engine
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base mt-2">
                Reputation isn’t based on vanity metrics or followers. It measures verifiable architectural impact: authored blueprints, merged pull requests, and working implementations.
              </p>
            </div>

            {/* Score Calculation Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                  REPUTATION SCORE FORMULA
                </h3>
                <div className="rounded-2xl border border-zinc-200/80 overflow-hidden divide-y divide-zinc-100 bg-[#FAF9F6]">
                  {REPUTATION_CRITERIA.map((crit, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-zinc-800">{crit.action}</div>
                        <div className="text-xs text-zinc-500">Credited to: {crit.recipient}</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs border border-emerald-200">
                        {crit.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                  DEVELOPER RANK TIERS
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Principal Systems Architect</div>
                      <div className="text-xs text-zinc-500">Senior ecosystem leader & prolific shipper</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      3,000+ pts
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Staff Specification Lead</div>
                      <div className="text-xs text-zinc-500">Curates high-impact multi-tenant specs</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      1,800 - 2,999 pts
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Senior Full-Stack Builder</div>
                      <div className="text-xs text-zinc-500">Consistent implementation & active remixer</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      800 - 1,799 pts
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-zinc-900">Ecosystem Contributor</div>
                      <div className="text-xs text-zinc-500">Active community member building proofs</div>
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                      300 - 799 pts
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div>
              <h3 className="text-xs font-mono font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                DEVELOPER BADGES
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {BADGES.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div key={b.name} className="p-5 rounded-2xl bg-zinc-50/70 border border-zinc-200/70">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center border ${b.color}`}>
                          <Icon size={16} />
                        </span>
                        <span className="font-bold text-sm text-zinc-900">{b.name}</span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{b.criteria}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FREQUENTLY ASKED QUESTIONS
           ========================================================================= */}
        <section className="mb-28 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 shadow-sm text-xs font-mono font-medium text-zinc-700 mb-4">
              <span>FAQ</span>
            </div>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-[#111113] tracking-tight">
              Platform & Architecture Answers
            </h2>
          </div>

          <div className="divide-y divide-zinc-200 border-y border-zinc-200 bg-white/60 rounded-3xl p-6 sm:p-8 backdrop-blur-sm border border-zinc-200/80">
            {ABOUT_FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="py-5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left flex items-center justify-between gap-4 font-semibold text-base sm:text-lg text-zinc-900 hover:text-amber-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-zinc-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-amber-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-sm text-zinc-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            6. LAUNCHPAD CTA
           ========================================================================= */}
        <section className="p-8 sm:p-14 rounded-[32px] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 text-center relative overflow-hidden shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-white border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-sm">
              <Sparkles size={22} />
            </div>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-[#111113] tracking-tight mb-3">
              Start building your next idea today
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed mb-8">
              Explore 50+ curated blueprints across Beginner, Intermediate, and Advanced tiers, or write your first software specification in 2 minutes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/ideas"
                className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[#111113] text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shadow-md group"
              >
                <span>Browse Idea Bank</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/ideas/new"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-zinc-800 text-sm font-semibold hover:bg-zinc-50 transition-colors border border-zinc-200 shadow-sm"
              >
                <span>Publish a Blueprint</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Obsidian Mega Footer */}
      <ObsidianMegaFooter />
    </div>
  );
}
