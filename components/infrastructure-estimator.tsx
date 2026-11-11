"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Cpu,
  Database,
  DollarSign,
  HardDrive,
  Package,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Idea, InfrastructureScaleTier } from "@/types/idea";
import { estimateIdeaInfrastructure } from "@/lib/architecture";

interface InfrastructureEstimatorProps {
  idea: Idea;
}

const SCALE_TIERS: { id: InfrastructureScaleTier; label: string; caption: string }[] = [
  { id: "hobby", label: "Hobby / MVP", caption: "Validation ($0–Free Tier)" },
  { id: "production", label: "Production", caption: "1k–10k active builders" },
  { id: "scale", label: "High Scale", caption: "50k+ MAU fleet" },
];

const LAYER_ICONS = {
  compute: Cpu,
  database: Database,
  storage: HardDrive,
  services: Sparkles,
};

export function InfrastructureEstimator({ idea }: InfrastructureEstimatorProps) {
  const [tier, setTier] = useState<InfrastructureScaleTier>("hobby");
  const [copiedCmd, setCopiedCmd] = useState(false);

  const estimate = useMemo(
    () => estimateIdeaInfrastructure(idea, tier),
    [idea, tier]
  );

  const handleCopyCommand = () => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(estimate.starterCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <section
      id="hosting-estimator"
      className="bento-white p-6 sm:p-7 space-y-6"
    >
      {/* Header + Tier Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-700 flex items-center gap-1.5 font-bold">
            <DollarSign className="w-3.5 h-3.5" />
            INFRASTRUCTURE &amp; MONTHLY HOSTING ESTIMATOR
          </span>
          <p className="text-xs text-[#52525B] mt-1">
            {estimate.architectureSummary}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Scale estimation tier"
          className="inline-flex p-1 rounded-xl bg-zinc-100 border border-zinc-200/80 self-start sm:self-auto"
        >
          {SCALE_TIERS.map((item) => {
            const active = tier === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTier(item.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-[#111113] text-white shadow-xs"
                    : "text-zinc-600 hover:text-black"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Obsidian Monthly Cost Readout Console */}
      <div className="rounded-2xl bg-[#0D0E12] text-white p-5 sm:p-6 border border-white/10 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            <span
              className={`w-2 h-2 rounded-full ${
                estimate.monthlyTotalUsd === 0 ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <span>ESTIMATED MONTHLY INFRASTRUCTURE SPEND</span>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight tabular-nums text-white">
              ${estimate.monthlyTotalUsd}
            </span>
            <span className="text-xs font-mono text-zinc-400">
              / month &middot; {SCALE_TIERS.find((t) => t.id === tier)?.caption}
            </span>
          </div>
        </div>

        <div className="sm:max-w-xs text-[11px] font-mono text-zinc-300 leading-relaxed bg-white/[0.04] border border-white/10 rounded-xl p-3">
          {estimate.costNote}
        </div>
      </div>

      {/* Component Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {estimate.items.map((item) => {
          const Icon = LAYER_ICONS[item.layer];
          return (
            <div
              key={item.layer}
              className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Icon className="w-4 h-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    {item.label}
                  </div>
                  <div className="text-xs sm:text-[13px] font-sans font-semibold text-[#111113] truncate">
                    {item.provider}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                    {item.allowance}
                  </p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold tabular-nums shrink-0 border ${
                  item.monthlyUsd === 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-[#111113] border-zinc-200"
                }`}
              >
                ${item.monthlyUsd}/mo
              </span>
            </div>
          );
        })}
      </div>

      {/* Starter Packages & 1-Line Bootstrap CLI */}
      <div className="pt-4 border-t border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            <Package className="w-3.5 h-3.5 text-amber-600" />
            <span>Recommended Packages</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {estimate.recommendedPackages.map((pkg) => (
              <span
                key={pkg}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-[11px] font-mono text-zinc-800"
              >
                {pkg}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:max-w-md w-full space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            <Terminal className="w-3.5 h-3.5 text-zinc-600" />
            <span>Quickstart Bootstrap CLI</span>
          </div>
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#0D0E12] text-zinc-200 border border-zinc-800 font-mono text-[11px]">
            <code className="truncate select-all">{estimate.starterCommand}</code>
            <button
              type="button"
              onClick={handleCopyCommand}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] shrink-0 transition-colors cursor-pointer"
            >
              {copiedCmd ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
