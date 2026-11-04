"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GitFork, ArrowRight, X, AlertCircle } from "lucide-react";
import { Idea } from "@/types/idea";
import { createQuickFork } from "@/lib/ideas";

interface ForkModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
  onForkCreated?: (newIdea: Idea) => void;
}

export function ForkModal({ idea, isOpen, onClose, onForkCreated }: ForkModalProps) {
  const router = useRouter();
  const [remixedTitle, setRemixedTitle] = useState(`Remix: ${idea.title}`);
  const [pivotNotes, setPivotNotes] = useState("");
  const [targetRegion, setTargetRegion] = useState(idea.target_region || "Global");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickFork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remixedTitle.trim()) {
      setError("Please provide a title for your remixed specification.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const forked = await createQuickFork(idea.slug, {
        remixedTitle: remixedTitle.trim(),
        pivotNotes: pivotNotes.trim(),
        targetRegion,
      });

      if (forked) {
        if (onForkCreated) onForkCreated(forked);
        onClose();
        router.push(`/ideas/${forked.slug}`);
      } else {
        setError("Failed to branch blueprint. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while branching.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFullStudioCustomization = () => {
    onClose();
    router.push(`/ideas/new?fork=${idea.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xl rounded-[28px] bg-white border border-zinc-200/90 p-6 sm:p-8 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.25)] z-10 space-y-6">
        {/* Header HUD */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-semibold text-base text-[#111113]">
                  Branch Specification
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                  Fork Tree
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-500 mt-0.5">
                Creating branch from @{idea.slug}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Parent Blueprint Snapshot */}
        <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-semibold">
            <span>UPSTREAM ANCESTOR</span>
            <span>{idea.category.toUpperCase()} // {idea.difficulty}</span>
          </div>
          <div className="text-sm font-semibold text-[#111113] line-clamp-1">{idea.title}</div>
          <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed">{idea.hook}</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Fork Form */}
        <form onSubmit={handleQuickFork} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
              Fork Blueprint Title
            </label>
            <input
              type="text"
              required
              value={remixedTitle}
              onChange={(e) => setRemixedTitle(e.target.value)}
              placeholder="e.g. Remix: Decentralized P2P Ledger"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono text-zinc-600 uppercase tracking-wider font-semibold">
                Architectural Pivot (Optional)
              </label>
              <span className="font-mono text-[10px] text-zinc-400">How will your remix differ?</span>
            </div>
            <textarea
              rows={2}
              value={pivotNotes}
              onChange={(e) => setPivotNotes(e.target.value)}
              placeholder="e.g. Pivoting to local-first offline SQLite for users with intermittent 3G connectivity."
              className="w-full px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 resize-none font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-600 uppercase tracking-wider mb-1.5 font-semibold">
              Target Geographic Market
            </label>
            <select
              value={targetRegion}
              onChange={(e) => setTargetRegion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-[#111113] focus:bg-white focus:outline-none focus:border-amber-400 font-sans"
            >
              <option value="Global">Global / Universal</option>
              <option value="Africa">Africa (Nigeria, Kenya, South Africa)</option>
              <option value="LATAM">Latin America (Brazil, Colombia, Mexico)</option>
              <option value="Southeast Asia">Southeast Asia (Indonesia, Vietnam, India)</option>
              <option value="Europe">Europe / GDPR-compliant</option>
              <option value="North America">North America</option>
            </select>
          </div>

          {/* Action cluster */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleFullStudioCustomization}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-amber-700 transition-colors py-2 px-1"
            >
              <span>Open in Full Spec Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs font-mono text-zinc-600 hover:text-black bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono font-semibold text-white bg-[#111113] hover:bg-zinc-800 shadow-md transition-all disabled:opacity-50"
              >
                <GitFork className="w-3.5 h-3.5 text-amber-300" />
                <span>{isSubmitting ? "Branching..." : "Quick Fork"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
