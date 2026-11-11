"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Sparkles,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  RotateCcw,
  X,
  ArrowRight,
  GitFork,
  Terminal,
  Layers,
  Globe,
  Zap,
  Code2,
  Plus,
  Bookmark,
  Link2,
  Check,
  Compass,
} from "lucide-react";
import {
  getAllIdeas,
  CURATED_COLLECTIONS,
  matchesCuratedCollection,
  getSavedBookmarks,
  getServerSavedBookmarks,
  subscribeBookmarks,
} from "@/lib/ideas";
import {
  Idea,
  IdeaCategory,
  IdeaDifficulty,
  CollabStatus,
  CuratedCollectionId,
} from "@/types/idea";
import { FloatingNavbar } from "@/components/floating-navbar";
import { IdeaCard } from "@/components/idea-card";
import { ForkModal } from "@/components/fork-modal";
import { ObsidianMegaFooter } from "@/components/obsidian-mega-footer";

const CATEGORIES: {
  id: "all" | IdeaCategory;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "all", label: "All Blueprints", icon: Layers },
  { id: "web", label: "Web Apps", icon: Globe },
  { id: "mobile", label: "Mobile PWAs", icon: Layers },
  { id: "ai", label: "AI & Agents", icon: Sparkles },
  { id: "cli", label: "CLI & Systems", icon: Terminal },
  { id: "hardware", label: "Hardware & IoT", icon: Zap },
  { id: "extension", label: "Extensions", icon: Code2 },
];

const VALID_CATEGORIES = new Set<string>(["all", "web", "mobile", "ai", "cli", "hardware", "extension"]);
const VALID_DIFFICULTIES = new Set<string>(["all", "beginner", "intermediate", "advanced"]);
const VALID_COLLABS = new Set<string>(["all", "open", "seeking_cofounder"]);
const VALID_STATUSES = new Set<string>(["all", "shipped", "unbuilt"]);
const VALID_SORTS = new Set<string>(["stars", "newest", "forks", "builds"]);
const VALID_COLLECTIONS = new Set<string>([
  "weekend_quickstarts",
  "autonomous_agents",
  "local_first",
  "hardware_iot",
  "want_to_build",
]);

function IdeasDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  const bookmarkedSlugs = useSyncExternalStore(
    subscribeBookmarks,
    getSavedBookmarks,
    getServerSavedBookmarks
  );

  // Derive filter states directly from shareable URL query parameters
  const searchQuery = searchParams?.get("q") || "";
  const rawCategory = searchParams?.get("category") || "all";
  const selectedCategory = (
    VALID_CATEGORIES.has(rawCategory) ? rawCategory : "all"
  ) as "all" | IdeaCategory;

  const rawDifficulty = searchParams?.get("difficulty") || "all";
  const selectedDifficulty = (
    VALID_DIFFICULTIES.has(rawDifficulty) ? rawDifficulty : "all"
  ) as "all" | IdeaDifficulty;

  const selectedRegion = searchParams?.get("region") || "all";

  const rawCollab = searchParams?.get("collab") || "all";
  const selectedCollab = (
    VALID_COLLABS.has(rawCollab) ? rawCollab : "all"
  ) as "all" | CollabStatus;

  const rawStatus = searchParams?.get("status") || "all";
  const selectedBuildStatus = (
    VALID_STATUSES.has(rawStatus) ? rawStatus : "all"
  ) as "all" | "shipped" | "unbuilt";

  const rawCollection = searchParams?.get("collection") || "";
  const selectedCollection = VALID_COLLECTIONS.has(rawCollection)
    ? (rawCollection as CuratedCollectionId)
    : null;

  const rawSort = searchParams?.get("sort") || "stars";
  const sortBy = (
    VALID_SORTS.has(rawSort) ? rawSort : "stars"
  ) as "stars" | "newest" | "forks" | "builds";

  const viewMode: "grid" | "list" =
    searchParams?.get("view") === "list" ? "list" : "grid";

  const updateFilterParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams?.toString() || "");
    Object.entries(updates).forEach(([key, value]) => {
      const isDefault =
        value === null ||
        value === "" ||
        (key !== "q" && value === "all") ||
        (key === "sort" && value === "stars") ||
        (key === "view" && value === "grid");

      if (isDefault) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });

    const nextQs = nextParams.toString();
    router.replace(nextQs ? `/ideas?${nextQs}` : "/ideas", { scroll: false });
  };

  // Pagination / Load More state
  const [visibleCount, setVisibleCount] = useState(18);

  // Fork Modal state
  const [forkModalIdea, setForkModalIdea] = useState<Idea | null>(null);

  // Command palette state
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const paletteInputRef = useRef<HTMLInputElement>(null);

  // Hydrate ideas
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getAllIdeas();
        setIdeas(data || []);
      } catch (err) {
        console.error("Failed to fetch ideas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  // Extract unique regions dynamically
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    ideas.forEach((i) => {
      if (i.target_region) set.add(i.target_region);
    });
    return ["all", ...Array.from(set).sort()];
  }, [ideas]);

  // Collection counts
  const collectionCounts = useMemo(() => {
    const counts: Record<CuratedCollectionId, number> = {
      weekend_quickstarts: 0,
      autonomous_agents: 0,
      local_first: 0,
      hardware_iot: 0,
      want_to_build: 0,
    };
    CURATED_COLLECTIONS.forEach((col) => {
      counts[col.id] = ideas.filter((idea) =>
        matchesCuratedCollection(idea, col.id, bookmarkedSlugs)
      ).length;
    });
    return counts;
  }, [ideas, bookmarkedSlugs]);

  // Filter & Sort Logic
  const filteredIdeas = useMemo(() => {
    let result = [...ideas];

    // Curated Collection playlist filter
    if (selectedCollection) {
      result = result.filter((i) =>
        matchesCuratedCollection(i, selectedCollection, bookmarkedSlugs)
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.hook.toLowerCase().includes(q) ||
          i.problem_statement?.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.target_region?.toLowerCase().includes(q) ||
          i.suggested_stack?.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((i) => i.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      result = result.filter((i) => i.difficulty === selectedDifficulty);
    }

    // Region filter
    if (selectedRegion !== "all") {
      result = result.filter(
        (i) => (i.target_region || "").toLowerCase() === selectedRegion.toLowerCase()
      );
    }

    // Collab status filter
    if (selectedCollab !== "all") {
      result = result.filter((i) => i.collab_status === selectedCollab);
    }

    // Build status filter
    if (selectedBuildStatus === "shipped") {
      result = result.filter((i) => (i.builds_count || 0) > 0 || (i.builds && i.builds.length > 0));
    } else if (selectedBuildStatus === "unbuilt") {
      result = result.filter((i) => (i.builds_count || 0) === 0 && (!i.builds || i.builds.length === 0));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "stars") {
        return (b.upvotes_count || 0) - (a.upvotes_count || 0);
      }
      if (sortBy === "forks") {
        return (b.forks_count || 0) - (a.forks_count || 0);
      }
      if (sortBy === "builds") {
        return (b.builds_count || 0) - (a.builds_count || 0);
      }
      if (sortBy === "newest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [
    ideas,
    selectedCollection,
    bookmarkedSlugs,
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedRegion,
    selectedCollab,
    selectedBuildStatus,
    sortBy,
  ]);

  const visibleIdeas = useMemo(() => {
    return filteredIdeas.slice(0, visibleCount);
  }, [filteredIdeas, visibleCount]);

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(selectedCollection) ||
    selectedCategory !== "all" ||
    selectedDifficulty !== "all" ||
    selectedRegion !== "all" ||
    selectedCollab !== "all" ||
    selectedBuildStatus !== "all";

  const handleResetFilters = () => {
    router.replace("/ideas", { scroll: false });
  };

  const handleCopyShareableUrl = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  // Command palette search items
  const paletteResults = useMemo(() => {
    if (!paletteQuery.trim()) {
      return ideas.slice(0, 6);
    }
    const q = paletteQuery.toLowerCase().trim();
    return ideas
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.hook.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.suggested_stack?.some((s) => s.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [ideas, paletteQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111113] selection:bg-amber-100 selection:text-amber-900 relative">
      {/* Dynamic Island Floating Navbar */}
      <FloatingNavbar onOpenSearch={() => setPaletteOpen(true)} />

      {/* Main Exploration Section */}
      <main className="w-full pt-28 pb-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {/* Header HUD Banner */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200/80 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.05)] text-xs text-[#111113] font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-zinc-500 font-semibold tracking-wider uppercase">
              The Architecture Registry
            </span>
            <span className="text-zinc-300">|</span>
            <span className="text-zinc-700 font-mono text-[11px] flex items-center gap-1">
              {ideas.length}+ Verified Specs
              <Sparkles size={11} className="text-amber-500" />
            </span>
          </div>

          <h1 className="font-sans font-semibold tracking-[-0.035em] text-[#111113] text-3xl sm:text-5xl md:text-6xl max-w-4xl leading-[1.12]">
            Discover real-world{" "}
            <span className="font-serif italic font-normal text-zinc-800">
              software
            </span>{" "}
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-[#111113] text-white mx-1 align-middle shadow-md border border-white/10">
              <GitFork size={18} className="text-amber-300" />
            </span>{" "}
            <span className="font-serif italic font-normal text-amber-600">
              blueprints
            </span>
            .
          </h1>

          <p className="mt-4 text-[#52525B] text-base sm:text-lg max-w-2xl leading-relaxed">
            Version-controlled project specifications, ready for instant compilation,
            collaborative feature pull requests, and production deployment.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/ideas/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111113] text-white text-xs font-mono font-semibold hover:bg-zinc-800 transition-colors shadow-sm"
            >
              <Plus size={14} className="text-amber-300" />
              <span>Compile New Spec</span>
            </Link>

            <Link
              href="/#studio"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-zinc-700 text-xs font-mono font-medium border border-zinc-200 hover:border-zinc-300 shadow-sm transition-colors"
            >
              <Sparkles size={14} className="text-amber-600" />
              <span>Chaos Slot Machine</span>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            CURATED COLLECTIONS & PERSONAL READING LIST STRIP
           ========================================================================= */}
        <section aria-label="Curated Blueprint Collections" className="mb-7 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold">
              <Compass size={13} className="text-amber-600" />
              <span>Curated Blueprint Playlists &amp; Reading List</span>
            </div>
            {selectedCollection && (
              <button
                type="button"
                onClick={() => updateFilterParams({ collection: null })}
                className="text-[11px] font-mono text-amber-800 hover:underline cursor-pointer"
              >
                Clear playlist filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CURATED_COLLECTIONS.map((col) => {
              const active = selectedCollection === col.id;
              const count = collectionCounts[col.id] ?? 0;
              const isReadingList = col.id === "want_to_build";

              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() =>
                    updateFilterParams({ collection: active ? null : col.id })
                  }
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-2.5 cursor-pointer ${
                    active
                      ? "bg-[#0D0E12] text-white border-[#0D0E12] shadow-lg -translate-y-0.5 ring-2 ring-amber-400/40"
                      : "bg-white text-[#111113] border-zinc-200/90 hover:border-amber-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold border ${
                        active
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/30"
                          : isReadingList
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {col.badge}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold tabular-nums ${
                        active ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {isReadingList && (
                        <Bookmark
                          size={11}
                          className={count > 0 ? "fill-current" : ""}
                        />
                      )}
                      {count}
                    </span>
                  </div>

                  <div>
                    <h2 className="font-sans font-semibold text-[13px] leading-snug">
                      {col.title}
                    </h2>
                    <p
                      className={`text-[11px] mt-1 leading-snug line-clamp-2 ${
                        active ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {col.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SEARCH & MULTI-FILTER BAR
           ========================================================================= */}
        <div className="bento-white p-5 sm:p-6 mb-8 space-y-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-zinc-200/90">
          {/* Row 1: Search Bar & View Mode Toggle */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search by title, pain point, category, or tech stack (e.g. Redis, Rust, PWA)..."
                value={searchQuery}
                onChange={(e) => updateFilterParams({ q: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs sm:text-sm text-[#111113] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateFilterParams({ q: null })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-black rounded"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Sort Selector */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => updateFilterParams({ sort: e.target.value })}
                  aria-label="Sort specifications"
                  className="appearance-none pl-8 pr-8 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-700 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer"
                >
                  <option value="stars">Most Upvoted</option>
                  <option value="newest">Newest First</option>
                  <option value="forks">Most Forked</option>
                  <option value="builds">Most Builds</option>
                </select>
                <ArrowUpDown
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                />
              </div>

              {/* Grid / List View Switcher */}
              <div className="flex items-center p-1 bg-zinc-100 rounded-xl border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => updateFilterParams({ view: "grid" })}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-[#111113] shadow-xs"
                      : "text-zinc-400 hover:text-black"
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => updateFilterParams({ view: "list" })}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#111113] shadow-xs"
                      : "text-zinc-400 hover:text-black"
                  }`}
                  title="List View"
                  aria-label="List View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateFilterParams({ category: cat.id })}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#111113] text-white font-semibold shadow-xs"
                      : "bg-zinc-50 text-zinc-600 border border-zinc-200/90 hover:border-zinc-300 hover:text-black"
                  }`}
                >
                  <Icon size={12} className={active ? "text-amber-300" : "text-zinc-500"} />
                  <span>{cat.label}</span>
                  {cat.id !== "all" && (
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        active ? "bg-white/20 text-white" : "bg-zinc-200/70 text-zinc-600"
                      }`}
                    >
                      {ideas.filter((i) => i.category === cat.id).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Row 3: Secondary Multi-Filters (Difficulty, Region, Collab, Shipped) */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-zinc-100 text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
              <Filter size={12} />
              <span>Filters:</span>
            </span>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => updateFilterParams({ difficulty: e.target.value })}
              aria-label="Filter by difficulty tier"
              className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Difficulties</option>
              <option value="beginner">Weekend Build (Beginner)</option>
              <option value="intermediate">Side Project (Intermediate)</option>
              <option value="advanced">Full SaaS (Advanced)</option>
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => updateFilterParams({ region: e.target.value })}
              aria-label="Filter by target region"
              className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Regions</option>
              {availableRegions
                .filter((r) => r !== "all")
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>

            {/* Collab Status Filter */}
            <select
              value={selectedCollab}
              onChange={(e) => updateFilterParams({ collab: e.target.value })}
              aria-label="Filter by collaboration status"
              className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Collab Statuses</option>
              <option value="open">Open Spec (Free to Build)</option>
              <option value="seeking_cofounder">Seeking Co-Founder</option>
            </select>

            {/* Shipped / Unbuilt Filter */}
            <select
              value={selectedBuildStatus}
              onChange={(e) => updateFilterParams({ status: e.target.value })}
              aria-label="Filter by proof-of-work status"
              className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              <option value="all">All Proof-of-Work Statuses</option>
              <option value="shipped">Has Shipped Codebase</option>
              <option value="unbuilt">Unbuilt / Fresh Concepts</option>
            </select>

            {/* Shareable Filter URL & Reset Filters CTA */}
            <div className="ml-auto flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-zinc-500 hover:text-amber-800 transition-colors font-medium cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset Filters</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyShareableUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-black transition-colors shadow-2xs cursor-pointer"
              >
                {copiedShareUrl ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 size={12} className="text-amber-600" />
                    <span>Share Filter URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Telemetry Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 text-xs font-mono text-zinc-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>SHOWING:</span>
            <span className="font-bold text-[#111113]">
              {filteredIdeas.length} of {ideas.length}
            </span>
            <span>BLUEPRINTS</span>
            {selectedCollection && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-semibold">
                {CURATED_COLLECTIONS.find((c) => c.id === selectedCollection)?.title}
                <button
                  type="button"
                  onClick={() => updateFilterParams({ collection: null })}
                  className="hover:text-black ml-0.5 cursor-pointer"
                  aria-label="Clear playlist filter"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>

          {searchQuery && (
            <div className="flex items-center gap-1.5 text-zinc-600">
              <span>QUERY:</span>
              <span className="font-semibold text-amber-800">&quot;{searchQuery}&quot;</span>
            </div>
          )}
        </div>

        {/* =========================================================================
            IDEAS BENTO GRID / LIST
           ========================================================================= */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 animate-spin">
              <Sparkles size={20} />
            </div>
            <p className="font-mono text-xs text-zinc-500">
              SYNCHRONIZING REPOSITORY BLUEPRINTS...
            </p>
          </div>
        ) : filteredIdeas.length === 0 ? (
          /* Empty State */
          <div className="bento-white p-12 sm:p-16 text-center max-w-xl mx-auto space-y-5 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
              <Search size={22} />
            </div>
            <h3 className="font-sans font-semibold text-xl text-[#111113]">
              No Matching Specifications
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-sans">
              We couldn&apos;t find any architectures matching your exact filter combination.
              You can reset the filters or synthesize this specification right now using AI.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-mono font-semibold transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>

              <Link
                href={`/ideas/new${searchQuery ? `?prompt=${encodeURIComponent(searchQuery)}` : ""}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#111113] hover:bg-zinc-800 text-white text-xs font-mono font-semibold transition-colors shadow-sm"
              >
                <Sparkles size={13} className="text-amber-300" />
                <span>Synthesize with AI</span>
              </Link>
            </div>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
                : "flex flex-col gap-4"
            }
          >
            {visibleIdeas.map((idea, index) => (
              <IdeaCard
                key={idea.slug || index}
                idea={idea}
                index={index}
                viewMode={viewMode}
                onForkClick={(selected) => setForkModalIdea(selected)}
              />
            ))}
          </div>
        )}

        {/* Load More Pagination Trigger */}
        {!loading && filteredIdeas.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 18)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/90 text-xs font-mono font-semibold transition-all shadow-sm cursor-pointer"
            >
              <span>Load More Specifications</span>
              <span className="text-[11px] text-zinc-400 font-normal">
                ({filteredIdeas.length - visibleCount} remaining)
              </span>
            </button>
          </div>
        )}
      </main>

      {/* Fork Modal */}
      {forkModalIdea && (
        <ForkModal
          idea={forkModalIdea}
          isOpen={Boolean(forkModalIdea)}
          onClose={() => setForkModalIdea(null)}
          onForkCreated={(newIdea) => {
            setIdeas((prev) => [newIdea, ...prev]);
            setForkModalIdea(null);
          }}
        />
      )}

      {/* Command Palette (⌘K) Modal */}
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
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
              <Search size={18} className="text-zinc-400 shrink-0" />
              <input
                ref={paletteInputRef}
                type="text"
                placeholder="Search blueprints, runtimes, stacks..."
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

            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {paletteResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 font-mono">
                  No matching specifications found.
                </div>
              ) : (
                paletteResults.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/ideas/${item.slug}`}
                    onClick={() => setPaletteOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-semibold text-xs text-[#111113] group-hover:text-amber-800">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-200/60 text-zinc-600 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                        {item.hook}
                      </p>
                    </div>
                    <ArrowRight
                      size={13}
                      className="text-zinc-400 group-hover:text-black transition-transform group-hover:translate-x-0.5 shrink-0"
                    />
                  </Link>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Navigation: Tab / Click</span>
              <span>Close: Esc</span>
            </div>
          </div>
        </div>
      )}

      {/* Obsidian Mega Footer */}
      <ObsidianMegaFooter />
    </div>
  );
}

export default function IdeasDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-600 font-mono text-sm">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span>SYNCHRONIZING IDEA REGISTRY...</span>
          </div>
        </div>
      }
    >
      <IdeasDirectoryContent />
    </Suspense>
  );
}

