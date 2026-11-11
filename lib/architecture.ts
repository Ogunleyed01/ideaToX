import {
  ArchFlow,
  ArchNode,
  ArchitectureTopology,
  Idea,
  InfrastructureEstimate,
  InfrastructureLineItem,
  InfrastructureScaleTier,
} from "@/types/idea";

function buildCombinedCorpus(idea: Idea): string {
  return [
    idea.title,
    idea.hook,
    idea.problem_statement,
    ...(idea.suggested_stack || []),
    ...(idea.mvp_features || []),
  ]
    .join(" ")
    .toLowerCase();
}

function includesAny(corpus: string, keywords: string[]): boolean {
  return keywords.some((kw) => corpus.includes(kw));
}

function sanitizeMermaidLabel(text: string): string {
  return text.replace(/["`\[\]\(\){}]/g, "").trim();
}

/**
 * Generates deterministic, realistic monthly hosting cost estimates and stack recommendations
 * across Hobby ($0/mo), Production Launch, and High-Scale tiers tailored to the idea category.
 */
export function estimateIdeaInfrastructure(
  idea: Idea,
  tier: InfrastructureScaleTier
): InfrastructureEstimate {
  const corpus = buildCombinedCorpus(idea);
  const stack = idea.suggested_stack || [];

  const usesAiInference =
    idea.category === "ai" ||
    includesAny(corpus, [
      "llm",
      "gemini",
      "openai",
      "anthropic",
      "claude",
      "rag",
      "vector",
      "embedding",
      "agent",
      "whisper",
    ]);

  const usesLocalFirst =
    includesAny(corpus, [
      "sqlite",
      "indexeddb",
      "crdt",
      "yjs",
      "offline",
      "local-first",
      "tauri",
      "wasm",
      "p2p",
      "webrtc",
    ]);

  const usesRealtime =
    includesAny(corpus, [
      "websocket",
      "realtime",
      "live",
      "sync",
      "multiplayer",
      "mqtt",
      "pub/sub",
    ]);

  const isLocalBinaryOrHardware =
    idea.category === "cli" || idea.category === "hardware" || idea.category === "extension";

  const isHobby = tier === "hobby";
  const isScale = tier === "scale";

  // 1. Compute / Runtime Layer
  let computeItem: InfrastructureLineItem;
  if (idea.category === "cli") {
    computeItem = {
      layer: "compute",
      label: "Runtime & Distribution",
      provider: usesRealtime ? "Local Binary + Cloudflare Workers" : "GitHub Releases / npm / Crates.io",
      allowance: isHobby
        ? "Zero server footprint on end-user machine"
        : usesRealtime
          ? "Edge telemetry relay (10M req/mo)"
          : "Public CLI package CDN & auto-updater",
      monthlyUsd: isHobby || !usesRealtime ? 0 : isScale ? 15 : 5,
    };
  } else if (idea.category === "hardware") {
    computeItem = {
      layer: "compute",
      label: "Device Gateway & OTA",
      provider: usesRealtime ? "Fly.io MQTT Bridge" : "On-Device Firmware + GitHub OTA",
      allowance: isHobby
        ? "Local LAN / BLE gateway only"
        : isScale
          ? "Multi-region HA broker (50k devices)"
          : "256MB edge telemetry bridge + OTA server",
      monthlyUsd: isHobby ? 0 : isScale ? 29 : 8,
    };
  } else if (idea.category === "extension") {
    computeItem = {
      layer: "compute",
      label: "Extension & Edge Relay",
      provider: usesAiInference || usesRealtime ? "Cloudflare Workers" : "Browser Sandbox (Manifest V3)",
      allowance: isHobby
        ? "100k free Workers requests/day"
        : isScale
          ? "Edge proxy + cron sync (30M req/mo)"
          : "Workers Paid + edge KV caching",
      monthlyUsd: isHobby || (!usesAiInference && !usesRealtime) ? 0 : isScale ? 25 : 5,
    };
  } else {
    computeItem = {
      layer: "compute",
      label: "App Compute & Edge SSR",
      provider:
        idea.category === "mobile"
          ? "Expo EAS + Vercel Edge API"
          : includesAny(corpus, ["rust", "go", "docker", "websocket"])
            ? "Fly.io / Railway Containers"
            : "Vercel Next.js Edge + ISR",
      allowance: isHobby
        ? "Free tier (100GB bandwidth / single instance)"
        : isScale
          ? "Dedicated multi-region compute + 1TB egress"
          : "Pro seat + zero-cold-start SSR functions",
      monthlyUsd: isHobby ? 0 : isScale ? 60 : 20,
    };
  }

  // 2. Database & State Layer
  let dbItem: InfrastructureLineItem;
  if (usesLocalFirst && (isLocalBinaryOrHardware || isHobby)) {
    dbItem = {
      layer: "database",
      label: "Primary Persistence",
      provider: includesAny(corpus, ["sqlite", "tauri", "rust"])
        ? "SQLite + Turso LibSQL"
        : "IndexedDB + Supabase Sync",
      allowance: isHobby
        ? "On-device local storage + 9GB Turso free tier"
        : isScale
          ? "Embedded edge replicas + WAL snapshotting"
          : "Encrypted multi-device sync replica",
      monthlyUsd: isHobby ? 0 : isScale ? 39 : 9,
    };
  } else if (isLocalBinaryOrHardware && !usesRealtime && !usesAiInference) {
    dbItem = {
      layer: "database",
      label: "Config & Local State",
      provider: "Local SQLite / XDG JSON Store",
      allowance: "Encrypted local filesystem state ($0 cloud dependency)",
      monthlyUsd: 0,
    };
  } else {
    dbItem = {
      layer: "database",
      label: "Database & Auth RLS",
      provider: usesAiInference ? "Supabase Postgres + pgvector" : "Supabase Postgres / Neon",
      allowance: isHobby
        ? "500MB Postgres + 50k MAU auth free"
        : isScale
          ? "Dedicated 4GB RAM + PITR backups + read pool"
          : "8GB SSD Postgres + automated daily snapshots",
      monthlyUsd: isHobby ? 0 : isScale ? 75 : 25,
    };
  }

  // 3. Storage, Cache & Realtime Layer
  let storageItem: InfrastructureLineItem;
  if (isLocalBinaryOrHardware && !usesAiInference && !usesRealtime) {
    storageItem = {
      layer: "storage",
      label: "Asset & Telemetry Buffer",
      provider: "Local Cache + Cloudflare R2",
      allowance: "10GB R2 object storage free forever (0 egress fee)",
      monthlyUsd: 0,
    };
  } else {
    storageItem = {
      layer: "storage",
      label: usesRealtime ? "Realtime Pub/Sub & Storage" : "Object Storage & Rate Limit",
      provider: usesRealtime ? "Upstash Redis + Cloudflare R2" : "Cloudflare R2 + Vercel KV",
      allowance: isHobby
        ? "10GB R2 + 10k Redis commands/day free"
        : isScale
          ? "250GB media assets + global pub/sub channels"
          : "50GB R2 storage + sliding-window API cache",
      monthlyUsd: isHobby ? 0 : isScale ? 28 : 6,
    };
  }

  // 4. AI Inference, Email & Observability
  let servicesItem: InfrastructureLineItem;
  if (usesAiInference) {
    servicesItem = {
      layer: "services",
      label: "AI Inference & Transactional Email",
      provider: "Gemini 2.5 Flash + Resend",
      allowance: isHobby
        ? "Gemini free RPM quota + 3k emails/mo"
        : isScale
          ? "~40M context tokens/mo + structured JSON caching"
          : "~5M inference tokens/mo + webhook alerts",
      monthlyUsd: isHobby ? 0 : isScale ? 45 : 12,
    };
  } else if (isLocalBinaryOrHardware) {
    servicesItem = {
      layer: "services",
      label: "Telemetry & Crash Reporting",
      provider: "Sentry Developer + Plausible / OpenTelemetry",
      allowance: "Optional privacy-preserving opt-in diagnostics",
      monthlyUsd: isHobby ? 0 : isScale ? 26 : 0,
    };
  } else {
    servicesItem = {
      layer: "services",
      label: "Transactional Mail & Monitoring",
      provider: "Resend + Sentry",
      allowance: isHobby
        ? "3,000 emails/mo + 5k Sentry errors free"
        : isScale
          ? "100k notifications/mo + trace sampling"
          : "50k emails/mo + uptime alerts",
      monthlyUsd: isHobby ? 0 : isScale ? 20 : 4,
    };
  }

  const items = [computeItem, dbItem, storageItem, servicesItem];
  const monthlyTotalUsd = items.reduce((sum, item) => sum + item.monthlyUsd, 0);

  // Curated packages list
  const packagesSet = new Set<string>();
  if (idea.category === "web" || idea.category === "ai") {
    packagesSet.add("@supabase/ssr");
    packagesSet.add("zod");
    packagesSet.add("lucide-react");
  }
  if (idea.category === "mobile") {
    packagesSet.add("expo");
    packagesSet.add("zustand");
    packagesSet.add("@tanstack/react-query");
  }
  if (idea.category === "cli") {
    packagesSet.add("commander");
    packagesSet.add("clack/prompts");
    packagesSet.add("zod");
  }
  if (idea.category === "hardware") {
    packagesSet.add("mqtt");
    packagesSet.add("serialport");
    packagesSet.add("zod");
  }
  if (idea.category === "extension") {
    packagesSet.add("plasmo");
    packagesSet.add("@plasmohq/storage");
    packagesSet.add("zod");
  }
  if (usesAiInference) packagesSet.add("@google/genai");
  if (usesLocalFirst) packagesSet.add("yjs");
  if (usesRealtime && idea.category !== "hardware") packagesSet.add("@upstash/redis");
  stack.slice(0, 2).forEach((s) => {
    const clean = s.toLowerCase().replace(/[^a-z0-9@/_-]/g, "");
    if (clean && clean.length >= 2 && clean.length <= 24) {
      packagesSet.add(clean);
    }
  });

  const starterCommand =
    idea.category === "mobile"
      ? `npx create-expo-app@latest ${idea.slug} --template tabs`
      : idea.category === "extension"
        ? `npx plasmo init ${idea.slug} --with-src`
        : idea.category === "cli"
          ? `npx create-ts-cli@latest ${idea.slug}`
          : idea.category === "hardware"
            ? `pio project init --board esp32dev -d ${idea.slug}`
            : `npx create-next-app@latest ${idea.slug} --ts --tailwind --app`;

  const architectureSummary = isLocalBinaryOrHardware
    ? usesRealtime
      ? "Local-first client paired with lightweight edge sync"
      : "Zero-backend local execution with optional static releases"
    : usesLocalFirst
      ? "Offline-first optimistic engine with background Postgres replication"
      : "Serverless Edge SSR with Row-Level Security persistence";

  const costNote = isHobby
    ? "Designed to validate and ship publicly for $0/mo using generous developer free tiers before spending a cent on infrastructure."
    : isScale
      ? "Estimates 50,000+ monthly active users with zero-downtime pooling, CDN asset caching, and automated failover."
      : "Optimized single-team production stack with automated backups, custom domains, and predictable billing ceilings.";

  return {
    tier,
    monthlyTotalUsd,
    architectureSummary,
    items,
    recommendedPackages: Array.from(packagesSet).slice(0, 6),
    starterCommand,
    costNote,
  };
}

/**
 * Generates an interactive 4-tier System Architecture Topology graph and valid Mermaid.js flowchart
 * tailored to the blueprint category, suggested stack, and MVP scope.
 */
export function generateIdeaArchitectureTopology(idea: Idea): ArchitectureTopology {
  const corpus = buildCombinedCorpus(idea);
  const stackLabel = idea.suggested_stack?.slice(0, 3).join(" / ") || "TypeScript";

  const usesAiInference =
    idea.category === "ai" ||
    includesAny(corpus, [
      "llm",
      "gemini",
      "openai",
      "claude",
      "rag",
      "vector",
      "agent",
      "ai",
    ]);

  const usesLocalFirst = includesAny(corpus, [
    "offline",
    "sqlite",
    "indexeddb",
    "crdt",
    "yjs",
    "local",
    "p2p",
    "mesh",
  ]);

  const usesRealtime = includesAny(corpus, [
    "websocket",
    "realtime",
    "sync",
    "mqtt",
    "stream",
    "live",
  ]);

  let clientNode: ArchNode;
  if (idea.category === "mobile") {
    clientNode = {
      id: "client",
      tier: "client",
      title: "Mobile PWA / Expo App",
      subtitle: "Offline cache, biometric auth & native shell",
      techTag: idea.suggested_stack?.[0] || "React Native / PWA",
      latencyLabel: "< 16ms UI",
    };
  } else if (idea.category === "cli") {
    clientNode = {
      id: "client",
      tier: "client",
      title: "Terminal CLI Binary",
      subtitle: "Interactive TUI, Unix pipes & config vault",
      techTag: idea.suggested_stack?.[0] || "Node / Rust CLI",
      latencyLabel: "< 5ms Local",
    };
  } else if (idea.category === "hardware") {
    clientNode = {
      id: "client",
      tier: "client",
      title: "Edge Sensor / MCU Node",
      subtitle: "GPIO telemetry sampling & local ring buffer",
      techTag: idea.suggested_stack?.[0] || "ESP32 / Embedded",
      latencyLabel: "Real-Time IRQ",
    };
  } else if (idea.category === "extension") {
    clientNode = {
      id: "client",
      tier: "client",
      title: "Manifest V3 Extension",
      subtitle: "Content script overlay & service worker popup",
      techTag: idea.suggested_stack?.[0] || "Plasmo / WebExt",
      latencyLabel: "< 10ms DOM",
    };
  } else {
    clientNode = {
      id: "client",
      tier: "client",
      title: "Next.js Web Surface",
      subtitle: "Optimistic UI, keyboard palette & SSR shell",
      techTag: idea.suggested_stack?.[0] || "Next.js 16 + Tailwind",
      latencyLabel: "< 40ms TTFB",
    };
  }

  const computeNode: ArchNode = usesAiInference
    ? {
        id: "compute",
        tier: "compute",
        title: "Edge Orchestrator & Agent API",
        subtitle: "Zod schema validation, streaming tool calls & RLS guard",
        techTag: "Edge Functions + Zod",
        latencyLabel: "~95ms Route",
      }
    : usesLocalFirst
      ? {
          id: "compute",
          tier: "compute",
          title: "Local Sync & CRDT Engine",
          subtitle: "Optimistic queue, delta merge & conflict resolver",
          techTag: "CRDT / Worker Thread",
          latencyLabel: "0ms Optimistic",
        }
      : {
          id: "compute",
          tier: "compute",
          title: "Edge API & Domain Router",
          subtitle: "Stateless handlers, rate limiting & input schemas",
          techTag: stackLabel,
          latencyLabel: "~45ms Edge",
        };

  const dataNode: ArchNode = usesLocalFirst
    ? {
        id: "data",
        tier: "data",
        title: "SQLite / Postgres Hybrid Store",
        subtitle: "Local embedded state synced to Row-Level Postgres",
        techTag: usesAiInference ? "SQLite + pgvector" : "IndexedDB + Supabase",
        latencyLabel: "< 8ms Query",
      }
    : {
        id: "data",
        tier: "data",
        title: "Postgres & Artifact Store",
        subtitle: "Relational schema with RLS policies & edge KV cache",
        techTag: usesRealtime ? "Postgres + Redis" : "Supabase + R2",
        latencyLabel: "< 18ms Read",
      };

  const externalNode: ArchNode = usesAiInference
    ? {
        id: "external",
        tier: "external",
        title: "LLM Inference & Vector Index",
        subtitle: "Structured JSON spec compilation & deterministic fallback",
        techTag: "Gemini 2.5 Flash",
        latencyLabel: "SSE Stream",
      }
    : idea.category === "hardware"
      ? {
          id: "external",
          tier: "external",
          title: "MQTT / Webhook Relay",
          subtitle: "Fleet alerts, OTA firmware bundles & dashboard push",
          techTag: "MQTT + Webhooks",
          latencyLabel: "Pub/Sub Push",
        }
      : {
          id: "external",
          tier: "external",
          title: "Auth, Webhooks & Delivery",
          subtitle: `OAuth identity, transactional mail & ${idea.target_region} edge CDN`,
          techTag: "Auth + Resend CDN",
          latencyLabel: "Global Edge",
        };

  const nodes = [clientNode, computeNode, dataNode, externalNode];

  const flows: ArchFlow[] = [
    {
      id: "f1",
      from: clientNode.id,
      to: computeNode.id,
      protocol: usesLocalFirst ? "Local IPC / Sync Delta" : idea.category === "hardware" ? "BLE / MQTT Packet" : "HTTPS + Typed JSON",
      payload: "Validated user intent & optimistic mutation",
    },
    {
      id: "f2",
      from: computeNode.id,
      to: dataNode.id,
      protocol: usesLocalFirst ? "WAL Checkpoint" : "Prepared SQL + RLS",
      payload: "Normalized domain state & indexed snapshots",
    },
    {
      id: "f3",
      from: computeNode.id,
      to: externalNode.id,
      protocol: usesAiInference ? "Prompt + JSON Schema" : "Signed Webhook / Event",
      payload: usesAiInference
        ? "Structured reasoning & streaming completion"
        : "Async notifications, auth claims & edge replication",
    },
    {
      id: "f4",
      from: externalNode.id,
      to: clientNode.id,
      protocol: usesRealtime || usesAiInference ? "SSE / Realtime Channel" : "Edge Cache Revalidation",
      payload: "Live UI hydration without blocking primary thread",
    },
  ];

  const cLabel = sanitizeMermaidLabel(`${clientNode.title} - ${clientNode.techTag}`);
  const pLabel = sanitizeMermaidLabel(`${computeNode.title} - ${computeNode.techTag}`);
  const dLabel = sanitizeMermaidLabel(`${dataNode.title} - ${dataNode.techTag}`);
  const eLabel = sanitizeMermaidLabel(`${externalNode.title} - ${externalNode.techTag}`);

  const mermaidCode = [
    "flowchart LR",
    `  C["${cLabel}"]`,
    `  P["${pLabel}"]`,
    `  D[("${dLabel}")]`,
    `  E["${eLabel}"]`,
    `  C -->|"${sanitizeMermaidLabel(flows[0].protocol)}"| P`,
    `  P -->|"${sanitizeMermaidLabel(flows[1].protocol)}"| D`,
    `  P -->|"${sanitizeMermaidLabel(flows[2].protocol)}"| E`,
    `  E -.->|"${sanitizeMermaidLabel(flows[3].protocol)}"| C`,
  ].join("\n");

  const syncPattern = usesLocalFirst
    ? "Local-First Optimistic Sync"
    : usesRealtime
      ? "Event-Driven Realtime Mesh"
      : usesAiInference
        ? "Structured AI Pipeline"
        : "Edge Request-Response + RLS";

  return {
    summary: `End-to-end topology optimized for ${idea.target_region} builders (${idea.difficulty} scope).`,
    syncPattern,
    nodes,
    flows,
    mermaidCode,
  };
}
