"use client";

import React, { useState } from "react";
import {
  Download,
  Copy,
  Check,
  X,
  Terminal,
  Sparkles,
  FileCode,
  GitBranch,
  Bot,
  Layers,
} from "lucide-react";
import { Idea } from "@/types/idea";

interface SpecExportModalProps {
  idea: Idea;
  isOpen: boolean;
  onClose: () => void;
}

export function SpecExportModal({ idea, isOpen, onClose }: SpecExportModalProps) {
  const [activeTab, setActiveTab] = useState<"cursor" | "claude" | "github">("cursor");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. Cursor / Windsurf Prompt
  const cursorPrompt = `# CURSOR & WINDSURF AGENT DIRECTIVE
You are an expert full-stack engineer tasked with implementing the following verified specification:

## Project: ${idea.title}
> ${idea.hook}

## Architectural Context
- Target Category: ${idea.category}
- Difficulty Level: ${idea.difficulty}
- Target Geography / Region: ${idea.target_region}
- Collaboration Policy: ${idea.collab_status}
- Suggested Tech Stack: ${idea.suggested_stack?.join(", ") || "Next.js, TypeScript, Tailwind CSS"}

## Problem Statement
${idea.problem_statement}

## MVP Deliverables Checklist
Implement these core user journeys sequentially with clean type definitions and responsive styling:
${idea.mvp_features.map((feat, idx) => `- [ ] Step ${idx + 1}: ${feat}`).join("\n")}

## Implementation Standards
1. Use TypeScript with strict null checks.
2. Implement resilient error boundaries and local-first optimistic UI updates.
3. Reject generic placeholder slop: populate realistic sample telemetry and edge cases.
4. Verify all routes and components build cleanly with zero type errors.`;

  // 2. Claude Code / CLI Agent Prompt
  const claudePrompt = `# CLAUDE CODE & AIDER BLUEPRINT
Task: Build and test "${idea.title}"

### SUMMARY
${idea.hook}

### PROBLEM
${idea.problem_statement}

### CONSTRAINTS
- Stack: ${idea.suggested_stack?.join(", ") || "Next.js, TypeScript"}
- Category: ${idea.category}
- Region: ${idea.target_region}

### REQUIRED MVP FEATURES
${idea.mvp_features.map((feat, idx) => `${idx + 1}. ${feat}`).join("\n")}

### EXECUTION PLAN
1. Scaffold project structure with TypeScript & Tailwind CSS.
2. Define domain schemas matching the MVP specifications.
3. Implement core features in logical progression with tests.
4. Perform production build check before completing.`;

  // 3. GitHub Issue / PROJECT_SPEC.md
  const githubSpec = `# [SPEC] ${idea.title}

> **Hook:** ${idea.hook}  
> **Category:** \`${idea.category}\` | **Difficulty:** \`${idea.difficulty}\` | **Region:** \`${idea.target_region}\`  
> **Suggested Stack:** ${idea.suggested_stack?.map((s) => `\`${s}\``).join(", ")}  
> **IdeaToX Lineage:** https://ideatox.space/ideas/${idea.slug}

---

## 1. Problem Statement
${idea.problem_statement}

## 2. MVP Feature Checklist
${idea.mvp_features.map((feat) => `- [ ] ${feat}`).join("\n")}

## 3. Proof-of-Work Guidelines
When you finish building this blueprint:
1. Submit your public GitHub repository link.
2. Provide a live deployment demo URL.
3. Link your build on IdeaToX to earn the **Shipper** badge (+50 reputation pts).

---
*Generated via [IdeaToX](https://ideatox.space) — The GitHub + Dribbble for Project Ideas.*`;

  const getActiveContent = () => {
    switch (activeTab) {
      case "cursor":
        return cursorPrompt;
      case "claude":
        return claudePrompt;
      case "github":
        return githubSpec;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = getActiveContent();
    const filename = `${idea.slug}-${activeTab}-spec.md`;
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header HUD */}
        <div className="px-6 py-5 bg-[#0D0E12] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-white tracking-tight">
                Export for AI Coding Agents & GitHub
              </h3>
              <p className="text-xs text-zinc-400 font-mono truncate max-w-[320px]">
                {idea.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 bg-zinc-50 border-b border-zinc-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("cursor")}
            className={`pb-3 px-3 text-xs font-mono font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "cursor"
                ? "border-amber-500 text-amber-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Sparkles size={13} />
            <span>Cursor / Windsurf Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("claude")}
            className={`pb-3 px-3 text-xs font-mono font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "claude"
                ? "border-indigo-500 text-indigo-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Terminal size={13} />
            <span>Claude Code / CLI Agent</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("github")}
            className={`pb-3 px-3 text-xs font-mono font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
              activeTab === "github"
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <GitBranch size={13} />
            <span>GitHub Issue / SPEC.md</span>
          </button>
        </div>

        {/* Formatted Code Box */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <div className="relative rounded-2xl bg-[#0D0E12] text-zinc-200 p-4 font-mono text-xs leading-relaxed overflow-x-auto border border-zinc-800">
            <pre className="whitespace-pre-wrap">{getActiveContent()}</pre>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-500 font-mono">
            Formatted for direct injection into agent context
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white text-zinc-700 text-xs font-semibold hover:bg-zinc-100 border border-zinc-200 transition-colors shadow-sm"
            >
              <Download size={13} />
              <span>Download .md</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#111113] hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? "Copied Prompt!" : "Copy to Clipboard"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
