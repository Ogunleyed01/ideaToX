import seedIdeasRaw from "@/data/seed-ideas.json";
import { Idea, IdeaAuthor, FeatureRequest, IdeaBuild, IdeaComment, UserProfileData, CollaborationRequest } from "@/types/idea";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

export const MOCK_AUTHORS: IdeaAuthor[] = [
  {
    username: "adebayo_codes",
    full_name: "Adebayo Ogunlesi",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "Staff Distributed Systems Engineer. Passionate about offline-first architectures, edge telemetry, and open protocol design.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    location: "Lagos, Nigeria",
    joined_date: "February 2026",
    reputation_score: 1420,
    badges: ["Ideator", "Shipper", "Architect"],
  },
  {
    username: "sarah_systems",
    full_name: "Sarah Chen",
    avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    bio: "Compiler geek & local-first researcher. Architecting resilient distributed state engines and zero-trust sync protocols.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    website_url: "https://sarahchen.dev",
    location: "San Francisco, CA",
    joined_date: "January 2026",
    reputation_score: 2850,
    badges: ["Ideator", "Remixer", "Architect"],
  },
  {
    username: "maboroshi_io",
    full_name: "Kenji Sato",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "Systems tinkerer & hardware hacker. Specializing in embedded ESP32 mesh networks and low-latency WebSockets.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    discord_url: "kenji#1337",
    location: "Tokyo, Japan",
    joined_date: "November 2025",
    reputation_score: 3910,
    badges: ["Ideator", "Shipper", "Remixer"],
  },
  {
    username: "elena_arch",
    full_name: "Elena Rostova",
    avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    bio: "Platform engineer & open-source contributor. Focused on developer tooling, zero-config CLI ergonomics, and Nix derivations.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    location: "Berlin, Germany",
    joined_date: "March 2026",
    reputation_score: 980,
    badges: ["Ideator", "Remixer"],
  },
  {
    username: "you_builder",
    full_name: "You (Active Builder)",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Full-Stack builder & active IdeaToX contributor exploring high-leverage software architectures and production apps.",
    github_url: "https://github.com",
    twitter_url: "https://x.com",
    location: "Global",
    joined_date: "April 2026",
    reputation_score: 520,
    badges: ["Ideator", "Remixer", "Shipper"],
  },
];

