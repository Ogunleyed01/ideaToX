import seedIdeasRaw from "@/data/seed-ideas.json";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow } from "@/types/database";
import {
  Idea,
  IdeaAuthor,
  FeatureRequest,
  IdeaBuild,
  IdeaComment,
  UserProfileData,
  CollaborationRequest,
  IdeaNotification,
  NotificationType,
  IdeaDetailTab,
  CuratedCollection,
  CuratedCollectionId,
} from "@/types/idea";
import {
  isSupabaseConfigured,
  createClient,
  getCurrentProfile,
  ensureProfileExists,
  sanitizeUsernameHandle,
} from "@/lib/supabase/client";

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
    headline: "Full-Stack Product & Systems Architect",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    bio: "Full-Stack builder & active IdeaToX contributor exploring high-leverage software architectures and production apps.",
    email: "builder@ideatox.dev",
    availability: "Open to Co-Founding",
    preferred_stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS", "Rust"],
    github_url: "https://github.com/you-builder",
    twitter_url: "https://x.com/you_builder",
    discord_url: "you_builder#0402",
    website_url: "https://ideatox.dev",
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value?: string | null): value is string {
  return Boolean(value && UUID_REGEX.test(value));
}

let activeSessionUser: User | null = null;
let activeSessionProfile: ProfileRow | null = null;

export function profileRowToAuthor(row: ProfileRow): IdeaAuthor {
  return {
    id: row.id,
    username: row.username,
    full_name: row.full_name || row.username,
    headline: row.headline || undefined,
    availability: row.availability || undefined,
    preferred_stack: row.preferred_stack || undefined,
    avatar_url: row.avatar_url || undefined,
    bio: row.bio || undefined,
    email: row.contact_email || undefined,
    github_url: row.github_url || undefined,
    twitter_url: row.twitter_url || undefined,
    discord_url: row.discord_url || undefined,
    website_url: row.website_url || undefined,
    location: row.location || "Global",
    joined_date: row.created_at
      ? new Date(row.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Recent Builder",
    reputation_score: row.reputation_score ?? 300,
    badges: row.badges?.length ? row.badges : ["Ideator"],
  };
}

export function setActiveAuthSession(
  user: User | null,
  profile: ProfileRow | null
): void {
  activeSessionUser = user;
  activeSessionProfile = profile;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ideatox:profile-updated"));
  }
}

export async function resolveAuthenticatedActor(): Promise<{
  user: User;
  profile: ProfileRow | null;
  author: IdeaAuthor;
} | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    let profile = activeSessionProfile?.id === user.id ? activeSessionProfile : null;
    if (!profile) {
      profile = await ensureProfileExists(user);
      activeSessionUser = user;
      activeSessionProfile = profile;
    }

    if (profile) {
      return {
        user,
        profile,
        author: profileRowToAuthor(profile),
      };
    }

    const fallbackHandle = sanitizeUsernameHandle(
      (user.email ? user.email.split("@")[0] : "") || `builder_${user.id.slice(0, 4)}`
    );
    return {
      user,
      profile: null,
      author: {
        id: user.id,
        username: fallbackHandle,
        full_name: fallbackHandle,
        reputation_score: 300,
        badges: ["Ideator"],
      },
    };
  } catch {
    return null;
  }
}

function upsertMemoryIdea(idea: Idea): void {
  const idx = memoryIdeas.findIndex(
    (m) => m.slug.toLowerCase() === idea.slug.toLowerCase()
  );
  if (idx !== -1) {
    const existing = memoryIdeas[idx];
    memoryIdeas[idx] = {
      ...existing,
      ...idea,
      author: idea.author || existing.author,
      feature_requests: idea.feature_requests?.length
        ? idea.feature_requests
        : existing.feature_requests,
      builds: idea.builds?.length ? idea.builds : existing.builds,
      comments: idea.comments?.length ? idea.comments : existing.comments,
      collaboration_requests: idea.collaboration_requests?.length
        ? idea.collaboration_requests
        : existing.collaboration_requests,
    };
  } else {
    memoryIdeas = [idea, ...memoryIdeas];
  }
}

function formatSupabaseIdeaRow(row: Record<string, unknown>): Idea {
  const rawFeatures = row.mvp_features;
  const parsedFeatures = Array.isArray(rawFeatures)
    ? rawFeatures.map(String)
    : typeof rawFeatures === "string"
      ? (JSON.parse(rawFeatures || "[]") as string[])
      : [];

  const authorRow = row.author as ProfileRow | null | undefined;
  const author: IdeaAuthor = authorRow
    ? profileRowToAuthor(authorRow)
    : MOCK_AUTHORS[0];

  const featureRequestsRaw = (row.feature_requests || []) as Array<Record<string, unknown>>;
  const buildsRaw = (row.idea_builds || []) as Array<Record<string, unknown>>;
  const commentsRaw = (row.comments || []) as Array<Record<string, unknown>>;
  const collabRaw = (row.collaboration_requests || []) as Array<Record<string, unknown>>;

  const mappedCollabs: CollaborationRequest[] = collabRaw.map((cr) => {
    const appRow = cr.applicant as ProfileRow | null | undefined;
    return {
      id: String(cr.id),
      idea_id: String(cr.idea_id),
      applicant: appRow ? profileRowToAuthor(appRow) : MOCK_AUTHORS[0],
      role: String(cr.role || "Collaborator"),
      contact_handle: String(cr.contact_handle || ""),
      availability: String(cr.availability || "Flexible"),
      pitch: String(cr.pitch || ""),
      status: (cr.status as CollaborationRequest["status"]) || "pending",
      created_at: String(cr.created_at || "Recent"),
    };
  });

  const acceptedTeamMembers = mappedCollabs
    .filter((c) => c.status === "accepted")
    .map((c) => c.applicant);

  return {
    id: String(row.id),
    author_id: (row.author_id as string | null) ?? authorRow?.id ?? null,
    parent_idea_id: (row.parent_idea_id as string | null) ?? null,
    parent_slug: (row.parent_slug as string | null) ?? null,
    title: String(row.title),
    slug: String(row.slug),
    hook: String(row.hook),
    problem_statement: String(row.problem_statement),
    mvp_features: parsedFeatures,
    category: row.category as Idea["category"],
    difficulty: row.difficulty as Idea["difficulty"],
    target_region: String(row.target_region || "Global"),
    collab_status: (row.collab_status as Idea["collab_status"]) || "open",
    suggested_stack: Array.isArray(row.suggested_stack)
      ? (row.suggested_stack as string[])
      : [],
    upvotes_count: Number(row.upvotes_count ?? 0),
    forks_count: Number(row.forks_count ?? 0),
    builds_count: Number(row.builds_count ?? 0),
    is_seeded: Boolean(row.is_seeded),
    created_at: String(row.created_at || new Date().toISOString()),
    author,
    feature_requests: featureRequestsRaw.map((pr) => ({
      id: String(pr.id),
      idea_id: String(pr.idea_id),
      proposer: pr.proposer
        ? profileRowToAuthor(pr.proposer as ProfileRow)
        : MOCK_AUTHORS[0],
      action_type: pr.action_type as FeatureRequest["action_type"],
      feature_text: String(pr.feature_text),
      rationale: (pr.rationale as string | undefined) || undefined,
      status: (pr.status as FeatureRequest["status"]) || "pending",
      created_at: String(pr.created_at || "Recent"),
    })),
    builds: buildsRaw.map((b) => ({
      id: String(b.id),
      idea_id: String(b.idea_id),
      builder: b.builder
        ? profileRowToAuthor(b.builder as ProfileRow)
        : MOCK_AUTHORS[0],
      status: (b.status as IdeaBuild["status"]) || "building",
      repo_url: String(b.repo_url),
      live_url: (b.live_url as string | undefined) || undefined,
      notes: (b.notes as string | undefined) || undefined,
      created_at: String(b.created_at || "Recent"),
    })),
    comments: commentsRaw.map((c) => ({
      id: String(c.id),
      idea_id: String(c.idea_id),
      user: c.user
        ? profileRowToAuthor(c.user as ProfileRow)
        : MOCK_AUTHORS[0],
      content: String(c.content),
      parent_comment_id: (c.parent_comment_id as string | null) ?? null,
      likes_count: Number(c.likes_count ?? 0),
      created_at: String(c.created_at || "Recent"),
    })),
    collaboration_requests: mappedCollabs,
    team_members: acceptedTeamMembers,
  };
}

