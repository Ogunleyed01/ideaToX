"use client";

import React from "react";
import Link from "next/link";
import { GitFork, GitBranch, GitCommit, ArrowUpRight, Star, Plus, ShieldCheck } from "lucide-react";
import { IdeaLineage } from "@/lib/ideas";

interface LineageTreeProps {
  lineage: IdeaLineage;
  onForkClick?: () => void;
}

export function LineageTree({ lineage, onForkClick }: LineageTreeProps) {
  const { parent, current, children } = lineage;

  return (
    <div className="bento-white p-6 sm:p-8">
      {/* Header HUD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-amber-700 font-semibold flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full">
              <GitBranch className="w-3.5 h-3.5" />
              Provenance &amp; Lineage Graph
            </span>
          </div>
          <p className="text-xs text-[#52525B] mt-2">
            Visual provenance tree tracing ancestral origins and downstream architectural branches.
          </p>
        </div>

        {onForkClick && (
          <button
            type="button"
            onClick={onForkClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Fork New Branch</span>
          </button>
        )}
      </div>

      {/* Tree Container */}
      <div className="relative pl-4 sm:pl-8 space-y-6 mt-6">
        {/* Vertical Branch Stem Line */}
        <div className="absolute left-[19px] sm:left-[35px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-400 via-amber-400 to-zinc-300" />

        {/* 1. UPSTREAM ANCESTOR NODE (if exists) */}
        {parent ? (
          <div className="relative flex items-start gap-4">
            {/* Node Marker */}
            <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
              <GitCommit className="w-4 h-4" />
            </div>

            {/* Node Card */}
            <div className="flex-1 p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between text-[11px] font-mono text-indigo-700 mb-1">
                <span className="flex items-center gap-1 uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  UPSTREAM ANCESTOR // {parent.version}
                </span>
                <Link
                  href={`/ideas/${parent.slug}`}
                  className="inline-flex items-center gap-1 text-indigo-700 hover:text-black font-semibold"
                >
                  <span>View Origin</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>

              <h4 className="text-sm font-semibold text-[#111113] line-clamp-1">{parent.title}</h4>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-indigo-100 text-xs font-mono text-zinc-500">
                <Link
                  href={`/profile/${parent.author.username}`}
                  className="hover:underline hover:text-black font-semibold text-zinc-700"
                >
                  Author: @{parent.author.username}
                </Link>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {parent.stars}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3 text-zinc-600" />
                    {parent.forks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex items-center gap-4 text-xs font-mono text-zinc-500">
            <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600 shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1 py-2 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[10px]">
                ROOT SPECIFICATION
              </span>
              <span className="text-zinc-600 ml-2">
                This blueprint is an original root creation with no upstream dependencies.
              </span>
            </div>
          </div>
        )}

        {/* 2. CURRENT ACTIVE NODE (HEAD) */}
        <div className="relative flex items-start gap-4">
          {/* Active Marker */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-amber-400 border-2 border-[#111113] flex items-center justify-center text-[#111113] shadow-md shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>

          {/* Current Node Card */}
          <div className="flex-1 p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-400/80 shadow-sm">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-900 mb-1.5">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                ACTIVE BLUEPRINT // HEAD
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-bold text-[10px]">
                CURRENT INSPECTION
              </span>
            </div>

            <h3 className="text-base font-bold text-[#111113]">{current.title}</h3>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-amber-200/60 text-xs font-mono text-zinc-700">
              <div className="flex items-center gap-2">
                <span>Lead Architect:</span>
                <Link
                  href={`/profile/${current.author.username}`}
                  className="text-[#111113] font-semibold hover:underline hover:text-amber-800"
                >
                  @{current.author.username}
                </Link>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {current.stars} upvotes
                </span>
                <span className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                  <GitFork className="w-3 h-3 text-zinc-600" />
                  {current.forks} forks
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DOWNSTREAM FORK BRANCHES */}
        {children.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider pl-12 font-semibold">
              <span>DOWNSTREAM DERIVATIVE FORKS ({children.length})</span>
            </div>

            {children.map((child, idx) => (
              <div key={child.slug} className="relative flex items-start gap-4">
                {/* Branch Node Marker */}
                <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-zinc-400 flex items-center justify-center text-zinc-700 shadow-sm shrink-0">
                  <GitFork className="w-4 h-4" />
                </div>

                {/* Branch Card */}
                <div className="flex-1 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-zinc-300 hover:bg-white transition-all">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 mb-1">
                    <span className="uppercase tracking-wider font-semibold">
                      FORK #{idx + 1} // {child.version}
                    </span>
                    <Link
                      href={`/ideas/${child.slug}`}
                      className="inline-flex items-center gap-1 text-amber-700 hover:text-black font-semibold text-xs"
                    >
                      <span>Explore Spec</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>

                  <h4 className="text-sm font-semibold text-[#111113] line-clamp-1">{child.title}</h4>

                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-zinc-200/80 text-xs font-mono text-zinc-500">
                    <Link
                      href={`/profile/${child.author.username}`}
                      className="hover:underline hover:text-black font-medium"
                    >
                      by @{child.author.username}
                    </Link>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {child.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-zinc-600" />
                        {child.forks}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
