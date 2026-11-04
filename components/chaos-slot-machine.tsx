"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  Sparkles,
  Lock,
  Unlock,
  Layers,
  Globe,
  Cpu,
  Terminal,
  Smartphone,
  Puzzle,
  Check,
  Copy,
  GitFork,
  ArrowRight,
  Share2,
} from "lucide-react";

const CHANNELS = [
  { id: "all", label: "All Synthesizers", count: 50, icon: Sparkles },
  { id: "web", label: "Web Applications", count: 14, icon: Globe },
  { id: "ai", label: "AI & Agents", count: 12, icon: Layers },
  { id: "cli", label: "CLI & Systems", count: 9, icon: Terminal },
  { id: "mobile", label: "Mobile PWAs", count: 7, icon: Smartphone },
  { id: "hardware", label: "Hardware & IoT", count: 4, icon: Cpu },
  { id: "extension", label: "Browser Extensions", count: 4, icon: Puzzle },
];

const AUDIENCES = [
  "WhatsApp Commerce Vendors",
  "Open-Source Maintainers",
  "Rural Solar Micro-Grids",
  "University Commuters",
  "Independent UI Studios",
  "Regional Pharmacy Networks",
  "Indie Podcast Creators",
  "Distributed Engineering Squads",
];

const PROBLEMS = [
  "losing revenue to unverified escrow disputes",
  "drowning in unstructured GitHub issue triage",
  "tracking real-time staple inflation across markets",
  "debugging flaky payment webhooks locally",
  "preventing scope creep on fixed-price contracts",
  "syncing offline patient queues during power cuts",
  "auditing predatory IP clauses in client PDFs",
  "sharing excess inverter battery capacity safely",
];

const CONSTRAINTS = [
  "using an offline-first IndexedDB PWA",
  "via a zero-config Rust or Go CLI tool",
  "with an on-device Vision OCR browser extension",
  "powered by an ESP32 + GSM hardware node",
  "using a WhatsApp Cloud API webhook bot",
  "with cryptographic timestamp verification",
  "running 100% client-side via WebAssembly",
  "with a multiplayer real-time canvas",
];

export interface ChaosSlotMachineProps {
  activeChannel?: string;
  onChannelSelect?: (category: string) => void;
  onSelectBlueprint?: (prompt: string) => void;
  onTurnIntoIdea?: (prompt: string) => void;
  className?: string;
}