export async function getAllIdeas(): Promise<Idea[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ideas")
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted = (data as unknown as Array<Record<string, unknown>>).map(
          formatSupabaseIdeaRow
        );
        formatted.forEach(upsertMemoryIdea);
        return formatted;
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
      // Attempt query with v2 collaboration_requests join first; fall back seamlessly if v2 SQL migration hasn't run yet
      let { data, error } = await supabase
        .from("ideas")
        .select(
          `
          *,
          author:profiles(*),
          feature_requests(*, proposer:profiles(*)),
          idea_builds(*, builder:profiles(*)),
          comments(*, user:profiles(*)),
          collaboration_requests(*, applicant:profiles(*))
        `
        )
        .eq("slug", normalized)
        .maybeSingle();

      if (error && /collaboration_requests/i.test(error.message)) {
        const coreRes = await supabase
          .from("ideas")
          .select(
            `
            *,
            author:profiles(*),
            feature_requests(*, proposer:profiles(*)),
            idea_builds(*, builder:profiles(*)),
            comments(*, user:profiles(*))
          `
          )
          .eq("slug", normalized)
          .maybeSingle();
        data = coreRes.data as typeof data;
        error = coreRes.error;
      }

      if (!error && data) {
        const formatted = formatSupabaseIdeaRow(
          data as unknown as Record<string, unknown>
        );
        upsertMemoryIdea(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn("Supabase getIdeaBySlug failed, falling back to local memory:", err);
    }
  }

  const found = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);
  return found || null;
}

export async function getRelatedIdeas(
  arg1: string,
  arg2: string,
  limit = 3
): Promise<Idea[]> {
  const validCategories = new Set(["web", "mobile", "ai", "cli", "hardware", "extension"]);
  const category = validCategories.has(arg1) ? arg1 : arg2;
  const currentSlug = validCategories.has(arg1) ? arg2 : arg1;
  return memoryIdeas
    .filter((i) => i.slug !== currentSlug && i.category === category)
    .slice(0, limit);
}

export async function saveNewIdeaAsync(
  newIdea: Idea
): Promise<{ idea: Idea | null; error?: string }> {
  const configured = isSupabaseConfigured();

  if (configured) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      return {
        idea: null,
        error: "Sign in to publish or fork a specification blueprint.",
      };
    }

    const supabase = createClient();

    // Resolve parent_idea_id UUID if forked from parent_slug
    let parentUuid: string | null = isUuid(newIdea.parent_idea_id)
      ? newIdea.parent_idea_id
      : null;

    if (!parentUuid && newIdea.parent_slug) {
      const { data: parentRow } = await supabase
        .from("ideas")
        .select("id")
        .eq("slug", newIdea.parent_slug.toLowerCase())
        .maybeSingle();
      if (parentRow?.id) {
        parentUuid = parentRow.id;
      }
    }

    const { data: insertedRow, error } = await supabase
      .from("ideas")
      .insert({
        title: newIdea.title,
        slug: newIdea.slug,
        author_id: actor.user.id,
        parent_idea_id: parentUuid,
        parent_slug: newIdea.parent_slug || null,
        hook: newIdea.hook,
        problem_statement: newIdea.problem_statement,
        mvp_features: newIdea.mvp_features,
        category: newIdea.category,
        difficulty: newIdea.difficulty,
        target_region: newIdea.target_region,
        collab_status: newIdea.collab_status,
        suggested_stack: newIdea.suggested_stack,
        is_seeded: false,
      })
      .select("*, author:profiles(*)")
      .maybeSingle();

    if (error || !insertedRow) {
      return {
        idea: null,
        error: error?.message || "Failed to persist specification to Supabase.",
      };
    }

    const formatted = formatSupabaseIdeaRow(
      insertedRow as unknown as Record<string, unknown>
    );
    upsertMemoryIdea(formatted);

    if (parentUuid && newIdea.parent_slug) {
      const parentMem = memoryIdeas.find(
        (i) => i.slug.toLowerCase() === newIdea.parent_slug?.toLowerCase()
      );
      if (parentMem) {
        parentMem.forks_count = (parentMem.forks_count || 0) + 1;
      }
      addNotification({
        type: "fork",
        title: `Forked "${formatted.title}"`,
        message: `Published a new remix branch from @${formatted.parent_slug}.`,
        idea_slug: formatted.slug,
        idea_title: formatted.title,
        actor: formatted.author,
        target_tab: "lineage",
      });
    }

    return { idea: formatted };
  }

  // Offline unconfigured sandbox fallback
  if (newIdea.parent_slug) {
    const parent = memoryIdeas.find(
      (i) => i.slug.toLowerCase() === newIdea.parent_slug?.toLowerCase()
    );
    if (parent) {
      parent.forks_count = (parent.forks_count || 0) + 1;
    }
  }

  const enrichedIdea: Idea = {
    ...newIdea,
    author: newIdea.author || getCurrentActorAuthor(),
  };

  memoryIdeas = [enrichedIdea, ...memoryIdeas];

  if (enrichedIdea.parent_slug) {
    addNotification({
      type: "fork",
      title: `Forked "${enrichedIdea.title}"`,
      message: `Published a new remix branch from @${enrichedIdea.parent_slug}.`,
      idea_slug: enrichedIdea.slug,
      idea_title: enrichedIdea.title,
      actor: enrichedIdea.author,
      target_tab: "lineage",
    });
  }

  return { idea: enrichedIdea };
}

export function saveNewIdea(newIdea: Idea): Idea {
  void saveNewIdeaAsync(newIdea);
  return newIdea;
}

// -------------------------------------------------------------
// MILESTONE 4: UPVOTES & STARS (Optimistic UI & Persistence)
// -------------------------------------------------------------
const STORAGE_KEY_UPVOTES = "ideatox_user_upvotes";
const EVENT_UPVOTES_UPDATED = "ideatox-upvotes-updated";
const memoryUserUpvotes = new Set<string>();