// In-memory array initialized with seeded ideas
let memoryIdeas: Idea[] = (seedIdeasRaw as Idea[]).map((raw, idx) => {
  const author = MOCK_AUTHORS[idx % (MOCK_AUTHORS.length - 1)];
  const upvotes = ((idx * 37 + 19) % 280) + 24;
  const forks = ((idx * 7 + 3) % 45) + 2;
  const builds = (idx % 3) + 1;

  // Add realistic feature PRs
  const feature_requests: FeatureRequest[] = idx % 2 === 0 ? [
    {
      id: `pr-${idx}-1`,
      idea_id: raw.slug,
      proposer: MOCK_AUTHORS[(idx + 1) % MOCK_AUTHORS.length],
      action_type: "add_feature",
      feature_text: "WebAuthn / Passkey passwordless biometric authentication",
      rationale: "Reduces onboarding drop-off by 40% on mobile browsers and prevents credential stuffing.",
      status: "pending",
      created_at: "2 days ago",
    },
    {
      id: `pr-${idx}-2`,
      idea_id: raw.slug,
      proposer: MOCK_AUTHORS[(idx + 2) % MOCK_AUTHORS.length],
      action_type: "add_feature",
      feature_text: "Offline background sync with IndexedDB fallback cache",
      rationale: "Critical for users on intermittent 3G connections in emerging regions.",
      status: "approved",
      created_at: "5 days ago",
    }
  ] : [];

  // Add realistic Shipped Builds
  const buildsList: IdeaBuild[] = [
    {
      id: `build-${idx}-1`,
      idea_id: raw.slug,
      builder: MOCK_AUTHORS[(idx + 3) % MOCK_AUTHORS.length],
      status: idx % 3 === 0 ? "shipped" : "building",
      repo_url: `https://github.com/ideatox-community/${raw.slug}`,
      live_url: idx % 3 === 0 ? `https://${raw.slug}.preview.ideatox.space` : undefined,
      notes: "Alpha prototype functioning on Vercel Edge Runtime. Contributions welcome on GitHub!",
      created_at: "1 week ago",
    }
  ];

  // Add realistic threaded comments
  const rootCommentAuthor = MOCK_AUTHORS[(idx + 1) % MOCK_AUTHORS.length];
  const commentsList: IdeaComment[] = [
    {
      id: `c-${idx}-1`,
      idea_id: raw.slug,
      user: rootCommentAuthor,
      content: "Have you considered how conflict resolution would work if two nodes mutate state offline at the same time? A state-based CRDT or JSON patch log might provide stronger convergence guarantees than last-write-wins.",
      created_at: "3 days ago",
      parent_comment_id: null,
      likes_count: 7,
      user_liked: false,
    },
    {
      id: `c-${idx}-2`,
      idea_id: raw.slug,
      user: author,
      content: "Excellent call. We evaluated Yjs and Automerge; leaning towards Yjs since it compiles nicely to WebAssembly and works cleanly across browser workers without memory ballooning.",
      created_at: "2 days ago",
      parent_comment_id: `c-${idx}-1`,
      likes_count: 12,
      user_liked: true,
    },
    {
      id: `c-${idx}-3`,
      idea_id: raw.slug,
      user: MOCK_AUTHORS[(idx + 2) % MOCK_AUTHORS.length],
      content: "I started prototyping an MVP adapter for this spec over the weekend. Will link the repository once we get basic end-to-end integration tests passing!",
      created_at: "Yesterday",
      parent_comment_id: null,
      likes_count: 4,
      user_liked: false,
    },
  ];

  const collabList: CollaborationRequest[] = raw.collab_status === "seeking_cofounder" ? [
    {
      id: `collab-${idx}-1`,
      idea_id: raw.slug,
      applicant: MOCK_AUTHORS[(idx + 2) % MOCK_AUTHORS.length],
      role: "Backend & Systems Architect",
      contact_handle: "discord: arch_systems#4412",
      availability: "Part-Time Collaborator (15–20 hrs/wk)",
      pitch: "I've built similar edge telemetry systems in Go and Rust. Would love to own the distributed sync protocol and offline indexing.",
      status: "pending",
      created_at: "2 days ago",
    }
  ] : [];

  const teamList: IdeaAuthor[] = [
    author,
    ...(idx % 2 === 0 ? [MOCK_AUTHORS[(idx + 3) % MOCK_AUTHORS.length]] : []),
  ];

  return {
    ...raw,
    upvotes_count: upvotes,
    forks_count: forks,
    builds_count: builds,
    author,
    feature_requests,
    builds: buildsList,
    comments: commentsList,
    collaboration_requests: collabList,
    team_members: teamList,
    created_at: new Date(Date.now() - (idx + 1) * 86400000 * 3).toISOString(),
  };
});

