"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getAllIdeas, reviewFeatureRequest } from "@/lib/ideas";
import { Idea } from "@/types/idea";
import { FloatingNavbar } from "@/components/floating-navbar";
import { HeroStage } from "@/components/hero-stage";
import { ManifestoSection } from "@/components/manifesto-section";
import { StudioShowcase } from "@/components/studio-showcase";
import { PersonaBento } from "@/components/persona-bento";
import { AiSpecSandbox } from "@/components/ai-spec-sandbox";
import { SpecGallerySection } from "@/components/spec-gallery-section";
import { FaqAccordion } from "@/components/faq-accordion";
import { ObsidianMegaFooter } from "@/components/obsidian-mega-footer";
import { Search, X, ArrowRight, Sparkles, Terminal } from "lucide-react";

export default function MarketingLandingPage() {
  // Command palette state
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const paletteInputRef = useRef<HTMLInputElement>(null);

  // Live Community Ideas and Activity Feed
  const [liveIdeas, setLiveIdeas] = useState<Idea[]>([]);
  const [approvedPrIds, setApprovedPrIds] = useState<Record<string, boolean>>({});
  const [activityToast, setActivityToast] = useState<string | null>(null);

  useEffect(() => {
    getAllIdeas().then((ideas) => {
      if (ideas && ideas.length > 0) {
        setLiveIdeas(ideas);
      }
    });
  }, []);

  // Handle PR merging
  const handleToggleMergePR = async (
    prId: string,
    ideaSlug: string,
    featureText: string
  ) => {
    const isNowApproved = !approvedPrIds[prId];
    setApprovedPrIds((prev) => ({
      ...prev,
      [prId]: isNowApproved,
    }));
    try {
      await reviewFeatureRequest(
        ideaSlug,
        prId,
        isNowApproved ? "approved" : "rejected"
      );
      setActivityToast(
        isNowApproved
          ? `Merged into specification: "${featureText}"`
          : `Reverted PR approval for "${featureText}"`
      );
      setTimeout(() => setActivityToast(null), 3500);
    } catch {
      // ignore
    }
  };

  // Global ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => paletteInputRef.current?.focus(), 50);
    }
  }, [paletteOpen]);

  // Filtered command palette items
  const commandResults = [
    {
      title: "Autonomous Multi-Agent Router",
      desc: "spec v1.4 • FastAPI + Redis 7.2 semantic cache",
      cat: "Autonomous AI",
      href: "/ideas/agent-router",
    },
    {
      title: "Distributed SQLite over Tailscale",
      desc: "spec v0.8 • WireGuard zero-trust replica mesh",
      cat: "Local-First",
      href: "/ideas/sqlite-tailscale",
    },
    {
      title: "Raycast Workspace Syncer",
      desc: "spec v3.1 • Linear & GitHub bi-directional sync",
      cat: "DevTools",
      href: "/ideas/raycast-linear",
    },
    {
      title: "3-Reel Idea Synthesizer",
      desc: "Interactive chaos constraints and telemetry simulator",
      cat: "Studio Tool",
      href: "#studio",
    },
    {
      title: "AI Spec Sandbox",
      desc: "Compile 1-line concept into an instant architecture audit",
      cat: "Sandbox",
      href: "#sandbox",
    },
  ].filter((item) =>
    paletteQuery.trim() === ""
      ? true
      : item.title.toLowerCase().includes(paletteQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(paletteQuery.toLowerCase()) ||
        item.cat.toLowerCase().includes(paletteQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111113] selection:bg-amber-100 selection:text-amber-900 relative">
      {/* =========================================================================
          PATTERN 1: FLOATING DYNAMIC ISLAND NAVBAR
         ========================================================================= */}
      <FloatingNavbar onOpenSearch={() => setPaletteOpen(true)} />

      {/* =========================================================================
          MAIN DISCOVERY LANDING STAGE
         ========================================================================= */}
      <main className="w-full relative">
        {/* PATTERN 2: HERO STAGE (Full Viewport + Parallax on Scroll) */}
        <HeroStage />

        {/* PATTERN 3: NARRATIVE REVEAL MANIFESTO */}
        <ManifestoSection />

        {/* PATTERN 4: SPLIT LIGHT/DARK STUDIO SHOWCASE */}
        <StudioShowcase />

        {/* PATTERN 5: DUAL PERSONA BENTO GRID */}
        <PersonaBento />

        {/* PATTERN 6: INTERACTIVE AI SPEC SANDBOX */}
        <AiSpecSandbox />

        {/* CURATED BLUEPRINTS & COMMUNITY PR REVIEWER */}
        <SpecGallerySection
          liveIdeas={liveIdeas}
          approvedPrIds={approvedPrIds}
          onToggleMergePR={handleToggleMergePR}
        />

        {/* PATTERN 7: MINIMAL HAIRLINE FAQ ACCORDION */}
        <FaqAccordion />

        {/* PATTERN 8: SUPERPOWERS PRE-FOOTER CTA & OBSIDIAN MEGA-FOOTER */}
        <ObsidianMegaFooter />
      </main>

      {/* =========================================================================
          COMMAND PALETTE (⌘K SEARCH MODAL)
         ========================================================================= */}
      {paletteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white border border-zinc-200/90 shadow-2xl overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
              <Search size={18} className="text-zinc-400 shrink-0" />
              <input
                ref={paletteInputRef}
                type="text"
                placeholder="Search architectures, tags, and runtimes..."
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-[#111113] placeholder-zinc-400 focus:outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setPaletteOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results list */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {commandResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 font-mono">
                  No matching specifications found.
                </div>
              ) : (
                commandResults.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setPaletteOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-xs text-[#111113] group-hover:text-amber-800">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-600">
                          {item.cat}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <ArrowRight
                      size={13}
                      className="text-zinc-400 group-hover:text-black transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ))
              )}
            </div>

            {/* Modal footer shortcut prompt */}
            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Navigation: Tab / Click</span>
              <span>Close: Esc</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ACTIVITY NOTIFICATION TOAST
         ========================================================================= */}
      {activityToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#0D0E12] text-white text-xs font-mono border border-white/10 shadow-2xl animate-slideUp">
          <Sparkles size={14} className="text-amber-400 shrink-0" />
          <span>{activityToast}</span>
        </div>
      )}
    </div>
  );
}