export function subscribeUpvotes(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_UPVOTES_UPDATED, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_UPVOTES_UPDATED, handler);
    window.removeEventListener("storage", handler);
  };
}

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
  const idea =
    memoryIdeas.find((i) => i.slug.toLowerCase() === normalized) ||
    (await getIdeaBySlug(normalized));

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      throw new Error("Sign in to star blueprints.");
    }

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
        window.dispatchEvent(new CustomEvent(EVENT_UPVOTES_UPDATED));
      } catch {
        // ignore storage quota errors
      }
    }

    if (idea && isUuid(idea.id)) {
      const supabase = createClient();
      if (newStarred) {
        const { error } = await supabase
          .from("idea_upvotes")
          .upsert(
            { user_id: actor.user.id, idea_id: idea.id },
            { onConflict: "user_id,idea_id" }
          );
        if (error) {
          console.warn("Supabase upvote insert error:", error.message);
        }
      } else {
        const { error } = await supabase
          .from("idea_upvotes")
          .delete()
          .match({ user_id: actor.user.id, idea_id: idea.id });
        if (error) {
          console.warn("Supabase upvote delete error:", error.message);
        }
      }
    }

    if (newStarred && idea) {
      addNotification({
        type: "star",
        title: `Starred "${idea.title}"`,
        message: `Added blueprint to your starred collection (${newCount} total stars).`,
        idea_slug: idea.slug,
        idea_title: idea.title,
        actor: actor.author,
        target_tab: "spec",
        read: true,
        recipient_id: idea.author_id || idea.author?.id,
      });
    }

    return {
      starred: newStarred,
      upvotes_count: newCount,
    };
  }

  // Offline unconfigured sandbox fallback
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
      window.dispatchEvent(new CustomEvent(EVENT_UPVOTES_UPDATED));
    } catch {
      // ignore
    }
  }

  if (newStarred && idea) {
    addNotification({
      type: "star",
      title: `Starred "${idea.title}"`,
      message: `Added blueprint to your starred collection (${newCount} total stars).`,
      idea_slug: idea.slug,
      idea_title: idea.title,
      target_tab: "spec",
      read: true,
    });
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
  const idea =
    memoryIdeas.find((i) => i.slug.toLowerCase() === normalized) ||
    (await getIdeaBySlug(normalized));
  if (!idea) return null;

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      throw new Error("Sign in to propose a Feature Pull Request.");
    }

    let persistedId = `pr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let createdAt = "Just now";

    if (isUuid(idea.id)) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("feature_requests")
        .insert({
          idea_id: idea.id,
          proposer_id: actor.user.id,
          action_type: req.action_type,
          feature_text: req.feature_text.trim(),
          rationale: req.rationale?.trim() || null,
          status: "pending",
        })
        .select("id, created_at")
        .single();

      if (error) {
        throw new Error(error.message);
      }
      if (data?.id) {
        persistedId = data.id;
        createdAt = data.created_at || createdAt;
      }
    }

    const newPR: FeatureRequest = {
      id: persistedId,
      idea_id: idea.slug,
      proposer: actor.author,
      action_type: req.action_type,
      feature_text: req.feature_text.trim(),
      rationale:
        req.rationale?.trim() || "Proposed to improve MVP architectural scope.",
      status: "pending",
      created_at: createdAt,
    };

    idea.feature_requests = [newPR, ...(idea.feature_requests || [])];

    addNotification({
      type: "pr",
      title: `Feature PR Opened on "${idea.title}"`,
      message: `${req.action_type === "add_feature" ? "+ Add" : "- Trim"}: ${newPR.feature_text}`,
      idea_slug: idea.slug,
      idea_title: idea.title,
      actor: actor.author,
      target_tab: "prs",
      recipient_id: idea.author_id || idea.author?.id,
    });

    return newPR;
  }

  const newPR: FeatureRequest = {
    id: `pr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    proposer: req.proposer || getCurrentActorAuthor(),
    action_type: req.action_type,
    feature_text: req.feature_text.trim(),
    rationale: req.rationale?.trim() || "Proposed to improve MVP architectural scope.",
    status: "pending",
    created_at: "Just now",
  };

  idea.feature_requests = [newPR, ...(idea.feature_requests || [])];

  addNotification({
    type: "pr",
    title: `Feature PR Opened on "${idea.title}"`,
    message: `${req.action_type === "add_feature" ? "+ Add" : "- Trim"}: ${newPR.feature_text}`,
    idea_slug: idea.slug,
    idea_title: idea.title,
    actor: newPR.proposer,
    target_tab: "prs",
  });

  return newPR;
}

