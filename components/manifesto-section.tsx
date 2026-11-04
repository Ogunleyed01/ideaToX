"use client";

import React from "react";
import { Sparkles, Terminal, CheckCircle2, GitPullRequest } from "lucide-react";

export function ManifestoSection() {
  return (
    <section id="manifesto" className="relative w-full py-28 px-6 bg-dot-matrix border-y border-zinc-200/80">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Anti-Slop Section Heading: Sans + Italic Serif + Inline Squircle Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs text-zinc-600 font-mono uppercase tracking-wider mb-6">
          <Terminal size={12} className="text-zinc-900" />
          <span>The IdeaToX Manifesto</span>
        </div>

        <h2 className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-3xl sm:text-5xl md:text-6xl leading-[1.12]">
          Why we refuse to build{" "}
          <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#111113] text-white mx-1 align-middle shadow-md">
            <Sparkles size={18} className="text-amber-300" />
          </span>{" "}
          from{" "}
          <span className="font-serif italic font-normal text-zinc-800">
            unvalidated
          </span>{" "}
          intuition.
        </h2>

        {/* Large Mixed-Weight Editorial Paragraph with Progressive Text Hierarchy */}
        <div className="mt-12 text-left sm:text-center text-lg sm:text-2xl sm:leading-[1.7] max-w-3xl font-normal">
          <p className="text-[#C4C4C8] transition-colors">
            Most software endeavors do not collapse from poor syntax. They collapse
            under the weight of phantom assumptions, fragile schemas, and unmodeled
            latencies.
          </p>

          <p className="mt-6 text-[#52525B]">
            IdeaToX replaces the empty scratchpad with deterministic technical
            blueprints. Here, an idea is not a pitch deck—it is a forkable state machine
            reviewed by{" "}
            {/* Inline Overlapping Circles */}
            <span className="inline-flex items-center -space-x-2 align-middle mx-1">
              <span className="w-7 h-7 rounded-full bg-indigo-500 text-white font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                AK
              </span>
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                SC
              </span>
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                ER
              </span>
            </span>{" "}
            distributed system architects.
          </p>

          <p className="mt-6 text-[#111113] font-medium">
            Every specification tracks its origin lineage, publishes verifiable SLAs,
            and marks its readiness from{" "}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/60 font-mono text-xs font-semibold align-middle mx-1">
              Seeking Dev
            </span>{" "}
            all the way to{" "}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300/60 font-mono text-xs font-semibold align-middle mx-1">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Shipped
            </span>
            . Code is merely the final artifact of crystal-clear reasoning.
          </p>
        </div>

        {/* Manifesto 3-Pillar Anchors */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bento-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              PILLAR 01
            </span>
            <h3 className="mt-3 font-sans font-semibold text-[#111113] text-lg">
              Architecture Before Syntax
            </h3>
            <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
              Stress-test P99 latencies, edge runtimes, and single-point failures before commissioning engineering hours.
            </p>
          </div>

          <div className="bento-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              PILLAR 02
            </span>
            <h3 className="mt-3 font-sans font-semibold text-[#111113] text-lg">
              Lineage Over Isolated Forks
            </h3>
            <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
              Every fork contributes back to an evolving visual tree. Explore derivative variants without losing upstream context.
            </p>
          </div>

          <div className="bento-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              PILLAR 03
            </span>
            <h3 className="mt-3 font-sans font-semibold text-[#111113] text-lg">
              Peer-Reviewed Specifications
            </h3>
            <p className="mt-2 text-sm text-[#52525B] leading-relaxed">
              Merge community pull requests into specs just like code repos, with instant schema validation and live preview links.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
