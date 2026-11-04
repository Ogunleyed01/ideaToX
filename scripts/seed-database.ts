import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local or .env if present
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...rest] = trimmed.split("=");
          if (key && rest.length > 0) {
            const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your-project.supabase.co")) {
  console.log(`
========================================================================
💡 IdeaToX Database Seed Engine
========================================================================
[WARNING] Supabase environment variables not configured in .env.local:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)

To populate a live Supabase database:
  1. Copy .env.example to .env.local
  2. Fill in your project URL and service role key from Supabase Dashboard > Settings > API
  3. Run 'npm run db:seed' again!

(Note: IdeaToX runs seamlessly in local-first in-memory mode using pre-seeded
data from data/seed-ideas.json even without live database credentials).
========================================================================
`);
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🌱 Starting IdeaToX Database Seed...");
  console.log(`🔗 Target Supabase URL: ${supabaseUrl}`);

  // 1. Read Seed Ideas JSON
  const seedFile = path.resolve(process.cwd(), "data", "seed-ideas.json");
  if (!fs.existsSync(seedFile)) {
    console.error(`❌ Seed file not found at ${seedFile}`);
    process.exit(1);
  }

  const rawIdeas = JSON.parse(fs.readFileSync(seedFile, "utf-8"));
  console.log(`📦 Loaded ${rawIdeas.length} blueprints from ${path.basename(seedFile)}`);

  // 2. Seed Mock Profiles
  const mockAuthors = [
    {
      id: "a0000000-0000-0000-0000-000000000001",
      username: "adebayo_codes",
      full_name: "Adebayo Ogunlesi",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Staff Distributed Systems Engineer. Passionate about offline-first architectures, edge telemetry, and open protocol design.",
      github_url: "https://github.com",
      twitter_url: "https://x.com",
      location: "Lagos, Nigeria",
      reputation_score: 1420,
      badges: ["Ideator", "Shipper", "Architect"],
    },
    {
      id: "a0000000-0000-0000-0000-000000000002",
      username: "sarah_systems",
      full_name: "Sarah Chen",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      bio: "Compiler geek & local-first researcher. Architecting resilient distributed state engines and zero-trust sync protocols.",
      github_url: "https://github.com",
      twitter_url: "https://x.com",
      website_url: "https://sarahchen.dev",
      location: "San Francisco, CA",
      reputation_score: 2850,
      badges: ["Ideator", "Remixer", "Architect"],
    },
    {
      id: "a0000000-0000-0000-0000-000000000003",
      username: "maboroshi_io",
      full_name: "Kenji Sato",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "Systems tinkerer & hardware hacker. Specializing in embedded ESP32 mesh networks and low-latency WebSockets.",
      github_url: "https://github.com",
      twitter_url: "https://x.com",
      location: "Tokyo, Japan",
      reputation_score: 3910,
      badges: ["Ideator", "Shipper", "Remixer"],
    },
    {
      id: "a0000000-0000-0000-0000-000000000004",
      username: "elena_arch",
      full_name: "Elena Rostova",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      bio: "Platform engineer & open-source contributor. Focused on developer tooling, zero-config CLI ergonomics, and Nix derivations.",
      github_url: "https://github.com",
      twitter_url: "https://x.com",
      location: "Berlin, Germany",
      reputation_score: 980,
      badges: ["Ideator", "Remixer"],
    },
    {
      id: "a0000000-0000-0000-0000-000000000005",
      username: "you_builder",
      full_name: "You (Active Builder)",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      bio: "Full-Stack builder & active IdeaToX contributor exploring high-leverage software architectures and production apps.",
      github_url: "https://github.com",
      twitter_url: "https://x.com",
      location: "Global",
      reputation_score: 520,
      badges: ["Ideator", "Remixer", "Shipper"],
    },
  ];

  console.log("👤 Upserting architect profiles...");
  for (const author of mockAuthors) {
    const { error } = await supabase.from("profiles").upsert(author as any, { onConflict: "id" });
    if (error) {
      console.warn(`  - Warning upserting profile ${author.username}:`, error.message);
    }
  }

  // 3. Insert Ideas
  console.log("💡 Inserting specification blueprints...");
  let insertedCount = 0;

  for (let idx = 0; idx < rawIdeas.length; idx++) {
    const raw = rawIdeas[idx];
    const author = mockAuthors[idx % mockAuthors.length];
    const upvotes = ((idx * 37 + 19) % 280) + 24;
    const forks = ((idx * 7 + 3) % 45) + 2;
    const builds = (idx % 3) + 1;

    const { data: ideaRecord, error: ideaErr } = await supabase
      .from("ideas")
      .upsert(
        {
          slug: raw.slug,
          author_id: author.id,
          title: raw.title,
          hook: raw.hook,
          problem_statement: raw.problem_statement,
          mvp_features: raw.mvp_features,
          category: raw.category,
          difficulty: raw.difficulty,
          target_region: raw.target_region || "Global",
          collab_status: raw.collab_status || "open",
          suggested_stack: raw.suggested_stack || [],
          upvotes_count: upvotes,
          forks_count: forks,
          builds_count: builds,
          is_seeded: true,
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (ideaErr) {
      console.warn(`  - Error inserting idea ${raw.slug}:`, ideaErr.message);
      continue;
    }

    insertedCount++;

    if (ideaRecord) {
      // 4. Insert Feature PRs
      if (idx % 2 === 0) {
        const prProposer = mockAuthors[(idx + 1) % mockAuthors.length];
        await supabase.from("feature_requests").insert([
          {
            idea_id: ideaRecord.id,
            proposer_id: prProposer.id,
            action_type: "add_feature",
            feature_text: "WebAuthn / Passkey passwordless biometric authentication",
            rationale: "Reduces onboarding drop-off by 40% on mobile browsers and prevents credential stuffing.",
            status: "pending",
          },
          {
            idea_id: ideaRecord.id,
            proposer_id: mockAuthors[(idx + 2) % mockAuthors.length].id,
            action_type: "add_feature",
            feature_text: "Offline background sync with IndexedDB fallback cache",
            rationale: "Critical for users on intermittent 3G connections in emerging regions.",
            status: "approved",
          },
        ]);
      }

      // 5. Insert Shipped Builds
      const builder = mockAuthors[(idx + 3) % mockAuthors.length];
      await supabase.from("idea_builds").insert({
        idea_id: ideaRecord.id,
        builder_id: builder.id,
        status: idx % 3 === 0 ? "shipped" : "building",
        repo_url: `https://github.com/ideatox-community/${raw.slug}`,
        live_url: idx % 3 === 0 ? `https://${raw.slug}.preview.ideatox.space` : null,
        notes: "Alpha prototype functioning on Vercel Edge Runtime. Contributions welcome on GitHub!",
      });

      // 6. Insert Comments
      const commentAuthor = mockAuthors[(idx + 1) % mockAuthors.length];
      const { data: rootComment } = await supabase
        .from("comments")
        .insert({
          idea_id: ideaRecord.id,
          user_id: commentAuthor.id,
          content: "Have you considered how conflict resolution would work if two nodes mutate state offline at the same time? A state-based CRDT or JSON patch log might provide stronger convergence guarantees than last-write-wins.",
          likes_count: 7,
        })
        .select("id")
        .single();

      if (rootComment) {
        await supabase.from("comments").insert({
          idea_id: ideaRecord.id,
          user_id: author.id,
          parent_comment_id: rootComment.id,
          content: "We evaluated Yjs and Automerge; leaning towards Yjs since it compiles nicely to WebAssembly and works cleanly across browser workers without memory ballooning.",
          likes_count: 12,
        });
      }
    }
  }

  console.log(`\n✅ Database seeding complete! ${insertedCount} blueprints loaded.`);
}

seed().catch((err) => {
  console.error("❌ Seed script failed:", err);
  process.exit(1);
});