export async function reviewFeatureRequest(
  slug: string,
  prId: string,
  decision: "approved" | "rejected"
): Promise<{ success: boolean; idea: Idea | null; message: string }> {
  const normalized = slug.toLowerCase();
  const idea =
    memoryIdeas.find((i) => i.slug.toLowerCase() === normalized) ||
    (await getIdeaBySlug(normalized));
  if (!idea) {
    return { success: false, idea: null, message: "Idea blueprint not found" };
  }

  const pr = idea.feature_requests?.find((p) => p.id === prId);
  if (!pr) {
    return { success: false, idea, message: "Pull request not found" };
  }

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      return {
        success: false,
        idea,
        message: "Sign in as the specification author to review Feature PRs.",
      };
    }

    const ownerId = idea.author_id || idea.author?.id;
    if (ownerId && ownerId !== actor.user.id) {
      return {
        success: false,
        idea,
        message: "Only the specification author can approve or decline Feature PRs.",
      };
    }

    const nextFeatures = [...idea.mvp_features];
    if (decision === "approved") {
      if (pr.action_type === "add_feature") {
        if (!nextFeatures.includes(pr.feature_text)) {
          nextFeatures.push(pr.feature_text);
        }
      } else if (pr.action_type === "remove_feature") {
        const filtered = nextFeatures.filter(
          (f) => f.toLowerCase().trim() !== pr.feature_text.toLowerCase().trim()
        );
        nextFeatures.length = 0;
        nextFeatures.push(...filtered);
      }
    }

    const supabase = createClient();
    if (isUuid(prId)) {
      const { error: prErr } = await supabase
        .from("feature_requests")
        .update({ status: decision })
        .eq("id", prId);
      if (prErr) {
        return { success: false, idea, message: prErr.message };
      }
    }

    if (decision === "approved" && isUuid(idea.id)) {
      const { error: ideaErr } = await supabase
        .from("ideas")
        .update({ mvp_features: nextFeatures })
        .eq("id", idea.id);
      if (ideaErr) {
        return { success: false, idea, message: ideaErr.message };
      }
    }

    pr.status = decision;
    idea.mvp_features = nextFeatures;

    return {
      success: true,
      idea: { ...idea },
      message:
        decision === "approved"
          ? `Merged PR: ${pr.feature_text} ${pr.action_type === "add_feature" ? "added to" : "removed from"} MVP specifications.`
          : `Declined PR: ${pr.feature_text}.`,
    };
  }

  pr.status = decision;

  if (decision === "approved") {
    if (pr.action_type === "add_feature") {
      if (!idea.mvp_features.includes(pr.feature_text)) {
        idea.mvp_features = [...idea.mvp_features, pr.feature_text];
      }
    } else if (pr.action_type === "remove_feature") {
      idea.mvp_features = idea.mvp_features.filter(
        (f) => f.toLowerCase().trim() !== pr.feature_text.toLowerCase().trim()
      );
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
  const idea =
    memoryIdeas.find((i) => i.slug.toLowerCase() === normalized) ||
    (await getIdeaBySlug(normalized));
  if (!idea) return { success: false, build: null, builds_count: 0 };

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      throw new Error("Sign in to link a shipped repository or demo build.");
    }

    const resolvedStatus =
      buildData.status || (buildData.live_url ? "shipped" : "building");
    let buildId = `build-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let createdAt = "Just now";

    if (isUuid(idea.id)) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("idea_builds")
        .insert({
          idea_id: idea.id,
          builder_id: actor.user.id,
          status: resolvedStatus,
          repo_url: buildData.repo_url.trim(),
          live_url: buildData.live_url?.trim() || null,
          notes: buildData.notes?.trim() || null,
        })
        .select("id, created_at")
        .single();

      if (error) {
        throw new Error(error.message);
      }
      if (data?.id) {
        buildId = data.id;
        createdAt = data.created_at || createdAt;
      }
    }

    const newBuild: IdeaBuild = {
      id: buildId,
      idea_id: idea.slug,
      builder: actor.author,
      status: resolvedStatus,
      repo_url: buildData.repo_url.trim(),
      live_url: buildData.live_url?.trim() || undefined,
      notes:
        buildData.notes?.trim() ||
        "Active implementation linked via IdeaToX Showcase.",
      created_at: createdAt,
    };

    idea.builds = [newBuild, ...(idea.builds || [])];
    idea.builds_count = (idea.builds_count || 0) + 1;

    addNotification({
      type: "build",
      title: `${newBuild.status === "shipped" ? "Shipped Demo" : "Build Linked"}: "${idea.title}"`,
      message: newBuild.notes || `Linked implementation repo ${newBuild.repo_url}.`,
      idea_slug: idea.slug,
      idea_title: idea.title,
      actor: actor.author,
      target_tab: "builds",
      recipient_id: idea.author_id || idea.author?.id,
    });

    return {
      success: true,
      build: newBuild,
      builds_count: idea.builds_count,
    };
  }

  const newBuild: IdeaBuild = {
    id: `build-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    builder: buildData.builder || getCurrentActorAuthor(),
    status: buildData.status || (buildData.live_url ? "shipped" : "building"),
    repo_url: buildData.repo_url.trim(),
    live_url: buildData.live_url?.trim() || undefined,
    notes:
      buildData.notes?.trim() ||
      "Active implementation linked via IdeaToX Showcase.",
    created_at: "Just now",
  };

  idea.builds = [newBuild, ...(idea.builds || [])];
  idea.builds_count = (idea.builds_count || 0) + 1;

  addNotification({
    type: "build",
    title: `${newBuild.status === "shipped" ? "Shipped Demo" : "Build Linked"}: "${idea.title}"`,
    message: newBuild.notes || `Linked implementation repo ${newBuild.repo_url}.`,
    idea_slug: idea.slug,
    idea_title: idea.title,
    actor: newBuild.builder,
    target_tab: "builds",
  });

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

  if (isSupabaseConfigured() && isUuid(buildId)) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) return false;
    const supabase = createClient();
    const { error } = await supabase
      .from("idea_builds")
      .update({
        status: newStatus,
        ...(liveUrl ? { live_url: liveUrl.trim() } : {}),
      })
      .eq("id", buildId)
      .eq("builder_id", actor.user.id);
    if (error) return false;
  }

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

  const actor = isSupabaseConfigured()
    ? await resolveAuthenticatedActor()
    : null;

  if (isSupabaseConfigured() && !actor) {
    throw new Error("Sign in to fork blueprint specifications.");
  }

  const generatedSlug =
    pivotData.remixedTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) + `-${Math.random().toString(36).substring(2, 6)}`;

  const forkedIdea: Idea = {
    ...parent,
    id: undefined,
    slug: generatedSlug,
    title: pivotData.remixedTitle.trim(),
    hook: `[Fork of @${parent.slug}] ${parent.hook} ${pivotData.pivotNotes ? `— Pivot: ${pivotData.pivotNotes}` : ""}`,
    target_region: pivotData.targetRegion || parent.target_region,
    parent_slug: parent.slug,
    parent_idea_id: parent.id || parent.slug,
    author_id: actor?.user.id ?? null,
    upvotes_count: 1,
    forks_count: 0,
    builds_count: 0,
    is_seeded: false,
    created_at: new Date().toISOString(),
    author: actor?.author || getCurrentActorAuthor(),
    feature_requests: [],
    builds: [],
    comments: [],
    collaboration_requests: [],
    team_members: [],
  };

  const { idea: saved, error } = await saveNewIdeaAsync(forkedIdea);
  if (error) {
    throw new Error(error);
  }
  return saved;
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
  const idea =
    memoryIdeas.find((i) => i.slug.toLowerCase() === normalized) ||
    (await getIdeaBySlug(normalized));
  if (!idea) return null;

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      throw new Error("Sign in to post architectural comments.");
    }

    let persistedId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let createdAt = "Just now";
    const resolvedParentCommentId = isUuid(parentCommentId)
      ? parentCommentId
      : null;

    if (isUuid(idea.id)) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("comments")
        .insert({
          idea_id: idea.id,
          user_id: actor.user.id,
          content: content.trim(),
          parent_comment_id: resolvedParentCommentId,
          likes_count: 0,
        })
        .select("id, created_at")
        .single();

      if (error) {
        throw new Error(error.message);
      }
      if (data?.id) {
        persistedId = data.id;
        createdAt = data.created_at || createdAt;
      }
    }

    const newComment: IdeaComment = {
      id: persistedId,
      idea_id: idea.slug,
      user: actor.author,
      content: content.trim(),
      created_at: createdAt,
      parent_comment_id: parentCommentId || null,
      likes_count: 0,
      user_liked: false,
    };

    idea.comments = [...(idea.comments || []), newComment];

    addNotification({
      type: "comment",
      title: `${parentCommentId ? "Reply Posted" : "Discussion Note"} on "${idea.title}"`,
      message: newComment.content.slice(0, 110),
      idea_slug: idea.slug,
      idea_title: idea.title,
      actor: actor.author,
      target_tab: "discussions",
      recipient_id: idea.author_id || idea.author?.id,
    });

    return newComment;
  }

  const newComment: IdeaComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    user: user || getCurrentActorAuthor(),
    content: content.trim(),
    created_at: "Just now",
    parent_comment_id: parentCommentId || null,
    likes_count: 0,
    user_liked: false,
  };

  idea.comments = [...(idea.comments || []), newComment];

  addNotification({
    type: "comment",
    title: `${parentCommentId ? "Reply Posted" : "Discussion Note"} on "${idea.title}"`,
    message: newComment.content.slice(0, 110),
    idea_slug: idea.slug,
    idea_title: idea.title,
    actor: newComment.user,
    target_tab: "discussions",
  });

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
  if (!cleanUsername) return null;

  const allIdeas = await getAllIdeas();
  const configured = isSupabaseConfigured();

  let dbAuthor: IdeaAuthor | null = null;
  if (configured) {
    try {
      const supabase = createClient();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", cleanUsername)
        .maybeSingle();

      if (profileData) {
        dbAuthor = profileRowToAuthor(profileData);
      }
    } catch {
      // fall through gracefully
    }
  }

  let author =
    dbAuthor ||
    MOCK_AUTHORS.find((a) => a.username.toLowerCase() === cleanUsername);

  if (!author) {
    const ideaByAuthor = allIdeas.find(
      (i) => i.author?.username.toLowerCase() === cleanUsername
    );
    if (ideaByAuthor?.author) {
      author = ideaByAuthor.author;
    }
  }

  if (!author) {
    return null;
  }

  author = applyProfileOverrides(author);

  const authoredIdeas = allIdeas.filter(
    (i) =>
      i.author?.username.toLowerCase() === cleanUsername ||
      (dbAuthor?.id && i.author_id === dbAuthor.id)
  );

  const originalSpecs = authoredIdeas.filter((i) => !i.parent_slug);
  const forks = authoredIdeas.filter((i) => Boolean(i.parent_slug));

  const ideaSlugById = new Map<string, string>();
  allIdeas.forEach((item) => {
    if (item.id) ideaSlugById.set(item.id, item.slug);
  });

  const userBuilds: IdeaBuild[] = [];
  const seenBuildIds = new Set<string>();
  memoryIdeas.forEach((i) => {
    (i.builds || []).forEach((b) => {
      if (b.builder?.username.toLowerCase() === cleanUsername && !seenBuildIds.has(b.id)) {
        seenBuildIds.add(b.id);
        userBuilds.push(b);
      }
    });
  });

  const userPRs: FeatureRequest[] = [];
  const seenPrIds = new Set<string>();
  memoryIdeas.forEach((i) => {
    (i.feature_requests || []).forEach((pr) => {
      if (pr.proposer?.username.toLowerCase() === cleanUsername && !seenPrIds.has(pr.id)) {
        seenPrIds.add(pr.id);
        userPRs.push(pr);
      }
    });
  });

  let userStarred: Idea[] = [];

  if (configured && dbAuthor?.id) {
    try {
      const supabase = createClient();
      const [buildsRes, prsRes, upvotesRes] = await Promise.all([
        supabase
          .from("idea_builds")
          .select("*")
          .eq("builder_id", dbAuthor.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("feature_requests")
          .select("*")
          .eq("proposer_id", dbAuthor.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("idea_upvotes")
          .select("idea_id")
          .eq("user_id", dbAuthor.id),
      ]);

      if (!buildsRes.error && buildsRes.data) {
        buildsRes.data.forEach((row) => {
          if (seenBuildIds.has(row.id)) return;
          seenBuildIds.add(row.id);
          userBuilds.push({
            id: row.id,
            idea_id: ideaSlugById.get(row.idea_id) || row.idea_id,
            builder: author!,
            status: row.status === "shipped" ? "shipped" : "building",
            repo_url: row.repo_url,
            live_url: row.live_url || undefined,
            notes: row.notes || undefined,
            created_at: row.created_at,
          });
        });
      }

      if (!prsRes.error && prsRes.data) {
        prsRes.data.forEach((row) => {
          if (seenPrIds.has(row.id)) return;
          seenPrIds.add(row.id);
          userPRs.push({
            id: row.id,
            idea_id: ideaSlugById.get(row.idea_id) || row.idea_id,
            proposer: author!,
            action_type:
              row.action_type === "remove_feature" ? "remove_feature" : "add_feature",
            feature_text: row.feature_text,
            rationale: row.rationale || undefined,
            status:
              row.status === "approved" || row.status === "rejected"
                ? row.status
                : "pending",
            created_at: row.created_at,
          });
        });
      }

      if (!upvotesRes.error && upvotesRes.data) {
        const upvotedIds = new Set(upvotesRes.data.map((u) => u.idea_id));
        userStarred = allIdeas.filter((i) => i.id && upvotedIds.has(i.id));
      }
    } catch {
      // keep locally discovered data
    }
  } else {
    const starredSlugs = getUserStars();
    userStarred = allIdeas.filter((i) => starredSlugs.includes(i.slug.toLowerCase()));
  }

  const totalSpecs = originalSpecs.length;
  const totalForks = forks.length;
  const totalBuilds = userBuilds.length;
  const totalStars = authoredIdeas.reduce((acc, i) => acc + (i.upvotes_count || 0), 0);

  const reputation =
    (author.reputation_score || 300) +
    totalStars * 8 +
    totalBuilds * 40 +
    totalForks * 20;

  let rankTitle = "Apprentice Builder";
  if (reputation >= 3000) rankTitle = "Principal Systems Architect";
  else if (reputation >= 1800) rankTitle = "Staff Specification Lead";
  else if (reputation >= 800) rankTitle = "Senior Full-Stack Builder";
  else if (reputation >= 300) rankTitle = "Ecosystem Contributor";

  const badgesSet = new Set<string>(author.badges || []);
  if (totalSpecs > 0) badgesSet.add("Ideator");
  if (totalForks > 0) badgesSet.add("Remixer");
  if (totalBuilds > 0) badgesSet.add("Shipper");
  if (userPRs.some((pr) => pr.status === "approved")) badgesSet.add("Architect");

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
function isMissingRelationError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

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
  const idea =
    memoryIdeas.find((i) => i.slug.toLowerCase() === normalized) ||
    (await getIdeaBySlug(normalized));
  if (!idea) return null;

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      throw new Error("Sign in to pitch a collaboration request.");
    }

    let persistedId = `collab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    let persistedCreatedAt = "Just now";

    if (isUuid(idea.id)) {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("collaboration_requests")
        .insert({
          idea_id: idea.id,
          applicant_id: actor.user.id,
          role: req.role.trim(),
          contact_handle: req.contact_handle.trim(),
          availability: req.availability.trim(),
          pitch: req.pitch.trim(),
          status: "pending",
        })
        .select("id, created_at")
        .single();

      if (error) {
        if (!isMissingRelationError(error)) {
          throw new Error(error.message);
        }
      } else if (data) {
        persistedId = data.id;
        persistedCreatedAt = data.created_at;
      }
    }

    const newCollab: CollaborationRequest = {
      id: persistedId,
      idea_id: idea.slug,
      applicant: actor.author,
      role: req.role.trim(),
      contact_handle: req.contact_handle.trim(),
      availability: req.availability.trim(),
      pitch: req.pitch.trim(),
      status: "pending",
      created_at: persistedCreatedAt,
    };

    idea.collaboration_requests = [newCollab, ...(idea.collaboration_requests || [])];

    addNotification({
      type: "collab",
      title: `Collaboration Pitch on "${idea.title}"`,
      message: `Applied for ${newCollab.role} (${newCollab.availability}) • ${newCollab.pitch.slice(0, 80)}`,
      idea_slug: idea.slug,
      idea_title: idea.title,
      actor: actor.author,
      target_tab: "team",
      recipient_id: idea.author_id || idea.author?.id,
    });

    return newCollab;
  }

  const newCollab: CollaborationRequest = {
    id: `collab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    idea_id: idea.slug,
    applicant: req.applicant || getCurrentActorAuthor(),
    role: req.role,
    contact_handle: req.contact_handle,
    availability: req.availability,
    pitch: req.pitch.trim(),
    status: "pending",
    created_at: "Just now",
  };

  idea.collaboration_requests = [newCollab, ...(idea.collaboration_requests || [])];

  addNotification({
    type: "collab",
    title: `Collaboration Pitch on "${idea.title}"`,
    message: `Applied for ${newCollab.role} (${newCollab.availability}) • ${newCollab.pitch.slice(0, 80)}`,
    idea_slug: idea.slug,
    idea_title: idea.title,
    actor: newCollab.applicant,
    target_tab: "team",
  });

  return newCollab;
}