export async function getAllIdeas(): Promise<Idea[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          *,
          author:profiles(*)
        `)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          ...d,
          mvp_features: Array.isArray(d.mvp_features) ? d.mvp_features : JSON.parse(d.mvp_features || "[]"),
          author: d.author || MOCK_AUTHORS[0],
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local memory:", err);
    }
  }
  return memoryIdeas;
}

export async function getIdeaBySlug(slug: string): Promise<Idea | null> {
  const normalized = decodeURIComponent(slug).toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ideas")
        .select(`
          *,
          author:profiles(*),
          feature_requests(*, proposer:profiles(*)),
          idea_builds(*, builder:profiles(*)),
          comments(*, user:profiles(*))
        `)
        .eq("slug", normalized)
        .maybeSingle();

      if (!error && data) {
        const row = data as any;
        return {
          ...row,
          mvp_features: Array.isArray(row.mvp_features) ? row.mvp_features : JSON.parse(row.mvp_features || "[]"),
          author: row.author || MOCK_AUTHORS[0],
          feature_requests: (row.feature_requests || []).map((pr: any) => ({
            ...pr,
            proposer: pr.proposer || MOCK_AUTHORS[0],
          })),
          builds: (row.idea_builds || []).map((b: any) => ({
            ...b,
            builder: b.builder || MOCK_AUTHORS[0],
          })),
          comments: (row.comments || []).map((c: any) => ({
            ...c,
            user: c.user || MOCK_AUTHORS[0],
          })),
          collaboration_requests: row.collaboration_requests || [],
          team_members: row.team_members || [],
        };
      }
    } catch (err) {
      console.warn("Supabase getIdeaBySlug failed, falling back to local memory:", err);
    }
  }

  const found = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  return found || null;
}

export async function getRelatedIdeas(currentSlug: string, category: string, limit = 3): Promise<Idea[]> {
  return memoryIdeas
    .filter((i) => i.slug !== currentSlug && i.category === category)
    .slice(0, limit);
}

export function saveNewIdea(newIdea: Idea): Idea {
  // If this idea has a parent, increment the parent's forks_count
  if (newIdea.parent_slug) {
    const parent = memoryIdeas.find(
      (i) => i.slug.toLowerCase() === newIdea.parent_slug?.toLowerCase()
    );
    if (parent) {
      parent.forks_count = (parent.forks_count || 0) + 1;
    }
  }

  memoryIdeas = [newIdea, ...memoryIdeas];

  // If Supabase is configured, sync to Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const authorId = data?.user?.id || null;
        supabase.from("ideas").insert({
          title: newIdea.title,
          slug: newIdea.slug,
          author_id: authorId,
          hook: newIdea.hook,
          problem_statement: newIdea.problem_statement,
          mvp_features: newIdea.mvp_features,
          category: newIdea.category,
          difficulty: newIdea.difficulty,
          target_region: newIdea.target_region,
          collab_status: newIdea.collab_status,
          suggested_stack: newIdea.suggested_stack,
          parent_slug: newIdea.parent_slug,
          is_seeded: false,
        } as any).then(({ error }) => {
          if (error) console.warn("Supabase insert idea error:", error.message);
        });
      });
    } catch {
      // ignore
    }
  }

  return newIdea;
}

// -------------------------------------------------------------
// MILESTONE 4: UPVOTES & STARS (Optimistic UI & Persistence)
// -------------------------------------------------------------
const STORAGE_KEY_UPVOTES = "ideatox_user_upvotes";
let memoryUserUpvotes = new Set<string>();

export function getUserStars(): string[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_UPVOTES);
      if (stored) {
        const arr = JSON.parse(stored);
        arr.forEach((slug: string) => memoryUserUpvotes.add(slug));
        return arr;
      }
    } catch {
      // ignore
    }
  }
  return Array.from(memoryUserUpvotes);
}

export function hasUserUpvoted(slug: string): boolean {
  if (typeof window !== "undefined") {
    const stars = getUserStars();
    return stars.includes(slug.toLowerCase());
  }
  return memoryUserUpvotes.has(slug.toLowerCase());
}

export async function getStarredIdeas(): Promise<Idea[]> {
  const starredSlugs = getUserStars();
  if (starredSlugs.length === 0) return [];
  const all = await getAllIdeas();
  return all.filter((i) => starredSlugs.includes(i.slug.toLowerCase()));
}

export async function toggleUpvote(
  slug: string
): Promise<{ starred: boolean; upvotes_count: number }> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  const currentCount = idea?.upvotes_count ?? 42;
  const isCurrentlyStarred = hasUserUpvoted(normalized);

  const newStarred = !isCurrentlyStarred;
  const newCount = newStarred ? currentCount + 1 : Math.max(0, currentCount - 1);

  if (idea) {
    idea.upvotes_count = newCount;
  }

  if (newStarred) {
    memoryUserUpvotes.add(normalized);
  } else {
    memoryUserUpvotes.delete(normalized);
  }

  if (typeof window !== "undefined") {
    try {
      const arr = Array.from(memoryUserUpvotes);
      localStorage.setItem(STORAGE_KEY_UPVOTES, JSON.stringify(arr));
    } catch {
      // ignore
    }
  }

  if (isSupabaseConfigured() && idea?.id) {
    try {
      const supabase = createClient();
      (supabase as any).from("ideas").update({ upvotes_count: newCount }).eq("id", idea.id).then(({ error }: any) => {
        if (error) console.warn("Supabase upvotes_count update error:", error.message);
      });
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.id && idea?.id) {
          if (newStarred) {
            (supabase as any).from("idea_upvotes").insert({ user_id: data.user.id, idea_id: idea.id }).then(() => {});
          } else {
            (supabase as any).from("idea_upvotes").delete().match({ user_id: data.user.id, idea_id: idea.id }).then(() => {});
          }
        }
      });
    } catch {
      // ignore
    }
  }

  return {
    starred: newStarred,
    upvotes_count: newCount,
  };
}

// -------------------------------------------------------------
// MILESTONE 4: FEATURE PULL REQUESTS (Propose & Owner Merge)
// -------------------------------------------------------------
export async function addFeatureRequest(
  slug: string,
  req: {
    action_type: "add_feature" | "remove_feature";
    feature_text: string;
    rationale?: string;
    proposer?: IdeaAuthor;
  }
): Promise<FeatureRequest | null> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return null;

  const newPR: FeatureRequest = {
    id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    proposer: req.proposer || {
      username: "you_builder",
      full_name: "Current Contributor",
      reputation_score: 110,
    },
    action_type: req.action_type,
    feature_text: req.feature_text.trim(),
    rationale: req.rationale?.trim() || "Proposed to improve MVP architectural scope.",
    status: "pending",
    created_at: "Just now",
  };

  idea.feature_requests = [newPR, ...(idea.feature_requests || [])];

  if (isSupabaseConfigured() && idea?.id) {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const userId = data?.user?.id;
        if (userId && idea?.id) {
          (supabase as any).from("feature_requests").insert({
            idea_id: idea.id,
            proposer_id: userId,
            action_type: req.action_type,
            feature_text: req.feature_text.trim(),
            rationale: req.rationale?.trim() || null,
            status: "pending",
          }).then(({ error }: any) => {
            if (error) console.warn("Supabase insert PR error:", error.message);
          });
        }
      });
    } catch {
      // ignore
    }
  }

  return newPR;
}

export async function reviewFeatureRequest(
  slug: string,
  prId: string,
  decision: "approved" | "rejected"
): Promise<{ success: boolean; idea: Idea | null; message: string }> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return { success: false, idea: null, message: "Idea blueprint not found" };

  const pr = idea.feature_requests?.find((p) => p.id === prId);
  if (!pr) return { success: false, idea, message: "Pull request not found" };

  pr.status = decision;

  if (decision === "approved") {
    if (pr.action_type === "add_feature") {
      // Check if already in mvp_features
      if (!idea.mvp_features.includes(pr.feature_text)) {
        idea.mvp_features = [...idea.mvp_features, pr.feature_text];
      }
    } else if (pr.action_type === "remove_feature") {
      // Remove feature from mvp_features
      idea.mvp_features = idea.mvp_features.filter(
        (f) => f.toLowerCase().trim() !== pr.feature_text.toLowerCase().trim()
      );
    }
  }

  if (isSupabaseConfigured() && idea?.id) {
    try {
      const supabase = createClient();
      if (/^[0-9a-fA-F-]{36}$/.test(prId)) {
        (supabase as any).from("feature_requests").update({ status: decision }).eq("id", prId).then(() => {});
      }
      if (decision === "approved") {
        (supabase as any).from("ideas").update({ mvp_features: idea.mvp_features }).eq("id", idea.id).then(() => {});
      }
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    idea: { ...idea },
    message:
      decision === "approved"
        ? `Merged PR: ${pr.feature_text} ${pr.action_type === "add_feature" ? "added to" : "removed from"} MVP specifications.`
        : `Declined PR: ${pr.feature_text}.`,
  };
}

// -------------------------------------------------------------
// MILESTONE 4: SHIPPED BUILDS & DEMO SHOWCASE
// -------------------------------------------------------------
export async function addIdeaBuild(
  slug: string,
  buildData: {
    repo_url: string;
    live_url?: string;
    notes?: string;
    builder?: IdeaAuthor;
    status?: "building" | "shipped";
  }
): Promise<{ success: boolean; build: IdeaBuild | null; builds_count: number }> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return { success: false, build: null, builds_count: 0 };

  const newBuild: IdeaBuild = {
    id: `build-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    builder: buildData.builder || {
      username: "you_builder",
      full_name: "Community Builder",
      reputation_score: 130,
    },
    status: buildData.status || (buildData.live_url ? "shipped" : "building"),
    repo_url: buildData.repo_url.trim(),
    live_url: buildData.live_url?.trim() || undefined,
    notes: buildData.notes?.trim() || "Active implementation linked via IdeaToX Showcase.",
    created_at: "Just now",
  };

  idea.builds = [newBuild, ...(idea.builds || [])];
  idea.builds_count = (idea.builds_count || 0) + 1;

  if (isSupabaseConfigured() && idea?.id) {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        const userId = data?.user?.id;
        if (userId && idea?.id) {
          (supabase as any).from("idea_builds").insert({
            idea_id: idea.id,
            builder_id: userId,
            status: newBuild.status,
            repo_url: newBuild.repo_url,
            live_url: newBuild.live_url || null,
            notes: newBuild.notes || null,
          }).then(({ error }: any) => {
            if (error) console.warn("Supabase insert build error:", error.message);
          });
        }
      });
      (supabase as any).from("ideas").update({ builds_count: idea.builds_count }).eq("id", idea.id).then(() => {});
    } catch {
      // ignore
    }
  }

  return {
    success: true,
    build: newBuild,
    builds_count: idea.builds_count,
  };
}

