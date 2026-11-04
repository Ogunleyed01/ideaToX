"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  GitFork,
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  ExternalLink,
  Layers,
  ShieldCheck,
  Star,
  Activity,
  Check,
} from "lucide-react";
import { Idea } from "@/types/idea";

interface SpecGalleryProps {
  liveIdeas: Idea[];
  approvedPrIds: Record<string, boolean>;
  onToggleMergePR: (prId: string, ideaSlug: string, featureText: string) => void;
}

const STATIC_GALLERY_SPECS = [
  {
    id: "agent-router",
    slug: "agent-router",
    title: "B2B AI Agent Router & Fallback Gateway",
    description:
      "Multi-provider LLM gateway orchestrating model fallback, dynamic semantic caching via Redis, and token budget rate limiting.",
    tag: "Autonomous AI",
    category: "ai" as const,
    version: "spec v1.4",
    p99: "< 28ms",
    sla: "99.98% uptime SLA",
    stack: ["FastAPI", "Redis 7.2", "OpenTelemetry"],
    stars: 642,
    forks: 184,
    author: "@maboroshi",
    defaultPR: {
      id: "pr-0-1",
      feature_text: "WebAuthn / Passkey passwordless biometric authentication",
      rationale: "Reduces onboarding drop-off by 40% on mobile browsers and eliminates credential stuffing.",
      proposer: "@sarah_systems",
    },
    demoUrl: "https://agent-router.preview.ideatox.space",
  },
  {
    id: "sqlite-tailscale",
    slug: "sqlite-tailscale",
    title: "Distributed SQLite over Tailscale VPN",
    description:
      "Global low-latency embedded database replica mesh running Litestream replication over zero-trust private network overlays.",
    tag: "Local-First",
    category: "local" as const,
    version: "spec v0.8",
    p99: "14ms Mesh",
    sla: "Encrypted Zero-Trust",
    stack: ["SQLite 3.45", "Go", "Tailscale API"],
    stars: 1208,
    forks: 342,
    author: "@nicolas_v",
    defaultPR: {
      id: "pr-1-1",
      feature_text: "Offline background sync with IndexedDB fallback cache",
      rationale: "Critical for users on intermittent 3G connections in emerging regions.",
      proposer: "@maboroshi",
    },
    demoUrl: "https://sqlite-tailscale.preview.ideatox.space",
  },
  {
    id: "raycast-linear",
    slug: "raycast-linear",
    title: "Raycast Workspace Syncer for Linear & Git",
    description:
      "Instant keyboard-driven issue tracker synchronizer with offline optimistic local storage and bi-directional markdown sync.",
    tag: "Developer Tools",
    category: "devtools" as const,
    version: "spec v3.1",
    p99: "Instant UI",
    sla: "Zero Cold Boot",
    stack: ["TypeScript", "Node.js", "GraphQL"],
    stars: 890,
    forks: 219,
    author: "@elena_k",
    defaultPR: {
      id: "pr-2-1",
      feature_text: "Bi-directional Markdown syncing with Notion workspace databases",
      rationale: "Allows non-technical product managers to read sprint updates natively without touching Linear.",
      proposer: "@elena_arch",
    },
    demoUrl: "https://raycast-linear.preview.ideatox.space",
  },
];

export function SpecGallerySection({
  liveIdeas,
  approvedPrIds,
  onToggleMergePR,
}: SpecGalleryProps) {
  const [filter, setFilter] = useState<"all" | "ai" | "local" | "devtools">("all");

  const filteredSpecs = STATIC_GALLERY_SPECS.filter((spec) => {
    if (filter === "all") return true;
    return spec.category === filter;
  });

  return (
    <section id="specs" className="relative w-full py-24 px-6 bg-dot-matrix">
      <div className="max-w-7xl mx-auto">
        {/* Anti-Slop Heading: Sans + Italic Serif + Inline Squircle */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs text-zinc-600 font-mono uppercase tracking-wider mb-4">
            <Layers size={12} className="text-[#111113]" />
            <span>Curated Architectures</span>
          </div>
          <h2 className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-3xl sm:text-5xl md:text-6xl max-w-3xl leading-[1.12]">
            Production blueprints ready for{" "}
            <span className="font-serif italic font-normal text-zinc-800">
              instant
            </span>{" "}
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#111113] text-white mx-1 align-middle shadow-md">
              <GitFork size={16} className="text-amber-300" />
            </span>{" "}
            <span className="font-serif italic font-normal text-amber-600">
              forking
            </span>
            .
          </h2>
          <p className="mt-4 text-[#52525B] text-base sm:text-lg max-w-2xl">
            Explore community-validated software architectures with live peer reviews, pull requests, and deterministic latency profiles.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: "all", label: "All Blueprints" },
              { id: "ai", label: "Autonomous AI" },
              { id: "local", label: "Local-First" },
              { id: "devtools", label: "Developer Tools" },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilter(btn.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-all ${
                  filter === btn.id
                    ? "bg-[#111113] text-white font-semibold shadow-sm"
                    : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300 hover:text-black"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {filteredSpecs.map((spec) => {
            const isMerged = approvedPrIds[spec.defaultPR.id];

            return (
              <div
                key={spec.id}
                className="bento-white p-6 sm:p-7 flex flex-col justify-between hover:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.1)] transition-all group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-semibold">
                      {spec.version}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-600 font-medium">
                      {spec.author}
                    </span>
                  </div>

                  {/* Title & Tag */}
                  <div className="mt-4">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                      {spec.tag}
                    </span>
                    <h3 className="mt-2 font-sans font-semibold text-[#111113] text-xl leading-snug group-hover:text-amber-800 transition-colors">
                      {spec.title}
                    </h3>
                    <p className="mt-2.5 text-xs text-[#52525B] leading-relaxed">
                      {spec.description}
                    </p>
                  </div>

                  {/* Latency & SLA Badges */}
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <span className="block font-mono text-[10px] text-zinc-400 uppercase">
                        P99 Latency
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700">
                        {spec.p99}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                      <span className="block font-mono text-[10px] text-zinc-400 uppercase">
                        SLA Guarantee
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-800">
                        {spec.sla}
                      </span>
                    </div>
                  </div>

                  {/* Stack Pills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {spec.stack.map((item) => (
                      <span
                        key={item}
                        className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Community Feature PR Review Box */}
                  <div className="mt-5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[11px] text-zinc-600 font-semibold flex items-center gap-1.5">
                        <GitPullRequest size={12} className="text-amber-600" />
                        Pending Feature PR
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        by {spec.defaultPR.proposer}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#111113] leading-snug">
                      "{spec.defaultPR.feature_text}"
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {spec.defaultPR.rationale}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-zinc-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-400">
                        Spec schema verification: Passed
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onToggleMergePR(
                            spec.defaultPR.id,
                            spec.slug,
                            spec.defaultPR.feature_text
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                          isMerged
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-[#111113] text-white hover:bg-zinc-800"
                        }`}
                      >
                        {isMerged ? (
                          <>
                            <Check size={11} />
                            <span>Merged</span>
                          </>
                        ) : (
                          <>
                            <GitPullRequest size={11} />
                            <span>Merge PR</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {spec.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} />
                      {spec.forks}
                    </span>
                  </div>

                  <Link
                    href={`/ideas/${spec.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111113] hover:text-amber-600 transition-colors group/link"
                  >
                    <span>View Spec</span>
                    <ArrowRight
                      size={13}
                      className="transition-transform group-hover/link:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