export async function reviewCollaborationRequest(
  slug: string,
  requestId: string,
  decision: "accepted" | "declined"
): Promise<{ success: boolean; idea: Idea | null; message: string }> {
  const normalized = slug.toLowerCase();
  const idea =
    memoryIdeas.find((i) => i.slug.toLowerCase() === normalized) ||
    (await getIdeaBySlug(normalized));
  if (!idea) return { success: false, idea: null, message: "Idea blueprint not found" };

  const req = idea.collaboration_requests?.find((r) => r.id === requestId);
  if (!req) return { success: false, idea, message: "Collaboration request not found" };

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      return {
        success: false,
        idea,
        message: "Sign in as the specification author to review collaboration pitches.",
      };
    }

    const ownerId = idea.author_id || idea.author?.id;
    if (ownerId && ownerId !== actor.user.id) {
      return {
        success: false,
        idea,
        message: "Only the specification author can accept or decline collaboration requests.",
      };
    }

    if (isUuid(requestId)) {
      const supabase = createClient();
      const { error } = await supabase
        .from("collaboration_requests")
        .update({ status: decision })
        .eq("id", requestId);

      if (error && !isMissingRelationError(error)) {
        return { success: false, idea, message: error.message };
      }
    }
  }

  req.status = decision;

  if (decision === "accepted") {
    const existing = idea.team_members || [];
    if (!existing.some((m) => m.username === req.applicant.username)) {
      idea.team_members = [...existing, req.applicant];
    }
  }

  if (req.applicant.id) {
    addNotification({
      type: "collab",
      title: `Collaboration Request ${decision === "accepted" ? "Accepted" : "Declined"}`,
      message: `Your pitch for ${req.role} on "${idea.title}" was ${decision}.`,
      idea_slug: idea.slug,
      idea_title: idea.title,
      actor: getCurrentActorAuthor(),
      target_tab: "team",
      recipient_id: req.applicant.id,
    });
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

// -------------------------------------------------------------
// MILESTONE 11: DEVELOPER PROFILE SETTINGS & BUILDER INBOX
// -------------------------------------------------------------
const STORAGE_KEY_PROFILE_OVERRIDES = "ideatox_profile_overrides";
const STORAGE_KEY_NOTIFICATIONS = "ideatox_builder_notifications";
const EVENT_PROFILE_UPDATED = "ideatox:profile-updated";
const EVENT_NOTIFICATIONS_UPDATED = "ideatox:notifications-updated";

let memoryProfileOverrides: Record<string, Partial<IdeaAuthor>> = {};
let memoryNotifications: IdeaNotification[] | null = null;

function emitBrowserEvent(eventName: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(eventName));
  }
}

function readProfileOverrides(): Record<string, Partial<IdeaAuthor>> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PROFILE_OVERRIDES);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Partial<IdeaAuthor>>;
        memoryProfileOverrides = parsed;
        return parsed;
      }
    } catch {
      // ignore malformed storage
    }
  }
  return memoryProfileOverrides;
}

function writeProfileOverrides(overrides: Record<string, Partial<IdeaAuthor>>): void {
  memoryProfileOverrides = overrides;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE_OVERRIDES, JSON.stringify(overrides));
    } catch {
      // ignore quota errors
    }
  }
  emitBrowserEvent(EVENT_PROFILE_UPDATED);
}

export function applyProfileOverrides(author: IdeaAuthor): IdeaAuthor {
  const key = author.username.toLowerCase();
  const overrides = readProfileOverrides();
  const patch = overrides[key];
  if (!patch) return author;
  return {
    ...author,
    ...patch,
    username: author.username,
  };
}