export async function updateIdeaBuildStatus(
  slug: string,
  buildId: string,
  newStatus: "building" | "shipped",
  liveUrl?: string
): Promise<boolean> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return false;

  const build = idea.builds?.find((b) => b.id === buildId);
  if (!build) return false;

  build.status = newStatus;
  if (liveUrl) build.live_url = liveUrl.trim();
  return true;
}

// -------------------------------------------------------------
// MILESTONE 4: FORK LINEAGE GRAPH & QUICK FORK
// -------------------------------------------------------------
export interface LineageNode {
  slug: string;
  title: string;
  category: string;
  author: IdeaAuthor;
  stars: number;
  forks: number;
  isCurrent: boolean;
  isParent: boolean;
  version: string;
}

export interface IdeaLineage {
  parent: LineageNode | null;
  current: LineageNode;
  children: LineageNode[];
}

export async function getIdeaLineage(slug: string): Promise<IdeaLineage | null> {
  const normalized = slug.toLowerCase();
  const currentIdea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!currentIdea) return null;

  let parentNode: LineageNode | null = null;
  if (currentIdea.parent_slug) {
    const parentIdea = memoryIdeas.find(
      (i) => i.slug.toLowerCase() === currentIdea.parent_slug?.toLowerCase()
    );
    if (parentIdea) {
      parentNode = {
        slug: parentIdea.slug,
        title: parentIdea.title,
        category: parentIdea.category,
        author: parentIdea.author || MOCK_AUTHORS[0],
        stars: parentIdea.upvotes_count ?? 50,
        forks: parentIdea.forks_count ?? 12,
        isCurrent: false,
        isParent: true,
        version: "v1.0-root",
      };
    }
  }

  // Find all ideas that have this idea as parent_slug
  const childIdeas = memoryIdeas.filter(
    (i) => i.parent_slug?.toLowerCase() === normalized
  );

  const childrenNodes: LineageNode[] = childIdeas.map((child, idx) => ({
    slug: child.slug,
    title: child.title,
    category: child.category,
    author: child.author || MOCK_AUTHORS[(idx + 1) % MOCK_AUTHORS.length],
    stars: child.upvotes_count ?? 15,
    forks: child.forks_count ?? 2,
    isCurrent: false,
    isParent: false,
    version: `v1.${idx + 1}-fork`,
  }));

  // If no real children yet, synthesize an active downstream branch for demonstration
  if (childrenNodes.length === 0) {
    childrenNodes.push({
      slug: `${currentIdea.slug}-mobile-offline`,
      title: `${currentIdea.title} (Local-First Offline Remix)`,
      category: currentIdea.category,
      author: MOCK_AUTHORS[2],
      stars: 34,
      forks: 5,
      isCurrent: false,
      isParent: false,
      version: "v1.1-p2p",
    });
  }

  const currentNode: LineageNode = {
    slug: currentIdea.slug,
    title: currentIdea.title,
    category: currentIdea.category,
    author: currentIdea.author || MOCK_AUTHORS[0],
    stars: currentIdea.upvotes_count ?? 42,
    forks: currentIdea.forks_count ?? 6,
    isCurrent: true,
    isParent: false,
    version: "HEAD (active)",
  };

  return {
    parent: parentNode,
    current: currentNode,
    children: childrenNodes,
  };
}

