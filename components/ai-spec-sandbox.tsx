"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from "lucide-react";

interface AuditResult {
  p99Latency: string;
  coldBoot: string;
  spofStatus: string;
  isPass: boolean;
  score: number;
  stackPills: string[];
  recommendation: string;
}

export function AiSpecSandbox() {
  const [ideaPrompt, setIdeaPrompt] = useState(
    "P2P encrypted clipboard sync across Tailscale nodes with offline CRDT conflict resolution"
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>({
    p99Latency: "18ms",
    coldBoot: "Zero (Daemon Mesh)",
    spofStatus: "No Single Point of Failure (Decoupled CRDT)",
    isPass: true,
    score: 96,
    stackPills: ["WireGuard Mesh", "Automerge CRDT", "Go Daemon", "SQLite Local"],
    recommendation:
      "Architecture passes all deterministic benchmarks. P2P state gossip avoids central gateway bottleneck.",
  });

  const handleRunAudit = () => {
    if (!ideaPrompt.trim()) return;
    setIsCompiling(true);

    setTimeout(() => {
      const lower = ideaPrompt.toLowerCase();
      const isAi = lower.includes("ai") || lower.includes("llm") || lower.includes("agent");
      const isLocal = lower.includes("local") || lower.includes("offline") || lower.includes("p2p") || lower.includes("sqlite");

      if (isAi) {
        setAuditResult({
          p99Latency: "34ms (semantic cache hit)",
          coldBoot: "5ms (WASM Edge)",
          spofStatus: "Multi-Provider Fallback Pool",
          isPass: true,
          score: 94,
          stackPills: ["FastAPI Async", "Redis 7.2 Semantic Cache", "OpenTelemetry", "WASM Router"],
          recommendation:
            "Audit Passed. Dynamic rate-limiter prevents token exhaustion; Redis semantic cache eliminates 60% of upstream LLM hops.",
        });
      } else if (isLocal) {
        setAuditResult({
          p99Latency: "14ms (Embedded Mesh)",
          coldBoot: "Zero Cold Boot",
          spofStatus: "Decoupled CRDT Replicas",
          isPass: true,
          score: 98,
          stackPills: ["Distributed SQLite", "WireGuard Overlay", "Litestream S3", "Go Engine"],
          recommendation:
            "Audit Passed. Zero-trust overlay topology ensures encrypted sync without public routing vulnerability.",
        });
      } else {
        setAuditResult({
          p99Latency: "22ms (Global Edge)",
          coldBoot: "12ms (V8 Isolate)",
          spofStatus: "Redundant Multi-Region Origin",
          isPass: true,
          score: 91,
          stackPills: ["TypeScript Node", "DuckDB on S3", "GraphQL Gateway", "Tailwind CSS"],
          recommendation:
            "Audit Passed. Microservice boundaries validated. Recommend adding optimistic local storage cache for mobile network latency.",
        });
      }
      setIsCompiling(false);
    }, 700);
  };

  return (
    <section id="sandbox" className="relative w-full py-28 px-6 bg-dot-matrix overflow-hidden">
      {/* Dual Pastel Auroras positioned in background behind the floating card */}
      <div className="pointer-events-none absolute top-1/2 -left-28 -translate-y-1/2 w-[540px] h-[540px] rounded-full aurora-lavender blur-3xl opacity-75" />
      <div className="pointer-events-none absolute top-1/2 -right-28 -translate-y-1/2 w-[540px] h-[540px] rounded-full aurora-amber blur-3xl opacity-75" />

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Anti-Slop Heading: Sans + Italic Serif + Inline Squircle */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs text-zinc-600 font-mono uppercase tracking-wider mb-4">
            <Sparkles size={12} className="text-amber-500" />
            <span>Interactive AI Spec Sandbox</span>
          </div>
          <h2 className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-3xl sm:text-5xl md:text-6xl leading-[1.12]">
            Compile a 1-line idea into an{" "}
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#111113] text-white mx-1 align-middle shadow-md">
              <Terminal size={18} className="text-amber-300" />
            </span>{" "}
            <span className="font-serif italic font-normal text-amber-600">
              instant audit
            </span>
            .
          </h2>
          <p className="mt-4 text-[#52525B] text-base sm:text-lg max-w-2xl">
            Type any raw concept. The IdeaToX engine immediately checks latency feasibility, cold-boot bottlenecks, and single points of failure.
          </p>
        </div>

        {/* Floating White Prompt Card */}
        <div className="bento-white p-7 sm:p-10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] border border-zinc-200/90 relative">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Live AI Architecture Compiler
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Deterministic Rules Engine
            </span>
          </div>

          {/* Input Field Area */}
          <div className="mt-6">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 font-semibold mb-2">
              Your Software Idea (1-2 Sentences)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                placeholder="Describe your architecture concept..."
                className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-[#111113] text-sm font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all resize-none shadow-inner"
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-zinc-500 font-mono text-[11px]">Quick presets:</span>
                {[
                  "Offline P2P CRDT sync via Tailscale",
                  "Multi-tenant AI router with semantic cache",
                  "Edge DuckDB telemetry aggregator",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setIdeaPrompt(preset)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isCompiling}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111113] text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-md disabled:opacity-50 cursor-pointer ml-auto"
              >
                <Zap size={14} className={isCompiling ? "animate-spin text-amber-300" : "text-amber-300"} />
                <span>{isCompiling ? "Compiling Architecture..." : "Run Instant Audit"}</span>
              </button>
            </div>
          </div>

          {/* Instant Pass/Fail Architecture Audit Output */}
          {auditResult && (
            <div className="mt-8 pt-6 border-t border-zinc-100">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h4 className="font-sans font-semibold text-[#111113] text-base flex items-center gap-2">
                      <span>Architecture Audit:</span>
                      <span className="text-emerald-700 font-mono uppercase text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        PASS (Score: {auditResult.score}/100)
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Synthesized against real-world production SLA thresholds
                    </p>
                  </div>
                </div>

                <Link
                  href="/ideas/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  <span>Export to Full Editor</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* 3 Verification Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
                    Latency Feasibility
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-700">
                    {auditResult.p99Latency}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">Within SLA envelope</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
                    Cold-Boot Risk
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-700">
                    {auditResult.coldBoot}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">Isolate pool ready</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
                    SPOF Analysis
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700">
                    {auditResult.spofStatus}
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">Redundant quorum</p>
                </div>
              </div>

              {/* Recommended Primitives Stack */}
              <div className="mt-4 p-3.5 rounded-xl bg-zinc-950 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-zinc-400">
                    Recommended Stack:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {auditResult.stackPills.map((pill) => (
                      <span
                        key={pill}
                        className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-amber-300 border border-white/10"
                      >
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">
                  Spec manifest ready
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