export function getCurrentActorAuthor(): IdeaAuthor {
  if (activeSessionProfile) {
    return applyProfileOverrides(profileRowToAuthor(activeSessionProfile));
  }
  if (activeSessionUser) {
    const handle = sanitizeUsernameHandle(
      (activeSessionUser.email ? activeSessionUser.email.split("@")[0] : "") ||
        `builder_${activeSessionUser.id.slice(0, 4)}`
    );
    return applyProfileOverrides({
      id: activeSessionUser.id,
      username: handle,
      full_name: handle,
      reputation_score: 300,
      badges: ["Ideator"],
    });
  }
  const base =
    MOCK_AUTHORS.find((a) => a.username === "you_builder") || MOCK_AUTHORS[MOCK_AUTHORS.length - 1];
  return applyProfileOverrides(base);
}

export async function getActiveBuilderProfile(username?: string): Promise<IdeaAuthor> {
  const target = (username || "").toLowerCase().replace(/^@/, "").trim();
  let baseAuthor: IdeaAuthor | undefined;

  if (isSupabaseConfigured()) {
    try {
      if (
        activeSessionProfile &&
        (!target || activeSessionProfile.username.toLowerCase() === target)
      ) {
        baseAuthor = profileRowToAuthor(activeSessionProfile);
      } else {
        const dbProfile = await getCurrentProfile();
        if (dbProfile && (!target || dbProfile.username.toLowerCase() === target)) {
          activeSessionProfile = dbProfile;
          baseAuthor = profileRowToAuthor(dbProfile);
        }
      }
    } catch {
      // fallback cleanly below
    }
  }

  if (!baseAuthor) {
    const fallbackHandle = target || "you_builder";
    baseAuthor =
      MOCK_AUTHORS.find((a) => a.username.toLowerCase() === fallbackHandle) ||
      MOCK_AUTHORS.find((a) => a.username === "you_builder")!;
  }

  return applyProfileOverrides(baseAuthor);
}

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const msg = (error.message || "").toLowerCase();
  return error.code === "42703" || msg.includes("column") || msg.includes("schema cache");
}

function syncAuthorIntoMemory(targetUsername: string, updatedAuthor: IdeaAuthor): void {
  const match = (candidate?: IdeaAuthor): IdeaAuthor | undefined => {
    if (!candidate) return candidate;
    return candidate.username.toLowerCase() === targetUsername
      ? { ...candidate, ...updatedAuthor }
      : candidate;
  };

  const mockIdx = MOCK_AUTHORS.findIndex((a) => a.username.toLowerCase() === targetUsername);
  if (mockIdx !== -1) {
    MOCK_AUTHORS[mockIdx] = { ...MOCK_AUTHORS[mockIdx], ...updatedAuthor };
  }

  memoryIdeas.forEach((idea) => {
    if (idea.author) idea.author = match(idea.author);
    if (idea.team_members) {
      idea.team_members = idea.team_members.map((m) => match(m) || m);
    }
    if (idea.builds) {
      idea.builds = idea.builds.map((b) => ({ ...b, builder: match(b.builder) || b.builder }));
    }
    if (idea.feature_requests) {
      idea.feature_requests = idea.feature_requests.map((pr) => ({
        ...pr,
        proposer: match(pr.proposer) || pr.proposer,
      }));
    }
    if (idea.comments) {
      idea.comments = idea.comments.map((c) => ({ ...c, user: match(c.user) || c.user }));
    }
  });
}

export async function updateUserProfile(
  updates: Partial<IdeaAuthor> & { username?: string; newUsername?: string }
): Promise<IdeaAuthor> {
  const { username: targetHint, newUsername, ...cleanPatch } = updates;

  if (isSupabaseConfigured()) {
    const actor = await resolveAuthenticatedActor();
    if (!actor) {
      throw new Error("Sign in to update your developer profile.");
    }

    const supabase = createClient();
    const currentUsername = actor.author.username.toLowerCase();
    let finalUsername = currentUsername;

    if (typeof newUsername === "string" && newUsername.trim().length > 0) {
      const cleanNew = sanitizeUsernameHandle(newUsername);
      if (cleanNew.length < 3) {
        throw new Error("Username handle must be at least 3 valid characters.");
      }
      if (cleanNew !== currentUsername) {
        const { data: conflict } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", cleanNew)
          .neq("id", actor.user.id)
          .maybeSingle();

        if (conflict) {
          throw new Error(`@${cleanNew} is already claimed by another builder.`);
        }
        finalUsername = cleanNew;
      }
    }

    const merged: IdeaAuthor = {
      ...actor.author,
      ...cleanPatch,
      id: actor.user.id,
      username: finalUsername,
    };

    const v1Payload = {
      username: finalUsername,
      full_name: merged.full_name || null,
      bio: merged.bio || null,
      location: merged.location || null,
      avatar_url: merged.avatar_url || null,
      github_url: merged.github_url || null,
      twitter_url: merged.twitter_url || null,
      website_url: merged.website_url || null,
    };

    const v2Payload = {
      ...v1Payload,
      headline: merged.headline || null,
      availability: merged.availability || null,
      preferred_stack: merged.preferred_stack || null,
      discord_url: merged.discord_url || null,
      contact_email: merged.email || null,
    };

    let { data: updatedRow, error } = await supabase
      .from("profiles")
      .update(v2Payload)
      .eq("id", actor.user.id)
      .select("*")
      .single();

    if (error && isMissingColumnError(error)) {
      const retry = await supabase
        .from("profiles")
        .update(v1Payload)
        .eq("id", actor.user.id)
        .select("*")
        .single();
      updatedRow = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(error.message || "Failed to update developer profile.");
    }

    if (updatedRow) {
      activeSessionProfile = updatedRow;
    }

    const overrides = readProfileOverrides();
    overrides[finalUsername] = {
      ...(overrides[finalUsername] || {}),
      ...cleanPatch,
    };
    writeProfileOverrides(overrides);

    const resolvedAuthor = updatedRow
      ? {
          ...profileRowToAuthor(updatedRow),
          ...cleanPatch,
          username: updatedRow.username,
        }
      : merged;

    syncAuthorIntoMemory(currentUsername, resolvedAuthor);
    if (finalUsername !== currentUsername) {
      syncAuthorIntoMemory(finalUsername, resolvedAuthor);
    }

    return resolvedAuthor;
  }

  const targetUsername = (targetHint || "you_builder").toLowerCase().replace(/^@/, "").trim();
  const current = await getActiveBuilderProfile(targetUsername);
  const nextHandle =
    typeof newUsername === "string" && newUsername.trim().length > 0
      ? sanitizeUsernameHandle(newUsername)
      : current.username;

  const merged: IdeaAuthor = {
    ...current,
    ...cleanPatch,
    username: nextHandle,
  };

  const overrides = readProfileOverrides();
  overrides[nextHandle] = {
    ...(overrides[nextHandle] || {}),
    ...cleanPatch,
  };
  writeProfileOverrides(overrides);
  syncAuthorIntoMemory(targetUsername, merged);
  return merged;
}

export function resetUserProfile(username = "you_builder"): IdeaAuthor {
  const target = username.toLowerCase().replace(/^@/, "").trim();
  const overrides = readProfileOverrides();
  delete overrides[target];
  writeProfileOverrides(overrides);
  return MOCK_AUTHORS.find((a) => a.username.toLowerCase() === target) || MOCK_AUTHORS[4];
}

export function subscribeProfileUpdates(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_PROFILE_UPDATED, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_PROFILE_UPDATED, handler);
    window.removeEventListener("storage", handler);
  };
}