export async function createQuickFork(
  parentSlug: string,
  pivotData: {
    remixedTitle: string;
    pivotNotes: string;
    targetRegion?: string;
  }
): Promise<Idea | null> {
  const parent = await getIdeaBySlug(parentSlug);
  if (!parent) return null;

  const generatedSlug =
    pivotData.remixedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) + `-${Math.random().toString(36).substring(2, 6)}`;

  const forkedIdea: Idea = {
    ...parent,
    slug: generatedSlug,
    title: pivotData.remixedTitle.trim(),
    hook: `[Fork of @${parent.slug}] ${parent.hook} ${pivotData.pivotNotes ? `— Pivot: ${pivotData.pivotNotes}` : ""}`,
    target_region: pivotData.targetRegion || parent.target_region,
    parent_slug: parent.slug,
    parent_idea_id: parent.id || parent.slug,
    upvotes_count: 1,
    forks_count: 0,
    builds_count: 0,
    is_seeded: false,
    created_at: new Date().toISOString(),
    author: {
      username: "you_builder",
      full_name: "You (Fork Author)",
      avatar_url: undefined,
      reputation_score: 160,
    },
    feature_requests: [],
    builds: [],
  };

  saveNewIdea(forkedIdea);
  return forkedIdea;
}

// -------------------------------------------------------------
// MILESTONE 6: THREADED COMMENTS & ARCHITECTURAL DISCUSSIONS
// -------------------------------------------------------------
export async function getIdeaComments(slug: string): Promise<IdeaComment[]> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  return idea?.comments || [];
}