export function ChaosSlotMachine({
  activeChannel = "all",
  onChannelSelect,
  onSelectBlueprint,
  onTurnIntoIdea,
  className = "",
}: ChaosSlotMachineProps) {
  const router = useRouter();
  const [indices, setIndices] = useState<[number, number, number]>([0, 0, 0]);
  const [locked, setLocked] = useState<[boolean, boolean, boolean]>([
    false,
    false,
    false,
  ]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [copied, setCopied] = useState(false);

  const spin = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);

    let ticks = 0;
    const interval = setInterval(() => {
      ticks += 1;
      setIndices((prev) => [
        locked[0] ? prev[0] : Math.floor(Math.random() * AUDIENCES.length),
        locked[1] ? prev[1] : Math.floor(Math.random() * PROBLEMS.length),
        locked[2] ? prev[2] : Math.floor(Math.random() * CONSTRAINTS.length),
      ]);

      if (ticks >= 9) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 55);
  }, [isSpinning, locked]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spin]);

  const toggleLock = (colIndex: 0 | 1 | 2) => {
    setLocked((prev) => {
      const next: [boolean, boolean, boolean] = [...prev];
      next[colIndex] = !next[colIndex];
      return next;
    });
  };

  const fullSentence = `Build a tool for ${AUDIENCES[indices[0]]} ${PROBLEMS[indices[1]]} ${CONSTRAINTS[indices[2]]}.`;

  const copyPrompt = () => {
    navigator.clipboard.writeText(fullSentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `🎲 Just generated a viral software project idea on @IdeaToX:\n\n"${fullSentence}"\n\nFork and spec your own ideas:`
    );
    const url = encodeURIComponent(
      typeof window !== "undefined" ? window.location.origin : "https://ideatox.dev"
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleTurnIntoIdea = () => {
    if (onTurnIntoIdea) {
      onTurnIntoIdea(fullSentence);
    } else {
      router.push(`/ideas/new?prompt=${encodeURIComponent(fullSentence)}`);
    }
  };

  return (
    <div className={`relative mx-auto max-w-[1060px] ${className}`} suppressHydrationWarning>
      {/* Ambient Backlight Behind Studio Window */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.12),transparent_70%)] blur-xl"
      />

      {/* APPLE DOUBLE-BEZEL ICY-TEAL STUDIO FRAME */}
      <div className="relative rounded-2xl p-1.5 sm:p-2 bg-gradient-to-b from-teal-300/[0.14] via-white/[0.06] to-white/[0.03] border border-teal-300/20 shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl">
        <div className="rounded-xl bg-[#0A0A0E] border border-white/[0.08] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Sidebar: Clean Unobstructed Channels & Stacks */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-white/[0.07] p-3 sm:p-3.5 bg-[#0B0B10]">
              <div className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                CHANNELS & STACKS
              </div>
              <nav className="space-y-0.5">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isActive = activeChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => onChannelSelect?.(ch.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                        isActive
                          ? "bg-white/[0.08] text-white font-medium border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive ? "text-amber-400" : "text-zinc-500"
                          }`}
                        />
                        <span className="truncate">{ch.label}</span>
                      </span>
                      <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                        {ch.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Console: Chaos Blueprint Synthesizer */}
            <div className="lg:col-span-9 p-4 sm:p-5 flex flex-col justify-between bg-[#08080C]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <h2 className="text-base sm:text-lg font-medium text-zinc-100 tracking-tight">
                    Chaos Idea Slot Machine
                  </h2>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-teal-400/90 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
                  ⌘ + ↵ TO SPIN
                </span>
              </div>

              {/* 3 Mechanical Reels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 my-3">
                <ReelCard
                  step="01 // TARGET AUDIENCE"
                  value={AUDIENCES[indices[0]]}
                  isLocked={locked[0]}
                  onToggleLock={() => toggleLock(0)}
                />
                <ReelCard
                  step="02 // CORE FRICTION"
                  value={PROBLEMS[indices[1]]}
                  isLocked={locked[1]}
                  onToggleLock={() => toggleLock(1)}
                />
                <ReelCard
                  step="03 // ARCHITECTURE"
                  value={CONSTRAINTS[indices[2]]}
                  isLocked={locked[2]}
                  onToggleLock={() => toggleLock(2)}
                />
              </div>

              {/* Synthesized Build Specification Box */}
              <div className="rounded-xl bg-[#0D0D12] border border-white/[0.07] p-3 sm:p-3.5 space-y-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SYNTHESIZED BUILD SPECIFICATION</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    READY TO SPEC
                  </span>
                </div>

                <p className="text-[13px] sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {fullSentence}
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={copyPrompt}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all cursor-pointer"
                      title="Copy Prompt"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleShareX}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all cursor-pointer"
                      title="Share to X"
                    >
                      <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Share on 𝕏</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={spin}
                      disabled={isSpinning}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-white/[0.08] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                    >
                      <Shuffle
                        className={`w-3.5 h-3.5 ${
                          isSpinning ? "animate-spin text-teal-400" : ""
                        }`}
                      />
                      <span>Spin Reels 🎲</span>
                    </button>

                    {/* Milestone 5 Task 5.1 CTA: Turn this into a Full Idea */}
                    <button
                      type="button"
                      onClick={handleTurnIntoIdea}
                      id="turn-into-full-idea-btn"
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-teal-400 to-emerald-400 text-zinc-950 hover:brightness-110 shadow-[0_0_24px_rgba(45,212,191,0.4)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                      <span>Turn this into a Full Idea</span>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-950" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelCard({
  step,
  value,
  isLocked,
  onToggleLock,
}: {
  step: string;
  value: string;
  isLocked: boolean;
  onToggleLock: () => void;
}) {
  return (
    <div
      className={`rounded-xl p-3 sm:p-3.5 border transition-all flex flex-col justify-between min-h-[92px] ${isLocked
          ? "bg-teal-950/20 border-teal-500/40 shadow-[inset_0_1px_0_0_rgba(45,212,191,0.18)]"
          : "bg-[#0D0D12] border-white/[0.07] hover:border-white/[0.14]"
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-zinc-400">
          {step}
        </span>
        <button
          type="button"
          onClick={onToggleLock}
          aria-label={isLocked ? "Unlock reel" : "Lock reel"}
          className={`p-1 rounded transition-colors ${isLocked
              ? "text-teal-300 bg-teal-500/20"
              : "text-zinc-500 hover:text-zinc-300"
            }`}
        >
          {isLocked ? (
            <Lock className="w-3 h-3 stroke-[2]" />
          ) : (
            <Unlock className="w-3 h-3 stroke-[2]" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
          suppressHydrationWarning
          className="mt-2 text-[13px] font-medium text-zinc-100 leading-snug"
        >
          {value}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}