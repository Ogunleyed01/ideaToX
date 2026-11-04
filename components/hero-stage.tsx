"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  GitFork,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Terminal,
  Activity,
} from "lucide-react";

export function HeroStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Smooth multi-plane parallax depth mappings
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);

  const leftCardY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const leftCardRotate = useTransform(scrollYProgress, [0, 1], [-6, -11]);

  const rightCardY = useTransform(scrollYProgress, [0, 1], [0, -190]);
  const rightCardRotate = useTransform(scrollYProgress, [0, 1], [6, 12]);

  const diamondY = useTransform(scrollYProgress, [0, 1], [0, -160]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex flex-col justify-between pt-28 pb-10 overflow-hidden bg-[#FAF9F6]"
    >

      {/* =========================================================================
          ROTATED 45-DEGREE DIAMOND STACK TILES (Floating Parallax Decorative Anchors)
         ========================================================================= */}
      <motion.div
        style={{ y: diamondY }}
        className="pointer-events-none absolute top-36 left-[8%] hidden xl:flex flex-col gap-3 items-center z-0"
      >
        <div className="w-10 h-10 rotate-45 rounded-xl bg-white border border-zinc-200/90 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] flex items-center justify-center">
          <Terminal size={14} className="-rotate-45 text-zinc-700" />
        </div>
        <div className="w-7 h-7 rotate-45 rounded-lg bg-amber-100/80 border border-amber-300/50 shadow-sm flex items-center justify-center">
          <Zap size={11} className="-rotate-45 text-amber-800" />
        </div>
      </motion.div>

      <motion.div
        style={{ y: diamondY }}
        className="pointer-events-none absolute top-40 right-[9%] hidden xl:flex flex-col gap-3 items-center z-0"
      >
        <div className="w-10 h-10 rotate-45 rounded-xl bg-white border border-zinc-200/90 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] flex items-center justify-center">
          <Cpu size={14} className="-rotate-45 text-zinc-700" />
        </div>
        <div className="w-8 h-8 rotate-45 rounded-lg bg-indigo-100/80 border border-indigo-200 shadow-sm flex items-center justify-center">
          <Layers size={12} className="-rotate-45 text-indigo-700" />
        </div>
      </motion.div>

      {/* =========================================================================
          HERO CENTRAL STAGE
         ========================================================================= */}
      <div className="relative w-full max-w-6xl mx-auto px-6 flex-1 flex flex-col justify-center items-center text-center z-10">
        <motion.div
          style={{ y: heroContentY, opacity: heroContentOpacity }}
          className="w-full flex flex-col items-center"
        >
          {/* Eyebrow Status Pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] text-xs text-[#111113] font-medium mb-8 hover:border-zinc-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-zinc-500 font-semibold tracking-wider uppercase">
              IdeaToX Engine v1.0
            </span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-700 font-medium flex items-center gap-1">
              Deterministic Software Architecture
              <Sparkles size={12} className="text-amber-500" />
            </span>
          </motion.div>

          {/* Primary Section Heading (Strict Anti-Slop: Sans + Italic Serif + Inline Icon Squircle) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-4xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.08] max-w-5xl"
          >
            From chaotic{" "}
            <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#111113] text-white text-base sm:text-lg font-mono mx-1.5 align-middle shadow-lg border border-white/10 hover:rotate-6 transition-transform">
              &gt;_
            </span>{" "}
            <span className="font-serif italic font-normal text-zinc-800">
              notepads
            </span>{" "}
            to production{" "}
            <span className="font-serif italic font-normal text-amber-600 underline decoration-amber-400/40 decoration-wavy decoration-1 underline-offset-8">
              architectures
            </span>
            .
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-7 text-base sm:text-lg md:text-xl text-[#52525B] max-w-2xl font-normal leading-relaxed"
          >
            Synthesize raw concepts into validated system blueprints, interactive
            lineage trees, and stress-tested latency models before writing a
            single line of code.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
          >
            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#111113] text-white text-sm font-semibold hover:bg-zinc-800 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.3)] transition-all group"
            >
              <span>Compile Your Spec</span>
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1 text-amber-300"
              />
            </Link>

            <a
              href="#studio"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-[#111113] text-sm font-medium border border-zinc-200/90 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)] hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            >
              <Activity size={16} className="text-zinc-500" />
              <span>Explore Live Studio</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                50+ specs
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* =========================================================================
            TILTED FLOATING PROOF CARDS (-rotate-6 & rotate-6 with parallax offsets)
           ========================================================================= */}
        <div className="relative w-full max-w-5xl mt-12 sm:mt-16 pointer-events-none">
          {/* Left Proof Card (-rotate-6) */}
          <motion.div
            style={{ y: leftCardY, rotate: leftCardRotate }}
            className="pointer-events-auto absolute -top-8 -left-4 sm:left-4 md:left-8 w-64 sm:w-72 bento-white p-4 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] border border-zinc-200/90 z-20 text-left"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-[11px] font-semibold text-zinc-800">
                  agent-router.spec
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-medium border border-emerald-200/60">
                &lt; 28ms P99
              </span>
            </div>
            <div className="mt-2.5">
              <p className="text-xs text-zinc-600 font-medium line-clamp-2">
                Multi-provider LLM gateway orchestrating dynamic Redis semantic cache
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    FastAPI
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    Redis 7.2
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                  <GitFork size={11} />
                  <span>184</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Proof Card (rotate-6) */}
          <motion.div
            style={{ y: rightCardY, rotate: rightCardRotate }}
            className="pointer-events-auto absolute -top-16 -right-4 sm:right-4 md:right-8 w-64 sm:w-72 bento-white p-4 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] border border-zinc-200/90 z-20 text-left"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="font-mono text-[11px] font-semibold text-zinc-800">
                  sqlite-tailscale.spec
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-medium border border-indigo-200/60">
                WireGuard Mesh
              </span>
            </div>
            <div className="mt-2.5">
              <p className="text-xs text-zinc-600 font-medium line-clamp-2">
                Embedded database replica mesh with Litestream zero-trust overlay
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    Go
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    SQLite
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-medium">
                  <ShieldCheck size={12} />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =========================================================================
          ECOSYSTEM LOGO BAR (Anchored at Bottom of Full Viewport)
         ========================================================================= */}
      <div className="relative w-full max-w-5xl mx-auto px-6 mt-16 pt-6 border-t border-zinc-200/70 z-10">
        <p className="text-center font-mono text-[11px] tracking-wider uppercase text-zinc-600 mb-4 font-semibold">
          Native Blueprints For Modern Infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-zinc-700 opacity-90">
          {[
            { name: "Next.js 16", tag: "App Router" },
            { name: "FastAPI", tag: "Async Python" },
            { name: "WebAssembly", tag: "Edge Runtime" },
            { name: "Tailscale", tag: "Zero Trust" },
            { name: "DuckDB", tag: "Analytical" },
            { name: "Redis 7.2", tag: "PubSub & Cache" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-900 transition-colors cursor-default"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span className="font-semibold text-zinc-800">{item.name}</span>
              <span className="text-[10px] font-mono text-zinc-500">
                ({item.tag})
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