export async function addIdeaComment(
  slug: string,
  content: string,
  parentCommentId?: string | null,
  user?: IdeaAuthor
): Promise<IdeaComment | null> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return null;

  const newComment: IdeaComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    user: user || MOCK_AUTHORS.find((a) => a.username === "you_builder") || {
      username: "you_builder",
      full_name: "You (Active Builder)",
      reputation_score: 520,
      badges: ["Ideator", "Remixer", "Shipper"],
    },
    content: content.trim(),
    created_at: "Just now",
    parent_comment_id: parentCommentId || null,
    likes_count: 0,
    user_liked: false,
  };

  idea.comments = [...(idea.comments || []), newComment];

  if (isSupabaseConfigured() && idea.id) {
    try {
      const supabase = createClient();
      supabase.from("comments").insert({
        idea_id: idea.id,
        user_id: newComment.user.username,
        content: newComment.content,
        parent_comment_id: parentCommentId || null,
        likes_count: 0,
      } as any).then(({ error }) => {
        if (error) console.warn("Supabase insert comment error:", error.message);
      });
    } catch {
      // ignore
    }
  }

  return newComment;
}

export async function toggleCommentLike(
  slug: string,
  commentId: string
): Promise<{ liked: boolean; count: number }> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return { liked: false, count: 0 };

  const comment = idea.comments?.find((c) => c.id === commentId);
  if (!comment) return { liked: false, count: 0 };

  const currentLiked = Boolean(comment.user_liked);
  const newLiked = !currentLiked;
  const currentCount = comment.likes_count ?? 0;
  const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

  comment.user_liked = newLiked;
  comment.likes_count = newCount;

  return { liked: newLiked, count: newCount };
}

