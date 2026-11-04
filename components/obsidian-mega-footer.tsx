"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Terminal, Globe, MessageSquare } from "lucide-react";

export function ObsidianMegaFooter() {
  return (
    <footer className="w-full rounded-t-[36px] bg-[#0F1015] text-white pt-20 pb-10 px-6 sm:px-12 relative overflow-hidden border-t border-white/[0.08]">
      {/* Ambient Console Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-amber-500/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[420px] h-[320px] bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* =========================================================================
            SUPERPOWERS PRE-FOOTER CTA
           ========================================================================= */}
        <div className="p-8 sm:p-14 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono mb-4 border border-white/10">
              <Sparkles size={12} />
              <span>Zero Boilerplate • Deterministic Specs</span>
            </div>
            <h3 className="font-sans font-semibold tracking-[-0.035em] text-white text-3xl sm:text-4xl md:text-5xl leading-tight">
              Ready to architect before you{" "}
              <span className="font-serif italic font-normal text-amber-400">
                write code
              </span>
              ?
            </h3>
            <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
              Join thousands of engineers formalizing verified primitives, latency guarantees, and collaborative lineage branches.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0">
            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-white text-[#111113] text-sm font-semibold hover:bg-amber-300 transition-colors shadow-lg group"
            >
              <span>Compile Your Spec</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <a
              href="#specs"
              className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors border border-white/10"
            >
              <span>Explore Gallery</span>
            </a>
          </div>
        </div>

        {/* =========================================================================
            DIRECTORY LINKS
           ========================================================================= */}
        <div className="mt-16 pt-12 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <span className="font-mono text-xs font-bold text-amber-300">&gt;</span>
              </div>
              <span className="font-sans font-bold text-lg text-white tracking-tight">
                IdeaTo<span className="text-amber-400">X</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              The collaborative specification engine and lineage tracker for modern infrastructure, autonomous agents, and local-first software.
            </p>
            <div className="mt-5 flex items-center gap-3 text-zinc-400">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Twitter / X">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title="Discord">
                <MessageSquare size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
              Specifications
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#specs" className="hover:text-white transition-colors">Agent Router v1.4</a></li>
              <li><a href="#specs" className="hover:text-white transition-colors">Distributed SQLite Mesh</a></li>
              <li><a href="#specs" className="hover:text-white transition-colors">Raycast Workspace Syncer</a></li>
              <li><a href="#specs" className="hover:text-white transition-colors">WASM Edge Ingestion</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
              Platform Tools
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#studio" className="hover:text-white transition-colors">3-Reel Synthesizer</a></li>
              <li><a href="#studio" className="hover:text-white transition-colors">LED Equalizer Telemetry</a></li>
              <li><a href="#sandbox" className="hover:text-white transition-colors">AI Architecture Sandbox</a></li>
              <li><a href="/ideas/new" className="hover:text-white transition-colors">Spec Manifest Builder</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
              Community
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#prs" className="hover:text-white transition-colors">Active Feature PRs</a></li>
              <li><a href="#specs" className="hover:text-white transition-colors">Lineage Graph Trees</a></li>
              <li><a href="/ideas/new" className="hover:text-white transition-colors">Publish a Blueprint</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Architecture Manifesto</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2026 IdeaToX Inc. Deterministic Software Specifications. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-zinc-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-200 transition-colors">Terms of Spec</a>
            <a href="#" className="hover:text-zinc-200 transition-colors">Security Whitepaper</a>
          </div>
        </div>

        {/* =========================================================================
            GIANT EDGE-TO-EDGE FONT-SERIF IDEATOX WORDMARK
           ========================================================================= */}
        <div className="mt-12 pt-6 select-none pointer-events-none overflow-hidden text-center">
          <h1 className="font-serif italic font-normal text-[18vw] leading-none text-white/[0.08] tracking-tight whitespace-nowrap">
            IdeaToX
          </h1>
        </div>
      </div>
    </footer>
  );
}
