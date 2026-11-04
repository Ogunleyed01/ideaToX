"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  Copy,
  Check,
  Shuffle,
  Lock,
  Unlock,
  Activity,
  ArrowRight,
  GitBranch,
} from "lucide-react";

const RUNTIMES = ["WASM Edge v2", "Go Micro-Engine", "Rust Kernel", "Node.js 22"];
const DATA_LAYERS = ["Distributed SQLite", "Redis 7.2 Cache", "DuckDB on S3", "PostgreSQL Mesh"];

const AUDIENCES = [
  "Autonomous AI Agents",
  "Local-First PWA Users",
  "High-Frequency FinTech",
  "Decentralized IoT Nodes",
  "Edge Telemetry Networks",
];

const PROBLEMS = [
  "orchestrating multi-LLM fallback routing",
  "syncing zero-trust replicas offline",
  "eliminating cold boots under 15ms",
  "enforcing zero-knowledge audit trails",
  "aggregating distributed vector embeddings",
];

const CONSTRAINTS = [
  "under 30ms global edge P99",
  "with zero-trust WireGuard overlays",
  "via conflict-free CRDT state merge",
  "compiled to zero-dependency binary",
  "with client-side biometric authorization",
];

export function StudioShowcase() {
  // Left side interactive spec builder state
  const [selectedRuntime, setSelectedRuntime] = useState(RUNTIMES[0]);
  const [selectedDataLayer, setSelectedDataLayer] = useState(DATA_LAYERS[0]);
  const [targetLatency, setTargetLatency] = useState(28);
  const [copied, setCopied] = useState(false);

  // Right side 3-Reel Synthesizer state
  const [audienceIdx, setAudienceIdx] = useState(0);
  const [problemIdx, setProblemIdx] = useState(0);
  const [constraintIdx, setConstraintIdx] = useState(0);

  const [lockAudience, setLockAudience] = useState(false);
  const [lockProblem, setLockProblem] = useState(false);
  const [lockConstraint, setLockConstraint] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // LED Dot Equalizer animated levels
  const [equalizerLevels, setEqualizerLevels] = useState([4, 6, 3, 5, 2, 6, 5, 4, 3, 5, 6, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEqualizerLevels((prev) =>
        prev.map(() => Math.floor(Math.random() * 5) + 1)
      );
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const handleSpinReels = () => {
    setIsSpinning(true);
    let spins = 0;
    const interval = setInterval(() => {
      if (!lockAudience) setAudienceIdx((prev) => (prev + 1) % AUDIENCES.length);
      if (!lockProblem) setProblemIdx((prev) => (prev + 1) % PROBLEMS.length);
      if (!lockConstraint) setConstraintIdx((prev) => (prev + 1) % CONSTRAINTS.length);
      spins++;
      if (spins > 7) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 80);
  };

  const manifestYaml = `# ideatox.manifest.yaml
version: 1.4
metadata:
  name: "synthesized-${selectedRuntime.toLowerCase().replace(/[^a-z0-9]/g, "-")}"
  runtime: "${selectedRuntime}"
  storage: "${selectedDataLayer}"
guarantees:
  p99_latency_sla: "${targetLatency}ms"
  zero_cold_boot: ${targetLatency < 35 ? "true" : "false"}
  audit_status: "Verified by IdeaToX Synthesizer"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(manifestYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="studio" className="relative w-full py-24 px-6 bg-dot-matrix">
      <div className="max-w-7xl mx-auto">
        {/* Anti-Slop Primary Section Heading: Sans + Italic Serif + Inline Icon Squircle */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs text-zinc-600 font-mono uppercase tracking-wider mb-4">
            <Cpu size={12} className="text-[#111113]" />
            <span>Dual-Environment Studio</span>
          </div>
          <h2 className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-3xl sm:text-5xl md:text-6xl max-w-3xl leading-[1.12]">
            Build interactively, execute on{" "}
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0D0E12] text-white mx-1 align-middle shadow-md">
              <Terminal size={18} className="text-amber-300" />
            </span>{" "}
            the{" "}
            <span className="font-serif italic font-normal text-amber-600">
              Obsidian Console
            </span>
            .
          </h2>
          <p className="mt-4 text-[#52525B] text-base sm:text-lg max-w-2xl">
            Configure system parameters on the light editorial canvas, while real-time synthesis and telemetry stream through the dark hardware console.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              LEFT: LIGHT INTERACTIVE SPEC BUILDER (Bento White Container)
             ========================================================================= */}
          <div className="lg:col-span-5 bento-white p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="font-sans font-semibold text-[#111113] text-base">
                    Interactive Spec Builder
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2 py-0.5 rounded-full">
                  Config Editor
                </span>
              </div>

              {/* Step 1: Runtime Engine */}
              <div className="mt-6">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-2.5">
                  1. Execution Runtime
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RUNTIMES.map((runtime) => (
                    <button
                      key={runtime}
                      type="button"
                      onClick={() => setSelectedRuntime(runtime)}
                      className={`px-3 py-2 text-xs font-mono rounded-xl border text-left transition-all ${
                        selectedRuntime === runtime
                          ? "bg-[#111113] text-white border-[#111113] shadow-sm font-semibold"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {runtime}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Persistence & Cache Layer */}
              <div className="mt-6">
                <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold block mb-2.5">
                  2. Persistence &amp; State Layer
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DATA_LAYERS.map((layer) => (
                    <button
                      key={layer}
                      type="button"
                      onClick={() => setSelectedDataLayer(layer)}
                      className={`px-3 py-2 text-xs font-mono rounded-xl border text-left transition-all ${
                        selectedDataLayer === layer
                          ? "bg-[#111113] text-white border-[#111113] shadow-sm font-semibold"
                          : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {layer}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Latency Slider */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    3. Target P99 Latency SLA
                  </label>
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {targetLatency}ms
                  </span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="120"
                  value={targetLatency}
                  onChange={(e) => setTargetLatency(Number(e.target.value))}
                  className="w-full accent-[#111113] h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Manifest Output */}
              <div className="mt-6 pt-4 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-zinc-500">
                    Compiled Spec Manifest
                  </span>
                  <button
                    onClick={handleCopy}
                    type="button"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-600 hover:text-black transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy YAML</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800">
                  {manifestYaml}
                </pre>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-xs text-zinc-500">Ready to instantiate blueprint?</span>
              <Link
                href="/ideas/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#111113] text-white text-xs font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
              >
                <span>Fork into Studio</span>
                <ArrowRight size={12} className="text-amber-300" />
              </Link>
            </div>
          </div>

          {/* =========================================================================
              RIGHT: DARK #0D0E12 OBSIDIAN STUDIO CONSOLE
             ========================================================================= */}
          <div className="lg:col-span-7 console-obsidian p-7 sm:p-8 shadow-2xl relative flex flex-col justify-between">
            {/* Ambient telemetry glow inside dark console */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />

            {/* Console Header Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono text-xs text-zinc-300 tracking-wider">
                  console@ideatox:~# synthesizer.live
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider uppercase">
                  Telemetry Stream Active
                </span>
              </div>
            </div>

            {/* Sub-component A: 3-REEL SYNTHESIZER */}
            <div className="mt-6 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                    3-Reel Idea Synthesizer
                  </span>
                </div>
                <button
                  onClick={handleSpinReels}
                  disabled={isSpinning}
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-medium hover:bg-amber-400/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Shuffle size={13} className={isSpinning ? "animate-spin" : ""} />
                  <span>{isSpinning ? "Spinning..." : "Shuffle Reels"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Reel 1: Audience */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                      Reel 1: Audience
                    </span>
                    <button
                      onClick={() => setLockAudience(!lockAudience)}
                      className="text-zinc-400 hover:text-white transition-colors"
                      title={lockAudience ? "Unlock reel" : "Lock reel"}
                    >
                      {lockAudience ? <Lock size={12} className="text-amber-400" /> : <Unlock size={12} />}
                    </button>
                  </div>
                  <p className="font-sans font-medium text-white text-sm h-12 flex items-center">
                    {AUDIENCES[audienceIdx]}
                  </p>
                </div>

                {/* Reel 2: Problem */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                      Reel 2: Problem
                    </span>
                    <button
                      onClick={() => setLockProblem(!lockProblem)}
                      className="text-zinc-400 hover:text-white transition-colors"
                      title={lockProblem ? "Unlock reel" : "Lock reel"}
                    >
                      {lockProblem ? <Lock size={12} className="text-amber-400" /> : <Unlock size={12} />}
                    </button>
                  </div>
                  <p className="font-sans font-medium text-white text-sm h-12 flex items-center">
                    {PROBLEMS[problemIdx]}
                  </p>
                </div>

                {/* Reel 3: Constraint */}
                <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider">
                      Reel 3: Constraint
                    </span>
                    <button
                      onClick={() => setLockConstraint(!lockConstraint)}
                      className="text-zinc-400 hover:text-white transition-colors"
                      title={lockConstraint ? "Unlock reel" : "Lock reel"}
                    >
                      {lockConstraint ? <Lock size={12} className="text-amber-400" /> : <Unlock size={12} />}
                    </button>
                  </div>
                  <p className="font-sans font-medium text-white text-sm h-12 flex items-center">
                    {CONSTRAINTS[constraintIdx]}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-component B: LED DOT-MATRIX EQUALIZER */}
            <div className="mt-7 pt-5 border-t border-white/[0.08] relative z-10">
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={12} className="text-emerald-400" />
                  LED Dot-Matrix Telemetry Equalizer
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  Load: 41.2 req/s • Zero Jitter
                </span>
              </div>

              {/* Dot matrix grid */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/[0.06] flex items-end justify-between h-20 px-4">
                {equalizerLevels.map((lvl, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1 items-center">
                    {[6, 5, 4, 3, 2, 1].map((dotRow) => {
                      const isActive = dotRow <= lvl;
                      const isHigh = dotRow >= 5;
                      const isMid = dotRow >= 3;
                      return (
                        <span
                          key={dotRow}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            isActive
                              ? isHigh
                                ? "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                                : isMid
                                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                                : "bg-emerald-500/70"
                              : "bg-white/[0.08]"
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-component C: LIVE LINEAGE STATUS ROWS (Strict Semantic Pills inside Dark Console) */}
            <div className="mt-7 pt-5 border-t border-white/[0.08] relative z-10">
              <span className="font-mono text-[11px] text-zinc-400 uppercase tracking-wider block mb-3">
                Live Lineage Status Rows
              </span>

              <div className="space-y-2">
                {[
                  {
                    name: "agent-router / main",
                    commit: "b82f09a",
                    author: "@maboroshi",
                    status: "Successful / Shipped",
                    statusType: "shipped",
                  },
                  {
                    name: "sqlite-tailscale / v0.8",
                    commit: "71e42c1",
                    author: "@nicolas_v",
                    status: "Follow-up / Seeking Dev",
                    statusType: "seeking",
                  },
                  {
                    name: "automerge-crdt / edge-sync",
                    commit: "45a190b",
                    author: "@sarah_systems",
                    status: "Successful / Shipped",
                    statusType: "shipped",
                  },
                ].map((row) => (
                  <div
                    key={row.name}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <GitBranch size={13} className="text-zinc-400" />
                      <span className="font-mono text-xs text-zinc-200 font-medium">
                        {row.name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {row.commit}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-zinc-400">
                        {row.author}
                      </span>
                      {/* Semantic Status Pills (Inside Dark Console) matching UI_SKILL.md */}
                      <span
                        className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                          row.statusType === "shipped"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