// -------------------------------------------------------------
// USER PROFILE & REPUTATION SYSTEM
// -------------------------------------------------------------
export async function getAllAuthors(): Promise<IdeaAuthor[]> {
  return MOCK_AUTHORS;
}

export async function getUserProfile(username: string): Promise<UserProfileData | null> {
  const cleanUsername = decodeURIComponent(username).toLowerCase().replace(/^@/, "").trim();

  // If Supabase is configured, check for live profile in Supabase
  let dbAuthor: IdeaAuthor | null = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("username", cleanUsername)
        .maybeSingle();

      const profileData = data as any;
      if (profileData) {
        dbAuthor = {
          username: profileData.username,
          full_name: profileData.full_name || profileData.username,
          avatar_url: profileData.avatar_url || undefined,
          bio: profileData.bio || undefined,
          github_url: profileData.github_url || undefined,
          twitter_url: profileData.twitter_url || undefined,
          website_url: profileData.website_url || undefined,
          location: profileData.location || "Global",
          joined_date: profileData.created_at
            ? new Date(profileData.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
            : "Recent Builder",
          reputation_score: profileData.reputation_score || 300,
          badges: profileData.badges || ["Ideator"],
        };
      }
    } catch {
      // ignore
    }
  }

  // Find author in dbAuthor, MOCK_AUTHORS or synthesized
  let author = dbAuthor || MOCK_AUTHORS.find(
    (a) => a.username.toLowerCase() === cleanUsername
  );

  if (!author) {
    // Check if any idea was created by this author
    const ideaByAuthor = memoryIdeas.find(
      (i) => i.author?.username.toLowerCase() === cleanUsername
    );
    if (ideaByAuthor && ideaByAuthor.author) {
      author = ideaByAuthor.author;
    } else {
      // Dynamic profile fallback
      author = {
        username: cleanUsername,
        full_name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1).replace(/_/g, " "),
        bio: `Software architect and open-source contributor on IdeaToX exploring real-world blueprints.`,
        reputation_score: 420,
        badges: ["Ideator"],
        joined_date: "Recent Builder",
        location: "Global",
      };
    }
  }

  // Filter ideas authored by this user
  const authoredIdeas = memoryIdeas.filter(
    (i) => i.author?.username.toLowerCase() === cleanUsername
  );

  const originalSpecs = authoredIdeas.filter((i) => !i.parent_slug);
  const forks = authoredIdeas.filter((i) => Boolean(i.parent_slug));

  // Collect builds across all ideas by this user
  const userBuilds: IdeaBuild[] = [];
  memoryIdeas.forEach((i) => {
    (i.builds || []).forEach((b) => {
      if (b.builder?.username.toLowerCase() === cleanUsername) {
        userBuilds.push(b);
      }
    });
  });

  // Collect PRs across all ideas submitted by this user
  const userPRs: FeatureRequest[] = [];
  memoryIdeas.forEach((i) => {
    (i.feature_requests || []).forEach((pr) => {
      if (pr.proposer?.username.toLowerCase() === cleanUsername) {
        userPRs.push(pr);
      }
    });
  });

  const totalSpecs = originalSpecs.length;
  const totalForks = forks.length;
  const totalBuilds = userBuilds.length;
  const totalStars = authoredIdeas.reduce((acc, i) => acc + (i.upvotes_count || 0), 0);

  const reputation = (author.reputation_score || 300) + (totalStars * 8) + (totalBuilds * 40) + (totalForks * 20);

  let rankTitle = "Apprentice Builder";
  if (reputation >= 3000) rankTitle = "Principal Systems Architect";
  else if (reputation >= 1800) rankTitle = "Staff Specification Lead";
  else if (reputation >= 800) rankTitle = "Senior Full-Stack Builder";
  else if (reputation >= 300) rankTitle = "Ecosystem Contributor";

  // Dynamic Badges
  const badgesSet = new Set<string>(author.badges || []);
  if (totalSpecs > 0) badgesSet.add("Ideator");
  if (totalForks > 0) badgesSet.add("Remixer");
  if (totalBuilds > 0) badgesSet.add("Shipper");
  if (userPRs.some((pr) => pr.status === "approved")) badgesSet.add("Architect");

  const starredSlugs = getUserStars();
  const userStarred = memoryIdeas.filter((i) =>
    starredSlugs.includes(i.slug.toLowerCase())
  );

  return {
    author: {
      ...author,
      badges: Array.from(badgesSet),
      reputation_score: reputation,
    },
    specs: originalSpecs,
    forks,
    builds: userBuilds,
    prs: userPRs,
    starred: userStarred,
    stats: {
      totalSpecs,
      totalForks,
      totalBuilds,
      totalStars,
      reputation,
      rankTitle,
    },
  };
}

