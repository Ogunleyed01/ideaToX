"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Code2,
  Copy,
  Database,
  Globe,
  Layers,
  Network,
  Server,
  Smartphone,
} from "lucide-react";
import { ArchNode, ArchNodeTier, Idea } from "@/types/idea";
import { generateIdeaArchitectureTopology } from "@/lib/architecture";

interface ArchitectureTopologyProps {
  idea: Idea;
}

const TIER_STYLES: Record<
  ArchNodeTier,
  { badge: string; dot: string; label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  client: {
    badge: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "SURFACE",
    icon: Smartphone,
  },
  compute: {
    badge: "bg-zinc-900 text-amber-300 border-zinc-800",
    dot: "bg-indigo-400",
    label: "COMPUTE",
    icon: Server,
  },
  data: {
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    label: "DATA STORE",
    icon: Database,
  },
  external: {
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
    label: "EXTERNAL",
    icon: Globe,
  },
};

export function ArchitectureTopology({ idea }: ArchitectureTopologyProps) {
  const [viewMode, setViewMode] = useState<"diagram" | "mermaid">("diagram");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("compute");
  const [copiedMermaid, setCopiedMermaid] = useState(false);

  const topology = useMemo(() => generateIdeaArchitectureTopology(idea), [idea]);

  const activeFlows = useMemo(
    () =>
      topology.flows.filter(
        (f) => f.from === selectedNodeId || f.to === selectedNodeId
      ),
    [topology, selectedNodeId]
  );

  const selectedNode: ArchNode | undefined = topology.nodes.find(
    (n) => n.id === selectedNodeId
  );

  const handleCopyMermaid = () => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(topology.mermaidCode);
    setCopiedMermaid(true);
    setTimeout(() => setCopiedMermaid(false), 2000);
  };

  return (
    <section id="system-topology" className="bento-white p-6 sm:p-7 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-700 flex items-center gap-1.5 font-bold">
            <Network className="w-3.5 h-3.5" />
            SYSTEM ARCHITECTURE TOPOLOGY
          </span>
          <p className="text-xs text-[#52525B] mt-1">
            {topology.syncPattern} &middot; {topology.summary}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex p-1 rounded-xl bg-zinc-100 border border-zinc-200/80">
            <button
              type="button"
              onClick={() => setViewMode("diagram")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "diagram"
                  ? "bg-white text-[#111113] shadow-xs"
                  : "text-zinc-500 hover:text-black"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Visual Graph</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mermaid")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "mermaid"
                  ? "bg-white text-[#111113] shadow-xs"
                  : "text-zinc-500 hover:text-black"
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Mermaid .mmd</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMermaid}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111113] hover:bg-zinc-800 text-white text-[11px] font-mono font-semibold transition-colors cursor-pointer"
          >
            {copiedMermaid ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-amber-300" />
                <span>Copy Mermaid</span>
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === "diagram" ? (
        <div className="space-y-5">
          {/* Interactive Dot-Matrix Topology Canvas */}
          <div className="relative rounded-2xl bg-[#FAF9F6] bg-dot-matrix border border-zinc-200/90 p-5 sm:p-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 relative z-10">
              {topology.nodes.map((node, index) => {
                const style = TIER_STYLES[node.tier];
                const Icon = style.icon;
                const isSelected = selectedNodeId === node.id;
                const isConnected = activeFlows.some(
                  (f) => f.from === node.id || f.to === node.id
                );

                return (
                  <div key={node.id} className="relative flex items-stretch">
                    <button
                      type="button"
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-[#0D0E12] text-white border-[#0D0E12] shadow-xl -translate-y-0.5 ring-2 ring-amber-400/50"
                          : isConnected
                            ? "bg-white text-[#111113] border-amber-300 shadow-sm"
                            : "bg-white/95 text-[#111113] border-zinc-200/90 hover:border-zinc-300 shadow-2xs"
                      }`}
                    >
                      <div className="space-y-2.5 w-full">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold border ${
                              isSelected
                                ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                                : style.badge
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>

                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-amber-300" : "text-zinc-500"
                            }`}
                          />
                        </div>

                        <div>
                          <h4 className="font-sans font-bold text-sm leading-snug">
                            {node.title}
                          </h4>
                          <p
                            className={`text-[11px] mt-1 leading-relaxed ${
                              isSelected ? "text-zinc-300" : "text-zinc-500"
                            }`}
                          >
                            {node.subtitle}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`pt-2.5 border-t flex items-center justify-between gap-2 text-[10px] font-mono w-full ${
                          isSelected
                            ? "border-white/10 text-zinc-300"
                            : "border-zinc-100 text-zinc-500"
                        }`}
                      >
                        <span className="truncate font-semibold">{node.techTag}</span>
                        <span
                          className={
                            isSelected ? "text-emerald-400 shrink-0" : "text-emerald-700 shrink-0"
                          }
                        >
                          {node.latencyLabel}
                        </span>
                      </div>
                    </button>

                    {/* Flow direction arrow between horizontal desktop nodes */}
                    {index < topology.nodes.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="hidden xl:flex items-center justify-center -mr-4 ml-0 z-20 pointer-events-none"
                      >
                        <div className="w-5 h-5 rounded-full bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-zinc-400">
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Protocol & Data-Flow Inspector Footer */}
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/80 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#111113]">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  ACTIVE DATA FLOWS &mdash;{" "}
                  <span className="text-amber-700">
                    {selectedNode?.title || "Selected Node"}
                  </span>
                </span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                Click any tier node above to inspect payload routes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activeFlows.map((flow) => {
                const fromNode = topology.nodes.find((n) => n.id === flow.from);
                const toNode = topology.nodes.find((n) => n.id === flow.to);
                return (
                  <div
                    key={flow.id}
                    className="p-3 rounded-xl bg-white border border-zinc-200/80 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] font-mono font-semibold text-[#111113]">
                      <span className="truncate">
                        {fromNode?.title} &rarr; {toNode?.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] shrink-0">
                        {flow.protocol}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">{flow.payload}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#0D0E12] text-zinc-200 p-5 border border-zinc-800 font-mono text-xs overflow-x-auto leading-relaxed">
            <pre className="whitespace-pre-wrap">{topology.mermaidCode}</pre>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            Paste directly into GitHub README.md, Notion, or Cursor/Windsurf context inside a{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800">```mermaid</code>{" "}
            fenced block.
          </p>
        </div>
      )}
    </section>
  );
}
