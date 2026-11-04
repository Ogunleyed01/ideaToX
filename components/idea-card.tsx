"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, GitFork, Terminal, ArrowUpRight } from "lucide-react";
import { Idea, IdeaDifficulty } from "@/types/idea";
import { hasUserUpvoted, toggleUpvote } from "@/lib/ideas";

const DIFFICULTY_META: Record<
  IdeaDifficulty,
  { label: string; badgeClass: string; bars: number; barColor: string }
> = {
  beginner: {
    label: "Weekend Build",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bars: 4,
    barColor: "bg-emerald-500",
  },
  intermediate: {
    label: "Side Project",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    bars: 8,
    barColor: "bg-amber-500",
  },
  advanced: {
    label: "Full SaaS",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    bars: 11,
    barColor: "bg-indigo-500",
  },
};

export interface IdeaCardProps {
  idea: Idea;
  index?: number;
  viewMode?: "grid" | "list";
  onForkClick?: (idea: Idea) => void;
}

export function IdeaCard({
  idea,
  index = 0,
  viewMode = "grid",
  onForkClick,
}: IdeaCardProps) {
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(
    idea.upvotes_count ?? ((index * 17 + 23) % 90) + 14
  );

  useEffect(() => {
    setStarred(hasUserUpvoted(idea.slug));
  }, [idea.slug]);

  const meta = DIFFICULTY_META[idea.difficulty] ?? DIFFICULTY_META.intermediate;

  const handleStar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const prevStarred = starred;
    const prevCount = starCount;
    setStarred(!prevStarred);
    setStarCount(prevStarred ? prevCount - 1 : prevCount + 1);

    try {
      const res = await toggleUpvote(idea.slug);
      setStarred(res.starred);
      setStarCount(res.upvotes_count);
    } catch {
      setStarred(prevStarred);
      setStarCount(prevCount);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.025, 0.25),
        ease: [0.22, 1, 0.36, 1],
      }}
      suppressHydrationWarning
      className={`group relative bento-white p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_28px_70px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
        viewMode === "list" ? "md:col-span-2 xl:col-span-4" : ""
      }`}
    >
      <div className="relative z-10">
        {/* ROW 1: Coordinate Index + Region + Difficulty Pill */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500 tabular-nums">
            <span className="text-zinc-400 font-bold">
              #{String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-zinc-800 font-semibold">{idea.category}</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-600">{idea.target_region}</span>
          </div>

          <span
            className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-semibold ${meta.badgeClass}`}
          >
            {meta.label}
          </span>
        </div>

        {/* ROW 2: Editorial Title & Hook */}
        <Link href={`/ideas/${idea.slug}`} className="block mt-3.5 group/link">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[17px] font-sans font-semibold tracking-[-0.02em] text-[#111113] group-hover/link:text-amber-800 transition-colors leading-snug">
              {idea.title}
            </h3>
            <span className="w-7 h-7 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center shrink-0 group-hover:bg-[#111113] group-hover:text-white transition-all duration-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <p className="mt-2 text-[13px] text-[#52525B] leading-relaxed line-clamp-2">
            {idea.hook}
          </p>
        </Link>

        {/* ROW 3: Stack Pills & Scope Meter */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {idea.suggested_stack?.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="font-mono text-[10px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Scope Meter */}
          <div
            title={`Complexity Index: ${meta.bars}/12`}
            className="flex items-center gap-1.5 shrink-0"
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
              SCOPE
            </span>
            <div className="flex items-center gap-[2px]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-[2px] h-2.5 rounded-full transition-colors ${
                    i < meta.bars ? meta.barColor : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4: Git Telemetry Footer */}
      <div
        className="relative z-10 pt-3 mt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500 tabular-nums"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStar}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-100 transition-all ${
              starred ? "text-amber-600 font-bold" : "text-zinc-500 hover:text-black"
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                starred ? "fill-amber-500 text-amber-500" : ""
              }`}
            />
            <span>{starCount}</span>
          </button>

          {onForkClick ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onForkClick(idea);
              }}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-zinc-500 hover:text-black hover:bg-zinc-100 transition-all"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>{idea.forks_count ?? ((index * 3 + 2) % 14) + 1}</span>
            </button>
          ) : (
            <Link
              href={`/ideas/new?fork=${idea.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-zinc-500 hover:text-black hover:bg-zinc-100 transition-all"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>{idea.forks_count ?? ((index * 3 + 2) % 14) + 1}</span>
            </Link>
          )}

          <div className="inline-flex items-center gap-1 text-zinc-400">
            <Terminal className="w-3.5 h-3.5" />
            <span>{idea.builds_count ?? (index % 4) + 1}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {idea.author && (
            <Link
              href={`/profile/${idea.author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-zinc-400 hover:text-amber-800 hover:underline font-mono transition-colors"
            >
              @{idea.author.username}
            </Link>
          )}

          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                idea.collab_status === "seeking_cofounder"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            <span className="text-zinc-500">
              {idea.collab_status === "seeking_cofounder"
                ? "Co-Founder"
                : "Open Spec"}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}