// -------------------------------------------------------------
// MILESTONE 9: BUILDER COLLABORATION & TEAM FORMATION
// -------------------------------------------------------------
export async function addCollaborationRequest(
  slug: string,
  req: {
    role: string;
    contact_handle: string;
    availability: string;
    pitch: string;
    applicant?: IdeaAuthor;
  }
): Promise<CollaborationRequest | null> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return null;

  const newCollab: CollaborationRequest = {
    id: `collab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    applicant: req.applicant || {
      username: "you_builder",
      full_name: "Interested Collaborator",
      reputation_score: 180,
    },
    role: req.role,
    contact_handle: req.contact_handle,
    availability: req.availability,
    pitch: req.pitch.trim(),
    status: "pending",
    created_at: "Just now",
  };

  idea.collaboration_requests = [newCollab, ...(idea.collaboration_requests || [])];
  return newCollab;
}

export async function reviewCollaborationRequest(
  slug: string,
  requestId: string,
  decision: "accepted" | "declined"
): Promise<{ success: boolean; idea: Idea | null; message: string }> {
  const normalized = slug.toLowerCase();
  const idea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  if (!idea) return { success: false, idea: null, message: "Idea blueprint not found" };

  const req = idea.collaboration_requests?.find((r) => r.id === requestId);
  if (!req) return { success: false, idea, message: "Collaboration request not found" };

  req.status = decision;

  if (decision === "accepted") {
    const existing = idea.team_members || [];
    if (!existing.some((m) => m.username === req.applicant.username)) {
      idea.team_members = [...existing, req.applicant];
    }
  }

  return {
    success: true,
    idea: { ...idea },
    message:
      decision === "accepted"
        ? `Accepted @${req.applicant.username} as ${req.role} on the project team!`
        : `Declined collaboration pitch from @${req.applicant.username}.`,
  };
}