function buildInitialNotifications(): IdeaNotification[] {
  const first = memoryIdeas[0];
  const second = memoryIdeas[1] || first;
  const third = memoryIdeas[2] || first;

  return [
    {
      id: "notif-seed-1",
      type: "pr",
      title: "Feature PR #14 Ready for Review",
      message: "Proposed adding CRDT conflict resolution inspector to MVP scope.",
      idea_slug: first?.slug || "local-first-crm",
      idea_title: first?.title || "Local-First CRDT Workspace",
      actor: MOCK_AUTHORS[1],
      created_at: "14m ago",
      read: false,
      target_tab: "prs",
    },
    {
      id: "notif-seed-2",
      type: "collab",
      title: "New Founding Engineer Pitch",
      message: "Applied for Systems Architect (Rust / WASM) • 15 hrs/wk availability.",
      idea_slug: second?.slug || "agent-router",
      idea_title: second?.title || "Deterministic Agent Router",
      actor: MOCK_AUTHORS[0],
      created_at: "1h ago",
      read: false,
      target_tab: "team",
    },
    {
      id: "notif-seed-3",
      type: "fork",
      title: "Downstream Blueprint Forked",
      message: "Created an edge-offline mobile variant in your spec lineage tree.",
      idea_slug: third?.slug || first?.slug || "local-first-crm",
      idea_title: third?.title || first?.title || "Edge Telemetry Hub",
      actor: MOCK_AUTHORS[2],
      created_at: "3h ago",
      read: false,
      target_tab: "lineage",
    },
    {
      id: "notif-seed-4",
      type: "build",
      title: "Proof-of-Work Demo Shipped",
      message: "Linked live Vercel preview & GitHub repository implementation.",
      idea_slug: first?.slug || "local-first-crm",
      idea_title: first?.title || "Local-First CRDT Workspace",
      actor: MOCK_AUTHORS[3],
      created_at: "1d ago",
      read: true,
      target_tab: "builds",
    },
    {
      id: "notif-seed-5",
      type: "comment",
      title: "Architectural Thread Reply",
      message: "Replied with SQLite WAL journal tuning benchmarks for concurrent writes.",
      idea_slug: second?.slug || first?.slug || "agent-router",
      idea_title: second?.title || first?.title || "Deterministic Agent Router",
      actor: MOCK_AUTHORS[1],
      created_at: "2d ago",
      read: true,
      target_tab: "discussions",
    },
  ];
}

function persistNotifications(list: IdeaNotification[]): void {
  memoryNotifications = list;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(list));
    } catch {
      // ignore quota errors
    }
  }
  emitBrowserEvent(EVENT_NOTIFICATIONS_UPDATED);
}

export function getNotifications(): IdeaNotification[] {
  if (typeof window !== "undefined") {
    if (isSupabaseConfigured() && !activeSessionUser) {
      return [];
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (raw) {
        const parsed = JSON.parse(raw) as IdeaNotification[];
        memoryNotifications = parsed;
        return parsed;
      }
    } catch {
      // fall through
    }
  }

  if (isSupabaseConfigured()) {
    return memoryNotifications || [];
  }

  if (!memoryNotifications) {
    const seeded = buildInitialNotifications();
    persistNotifications(seeded);
    return seeded;
  }
  return memoryNotifications;
}

export function addNotification(input: {
  type: NotificationType;
  title: string;
  message: string;
  idea_slug: string;
  idea_title: string;
  actor?: IdeaAuthor;
  target_tab?: IdeaDetailTab;
  read?: boolean;
  recipient_id?: string;
}): IdeaNotification {
  const next: IdeaNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: input.type,
    title: input.title,
    message: input.message,
    idea_slug: input.idea_slug,
    idea_title: input.idea_title,
    actor: input.actor || getCurrentActorAuthor(),
    created_at: "Just now",
    read: input.read ?? false,
    target_tab: input.target_tab,
  };

  const shouldStoreLocally =
    !isSupabaseConfigured() ||
    !input.recipient_id ||
    (activeSessionUser !== null && input.recipient_id === activeSessionUser.id);

  if (shouldStoreLocally) {
    const existing = getNotifications();
    persistNotifications([next, ...existing].slice(0, 40));
  }

  if (
    isSupabaseConfigured() &&
    activeSessionUser &&
    isUuid(input.recipient_id) &&
    input.recipient_id !== activeSessionUser.id
  ) {
    const supabase = createClient();
    void supabase
      .from("notifications")
      .insert({
        recipient_id: input.recipient_id,
        actor_id: activeSessionUser.id,
        type: input.type,
        title: input.title,
        message: input.message,
        idea_slug: input.idea_slug,
        idea_title: input.idea_title,
        target_tab: input.target_tab ?? null,
        read: input.read ?? false,
      })
      .then(({ error }) => {
        if (error && !isMissingRelationError(error)) {
          console.warn("Supabase notification insert warning:", error.message);
        }
      });
  }

  return next;
}

export function markNotificationRead(id: string): IdeaNotification[] {
  const updated = getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
  persistNotifications(updated);

  if (isSupabaseConfigured() && activeSessionUser && isUuid(id)) {
    const supabase = createClient();
    void supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("recipient_id", activeSessionUser.id)
      .then(() => undefined);
  }

  return updated;
}

export function markAllNotificationsRead(): IdeaNotification[] {
  const updated = getNotifications().map((n) => ({ ...n, read: true }));
  persistNotifications(updated);

  if (isSupabaseConfigured() && activeSessionUser) {
    const supabase = createClient();
    void supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", activeSessionUser.id)
      .then(() => undefined);
  }

  return updated;
}

export function resetNotifications(): IdeaNotification[] {
  if (isSupabaseConfigured()) {
    persistNotifications([]);
    return [];
  }
  const seeded = buildInitialNotifications();
  persistNotifications(seeded);
  return seeded;
}

export function getUnreadNotificationCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function subscribeNotifications(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_NOTIFICATIONS_UPDATED, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_NOTIFICATIONS_UPDATED, handler);
    window.removeEventListener("storage", handler);
  };
}

// -------------------------------------------------------------
// MILESTONE 12: CURATED COLLECTIONS & SAVED READING LIST BOOKMARKS
// -------------------------------------------------------------
const BOOKMARKS_STORAGE_KEY = "ideatox_saved_reading_list";
const EVENT_BOOKMARKS_UPDATED = "ideatox-bookmarks-updated";

export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: "weekend_quickstarts",
    title: "Weekend Portfolio Quickstarts",
    subtitle: "Focused web, CLI & extension builds shippable under 24–48 hours.",
    badge: "< 48 HRS",
  },
  {
    id: "autonomous_agents",
    title: "Autonomous AI Agent Specs",
    subtitle: "LLM pipelines, semantic routers, RAG tooling & agent workflows.",
    badge: "AI / LLM",
  },
  {
    id: "local_first",
    title: "Local-First & Offline Systems",
    subtitle: "CRDTs, SQLite/IndexedDB stores, P2P sync & resilient edge tools.",
    badge: "OFFLINE-FIRST",
  },
  {
    id: "hardware_iot",
    title: "Hardware & IoT Weekend Hacks",
    subtitle: "ESP32 telemetry, mesh sensors, solar nodes & embedded hacks.",
    badge: "EDGE / IOT",
  },
  {
    id: "want_to_build",
    title: "Want to Build (Reading List)",
    subtitle: "Your personal bookmarked queue of blueprints shortlisted to ship.",
    badge: "BOOKMARKS",
  },
];

export function matchesCuratedCollection(
  idea: Idea,
  collectionId: CuratedCollectionId,
  bookmarkedSlugs: string[] = []
): boolean {
  const corpus = [
    idea.title,
    idea.hook,
    idea.problem_statement,
    ...(idea.suggested_stack || []),
    ...(idea.mvp_features || []),
  ]
    .join(" ")
    .toLowerCase();

  switch (collectionId) {
    case "weekend_quickstarts":
      return (
        idea.difficulty === "beginner" ||
        (idea.category === "cli" && idea.difficulty === "intermediate")
      );
    case "autonomous_agents":
      return (
        idea.category === "ai" ||
        /\b(llm|rag|agent|gemini|openai|vector|embedding|whisper|ai)\b/.test(corpus)
      );
    case "local_first":
      return (
        /\b(offline|local-first|local first|sqlite|indexeddb|crdt|yjs|p2p|mesh|webrtc|wasm|tauri|bluetooth|ble)\b/.test(
          corpus
        )
      );
    case "hardware_iot":
      return (
        idea.category === "hardware" ||
        /\b(esp32|mqtt|iot|lora|gpio|arduino|sensor|solar|firmware|hardware)\b/.test(corpus)
      );
    case "want_to_build":
      return bookmarkedSlugs.includes(idea.slug.toLowerCase());
  }
}

