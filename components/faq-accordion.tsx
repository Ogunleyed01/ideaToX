"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is an IdeaToX specification vs. a traditional design doc?",
    answer:
      "A traditional design doc is passive prose that quickly falls out of sync. An IdeaToX specification is an executable, schema-validated state machine. It contains verifiable P99 latency bounds, single-point-of-failure audits, peer-reviewed pull requests, and runnable Docker/WASM primitives.",
  },
  {
    question: "How does the Lineage Tree handle derivative forks?",
    answer:
      "Every time a developer forks a specification to test a new database driver, mobile runtime, or security constraint, the parent spec records the branch in its visual lineage tree. Forks can submit Feature Pull Requests upstream, letting the community merge improvements collaboratively.",
  },
  {
    question: "Can I simulate chaos engineering before building the codebase?",
    answer:
      "Yes. The built-in 3-Reel Synthesizer and telemetry engine stress-test hypothetical failure modes—such as offline partition splits, 300ms packet jitter, and cache eviction storms—identifying architectural bottlenecks before a developer commits code.",
  },
  {
    question: "How do I export a validated spec to GitHub or my local CLI?",
    answer:
      "Every spec exports a standard `ideatox.manifest.yaml` alongside ready-to-run Docker Compose setups, TypeScript interfaces, and database migration scripts. You can copy the YAML or use our CLI to initialize a fresh repository.",
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="relative w-full py-24 px-6 bg-dot-matrix">
      <div className="max-w-3xl mx-auto">
        {/* Anti-Slop Heading: Sans + Italic Serif + Inline Squircle */}
        <div className="flex flex-col items-center text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm text-xs text-zinc-600 font-mono uppercase tracking-wider mb-4">
            <HelpCircle size={12} className="text-[#111113]" />
            <span>Architecture FAQ</span>
          </div>
          <h2 className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-3xl sm:text-5xl leading-[1.14]">
            Frequently Asked{" "}
            <span className="font-serif italic font-normal text-zinc-800">
              Questions
            </span>
            .
          </h2>
          <p className="mt-3 text-[#52525B] text-base">
            Everything you need to know about deterministic specifications and collaborative architecture.
          </p>
        </div>

        {/* Minimal Hairline Accordion with + and × triggers */}
        <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-5 transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans font-semibold text-[#111113] text-base sm:text-lg tracking-tight group-hover:text-zinc-600 transition-colors">
                    {faq.question}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center font-mono text-base font-light text-zinc-600 shrink-0 group-hover:border-zinc-400 group-hover:text-[#111113] transition-all">
                    {isOpen ? "×" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-3.5 pr-8 text-sm sm:text-base text-[#52525B] leading-relaxed animate-fadeIn">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
