"use client";

import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  GitPullRequest,
  Shield,
  Zap,
} from "lucide-react";

export function PersonaBento() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Sparkline data points
  const sparklineData = [18, 22, 19, 24, 16, 14, 21, 15, 12, 14, 16, 12];
  const maxVal = Math.max(...sparklineData);
  const minVal = Math.min(...sparklineData);

  const getSvgY = (val: number) => {
    return 70 - ((val - minVal) / (maxVal - minVal)) * 50;
  };

  const pointsString = sparklineData
    .map((val, idx) => `${idx * 28 + 14},${getSvgY(val)}`)
    .join(" ");

  return (
    <section className="relative w-full py-24 px-6 bg-dot-matrix">
      <div className="max-w-7xl mx-auto">
        {/* Anti-Slop Heading: Sans + Italic Serif + Inline Icon Squircle */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs text-zinc-600 font-mono uppercase tracking-wider mb-4">
            <Layers size={12} className="text-[#111113]" />
            <span>Dual Persona Workflows</span>
          </div>
          <h2 className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-3xl sm:text-5xl md:text-6xl max-w-3xl leading-[1.12]">
            Engineered for{" "}
            <span className="font-serif italic font-normal text-zinc-800">
              architects
            </span>
            , tuned for{" "}
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#111113] text-white mx-1 align-middle shadow-md">
              <Zap size={18} className="text-amber-300" />
            </span>{" "}
            <span className="font-serif italic font-normal text-amber-600">
              builders
            </span>
            .
          </h2>
          <p className="mt-4 text-[#52525B] text-base sm:text-lg max-w-2xl">
            Whether you are formalizing system invariants or hacking on production primitives, IdeaToX aligns high-level guarantees with runnable reality.
          </p>
        </div>

        {/* Dual Persona Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* =========================================================================
              LEFT CARD: FOR ARCHITECTS & TECHNICAL FOUNDERS
             ========================================================================= */}
          <div className="bento-white p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-zinc-100">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Persona: Architect
                  </span>
                  <h3 className="mt-2 font-sans font-semibold text-[#111113] text-2xl">
                    System Invariants &amp; SLA Budgets
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Shield size={20} />
                </div>
              </div>

              <p className="mt-4 text-sm text-[#52525B] leading-relaxed">
                Define deterministic latency bounds, eliminate single points of failure (SPOF), and generate mathematical proofs of state consistency before implementation begins.
              </p>

              {/* 3-Tier Stacked Metric Bars */}
              <div className="mt-8 space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-600 font-medium">1. Feasibility Confidence Score</span>
                    <span className="text-indigo-600 font-bold">98.4%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-600 w-[98.4%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-600 font-medium">2. Edge Cold-Boot SLA (p99 &lt; 15ms)</span>
                    <span className="text-emerald-600 font-bold">12.1ms</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 w-[92%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-zinc-600 font-medium">3. Zero-Trust Security Mesh Proof</span>
                    <span className="text-amber-600 font-bold">100% Pass</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 w-[100%]" />
                  </div>
                </div>
              </div>

              {/* Interactive SVG Sparkline */}
              <div className="mt-8 pt-5 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-zinc-500 flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-indigo-600" />
                    Simulated P99 Latency Curve (12 Edge Clusters)
                  </span>
                  <span className="font-mono text-xs text-emerald-600 font-semibold">
                    Mean: 16.4ms
                  </span>
                </div>

                <div className="relative w-full h-24 bg-zinc-50 rounded-2xl border border-zinc-200/80 p-2 flex items-center justify-center overflow-hidden">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox="0 0 336 80"
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="336" y2="20" stroke="#e4e4e7" strokeDasharray="3 3" />
                    <line x1="0" y1="50" x2="336" y2="50" stroke="#e4e4e7" strokeDasharray="3 3" />

                    {/* Gradient Fill under sparkline */}
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <polygon
                      points={`14,75 ${pointsString} 322,75`}
                      fill="url(#sparklineGrad)"
                    />

                    {/* Polyline */}
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pointsString}
                    />

                    {/* Interactive points */}
                    {sparklineData.map((val, idx) => {
                      const cx = idx * 28 + 14;
                      const cy = getSvgY(val);
                      const isHovered = hoveredPoint === idx;
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 5 : 3.5}
                          className="fill-white stroke-indigo-600 stroke-[2] transition-all cursor-pointer"
                          onMouseEnter={() => setHoveredPoint(idx)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </svg>

                  {hoveredPoint !== null && (
                    <div className="absolute top-2 right-4 px-2 py-1 rounded bg-[#111113] text-white text-[11px] font-mono shadow-md">
                      Cluster {hoveredPoint + 1}: {sparklineData[hoveredPoint]}ms
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              RIGHT CARD: FOR BUILDERS & CORE DEVS (94% SVG Ring & Orbiting Squircles)
             ========================================================================= */}
          <div className="bento-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Ambient subtle decorative halo */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full aurora-amber blur-2xl opacity-60" />

            <div>
              <div className="flex items-center justify-between pb-5 border-b border-zinc-100 relative z-10">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Persona: Builder
                  </span>
                  <h3 className="mt-2 font-sans font-semibold text-[#111113] text-2xl">
                    Executable Architecture Specs
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Cpu size={20} />
                </div>
              </div>

              <p className="mt-4 text-sm text-[#52525B] leading-relaxed relative z-10">
                Skip the boilerplate and start with verified primitives. Export complete Docker compose manifests, schema migration scripts, and mock API tests in a click.
              </p>

              {/* Central 94% SVG Circular Ring Gauge with Orbiting Stack Squircles */}
              <div className="mt-8 relative flex items-center justify-center py-6">
                {/* 94% SVG Circular Ring */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#f4f4f5"
                      strokeWidth="9"
                      fill="transparent"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      stroke="#f59e0b"
                      strokeWidth="9"
                      strokeDasharray={2 * Math.PI * 48}
                      strokeDashoffset={2 * Math.PI * 48 * (1 - 0.94)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>

                  {/* Centered Ring Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-sans font-bold text-4xl text-[#111113] tracking-tight">
                      94%
                    </span>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5 font-semibold">
                      Production Ready
                    </span>
                  </div>
                </div>

                {/* Orbiting Stack Squircles */}
                <div className="absolute -top-1 left-2 sm:left-6 px-3 py-1.5 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-mono text-xs font-semibold text-zinc-800">WASM</span>
                </div>

                <div className="absolute top-2 -right-1 sm:right-4 px-3 py-1.5 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-mono text-xs font-semibold text-zinc-800">SQLite</span>
                </div>

                <div className="absolute -bottom-2 left-6 sm:left-12 px-3 py-1.5 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-mono text-xs font-semibold text-zinc-800">Redis 7.2</span>
                </div>

                <div className="absolute bottom-1 -right-2 sm:right-6 px-3 py-1.5 rounded-2xl bg-white border border-zinc-200/90 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <span className="font-mono text-xs font-semibold text-zinc-800">Tailscale</span>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-8 pt-5 border-t border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>CI/CD schema test suite passed</span>
                </div>
                <span className="font-mono text-[11px] text-zinc-400">
                  342 forks merged
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