const EMPTY_BOOKMARKS: string[] = [];
let cachedBookmarksRaw: string | null | undefined;
let cachedBookmarksList: string[] = EMPTY_BOOKMARKS;

export function getSavedBookmarks(): string[] {
  if (typeof window === "undefined") return EMPTY_BOOKMARKS;
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (raw === cachedBookmarksRaw) {
      return cachedBookmarksList;
    }
    cachedBookmarksRaw = raw;
    if (!raw) {
      cachedBookmarksList = EMPTY_BOOKMARKS;
      return cachedBookmarksList;
    }
    const parsed = JSON.parse(raw);
    cachedBookmarksList = Array.isArray(parsed)
      ? parsed.map((slug) => String(slug).toLowerCase())
      : EMPTY_BOOKMARKS;
    return cachedBookmarksList;
  } catch {
    return EMPTY_BOOKMARKS;
  }
}

export function getServerSavedBookmarks(): string[] {
  return EMPTY_BOOKMARKS;
}

export function isIdeaBookmarked(slug: string): boolean {
  return getSavedBookmarks().includes(slug.toLowerCase());
}

export function toggleIdeaBookmark(slug: string): { bookmarked: boolean; slugs: string[] } {
  const normalized = slug.toLowerCase();
  const current = getSavedBookmarks();
  const exists = current.includes(normalized);
  const next = exists
    ? current.filter((item) => item !== normalized)
    : [normalized, ...current];

  if (typeof window !== "undefined") {
    try {
      const nextRaw = JSON.stringify(next);
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, nextRaw);
      cachedBookmarksRaw = nextRaw;
      cachedBookmarksList = next;
      window.dispatchEvent(new CustomEvent(EVENT_BOOKMARKS_UPDATED));
    } catch {
      // ignore storage quota errors
    }
  }

  if (isSupabaseConfigured() && activeSessionUser) {
    const userId = activeSessionUser.id;
    const supabase = createClient();
    const cachedIdea = memoryIdeas.find((i) => i.slug.toLowerCase() === normalized);

    void (async () => {
      try {
        let ideaId = cachedIdea && isUuid(cachedIdea.id) ? cachedIdea.id : null;
        if (!ideaId) {
          const { data } = await supabase
            .from("ideas")
            .select("id")
            .ilike("slug", normalized)
            .maybeSingle();
          if (data?.id && isUuid(data.id)) ideaId = data.id;
        }
        if (!ideaId) return;

        if (!exists) {
          const { error } = await supabase
            .from("bookmarks")
            .upsert({ user_id: userId, idea_id: ideaId }, { onConflict: "user_id,idea_id" });
          if (error && !isMissingRelationError(error)) {
            console.warn("Supabase bookmark insert warning:", error.message);
          }
        } else {
          const { error } = await supabase
            .from("bookmarks")
            .delete()
            .match({ user_id: userId, idea_id: ideaId });
          if (error && !isMissingRelationError(error)) {
            console.warn("Supabase bookmark delete warning:", error.message);
          }
        }
      } catch {
        // local bookmark state preserved cleanly
      }
    })();
  }

  return { bookmarked: !exists, slugs: next };
}

export function resetSavedBookmarks(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
    cachedBookmarksRaw = null;
    cachedBookmarksList = EMPTY_BOOKMARKS;
    window.dispatchEvent(new CustomEvent(EVENT_BOOKMARKS_UPDATED));
  }
}

export function subscribeBookmarks(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener(EVENT_BOOKMARKS_UPDATED, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT_BOOKMARKS_UPDATED, handler);
    window.removeEventListener("storage", handler);
  };
}

// -------------------------------------------------------------
// MILESTONE 13: SESSION HYDRATION & CACHE RESET
// -------------------------------------------------------------
export async function hydrateUserSupabaseData(userId: string): Promise<void> {
  if (!isSupabaseConfigured() || !userId || typeof window === "undefined") return;

  const supabase = createClient();

  try {
    const [upvotesRes, bookmarksRes, notificationsRes] = await Promise.allSettled([
      supabase.from("idea_upvotes").select("idea_id").eq("user_id", userId),
      supabase.from("bookmarks").select("idea_id").eq("user_id", userId),
      supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    const upvoteRows =
      upvotesRes.status === "fulfilled" && !upvotesRes.value.error
        ? upvotesRes.value.data || []
        : null;
    const bookmarkRows =
      bookmarksRes.status === "fulfilled" && !bookmarksRes.value.error
        ? bookmarksRes.value.data || []
        : null;
    const notificationRows =
      notificationsRes.status === "fulfilled" && !notificationsRes.value.error
        ? notificationsRes.value.data || []
        : null;

    const slugById = new Map<string, string>();
    memoryIdeas.forEach((item) => {
      if (item.id && item.slug) slugById.set(item.id, item.slug.toLowerCase());
    });

    const missingIds = new Set<string>();
    (upvoteRows || []).forEach((r) => {
      if (!slugById.has(r.idea_id)) missingIds.add(r.idea_id);
    });
    (bookmarkRows || []).forEach((r) => {
      if (!slugById.has(r.idea_id)) missingIds.add(r.idea_id);
    });

    if (missingIds.size > 0) {
      const { data: ideaMeta } = await supabase
        .from("ideas")
        .select("id, slug")
        .in("id", Array.from(missingIds));
      (ideaMeta || []).forEach((row) => {
        slugById.set(row.id, row.slug.toLowerCase());
      });
    }

    if (upvoteRows !== null) {
      memoryUserUpvotes.clear();
      upvoteRows.forEach((r) => {
        const slug = slugById.get(r.idea_id);
        if (slug) memoryUserUpvotes.add(slug);
      });
      try {
        localStorage.setItem(
          STORAGE_KEY_UPVOTES,
          JSON.stringify(Array.from(memoryUserUpvotes))
        );
      } catch {
        // ignore quota errors
      }
      emitBrowserEvent(EVENT_UPVOTES_UPDATED);
    }

    if (bookmarkRows !== null) {
      const nextBookmarks = bookmarkRows
        .map((r) => slugById.get(r.idea_id))
        .filter((s): s is string => Boolean(s));
      const nextRaw = JSON.stringify(nextBookmarks);
      cachedBookmarksRaw = nextRaw;
      cachedBookmarksList = nextBookmarks;
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, nextRaw);
      } catch {
        // ignore quota errors
      }
      emitBrowserEvent(EVENT_BOOKMARKS_UPDATED);
    }

    if (notificationRows !== null) {
      const actorIds = Array.from(
        new Set(
          notificationRows
            .map((n) => n.actor_id)
            .filter((id): id is string => Boolean(id && isUuid(id)))
        )
      );
      const actorMap = new Map<string, IdeaAuthor>();
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", actorIds);
        (profiles || []).forEach((p) => {
          actorMap.set(p.id, profileRowToAuthor(p));
        });
      }

      const mapped: IdeaNotification[] = notificationRows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        message: row.message,
        idea_slug: row.idea_slug,
        idea_title: row.idea_title,
        actor: (row.actor_id ? actorMap.get(row.actor_id) : undefined) || MOCK_AUTHORS[0],
        created_at: new Date(row.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        read: Boolean(row.read),
        target_tab: (row.target_tab as IdeaDetailTab | null) || undefined,
      }));
      persistNotifications(mapped);
    } else {
      persistNotifications([]);
    }
  } catch {
    // non-fatal hydration failure
  }
}

export function resetActiveUserSessionCache(): void {
  activeSessionUser = null;
  activeSessionProfile = null;
  memoryUserUpvotes.clear();
  cachedBookmarksRaw = null;
  cachedBookmarksList = EMPTY_BOOKMARKS;
  memoryNotifications = null;

  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY_UPVOTES);
      localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    } catch {
      // ignore storage errors
    }
    emitBrowserEvent(EVENT_PROFILE_UPDATED);
    emitBrowserEvent(EVENT_UPVOTES_UPDATED);
    emitBrowserEvent(EVENT_BOOKMARKS_UPDATED);
    emitBrowserEvent(EVENT_NOTIFICATIONS_UPDATED);
  }
}
