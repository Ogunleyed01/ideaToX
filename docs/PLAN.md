# Phased Development Plan (AI-Agent Execution Roadmap)

> **Instructions for AI Coding Agent:** Execute these phases sequentially. Do not move to the next milestone until the current milestone builds cleanly with zero TypeScript errors.

## Milestone 1: Project Scaffolding & Database Setup (Completed)
- [x] **Task 1.1:** Initialize Next.js 16 App Router project with TypeScript and Tailwind CSS.
- [x] **Task 1.2:** Install UI primitives with custom editorial tokens and anti-slop guidelines.
- [x] **Task 1.3:** Set up Supabase client packages (`@supabase/ssr`, `@supabase/supabase-js`) and configure `.env.local` template.
- [x] **Task 1.4:** Generate full SQL migration (`supabase/migrations/20261104000000_init_schema.sql`) for all 6 tables, triggers, indexes, and RLS policies.
- [x] **Task 1.5:** Implement GitHub and Google OAuth sign-in flow (`components/auth-modal.tsx`), callback route (`app/auth/callback/route.ts`), and automatic profile creation trigger.

## Milestone 2: The Seed Engine & Discovery Feed (Read Path) (Completed)
- [x] **Task 2.1:** Create `/data/seed-ideas.json` containing 50+ high-quality, structured software/hardware project ideas across Beginner, Intermediate, and Advanced tiers.
- [x] **Task 2.2:** Write a seed script (`npm run db:seed`) to populate `public.ideas`, `public.profiles`, `feature_requests`, `builds`, and `comments`.
- [x] **Task 2.3:** Build the Main Feed UI (`app/page.tsx`):
  - Responsive Bento Grid of `IdeaCard` components.
  - Multi-filter bar (Category, Difficulty, Target Region, Collab Status, Sort by Upvotes/Newest).
  - Debounced search bar querying title, hook, and tags.

## Milestone 3: Idea Creation & AI Spec Helper (Write Path)
- [x] **Task 3.1:** Build `/ideas/new` route with a Zod-validated multi-step or structured form.
- [x] **Task 3.2:** Add an **"Auto-Expand with AI"** button inside the form: user types a rough 1-line thought, hits the button, and a Server Action calls Gemini API to auto-fill the Problem Statement, 5 MVP features, and Suggested Tech Stack.
- [x] **Task 3.3:** Build the Single Idea Detail View (`app/ideas/[slug]/page.tsx`) showing full problem statement, interactive MVP checklist, author card, and action bar.

## Milestone 4: "Git for Ideas" (Forks, Feature PRs, & Shipped Builds)
- [x] **Task 4.1:** Implement Upvote/Star toggle with optimistic UI updates.
- [x] **Task 4.2:** Build the **Fork Modal/Page**: pre-fills the creation form with an existing idea's data, allows the user to pivot the niche/features, saves with `parent_idea_id`, and displays a visual "Forked from..." badge + Lineage Tree on the idea page.
- [x] **Task 4.3:** Build the **Feature Pull Request Tab** on the Idea Detail page:
  - Users can submit a proposed feature addition/removal.
  - Idea owner sees "Approve & Merge" or "Decline" buttons, which automatically updates the idea's `mvp_features` list.
- [x] **Task 4.4:** Build the **"Shipped / Building" Showcase Modal**: allows developers to link their GitHub repository and live demo URL to an idea.

## Milestone 5: Viral Slot Machine & Open-Source Polish
- [x] **Task 5.1:** Build the **Chaos Idea Slot Machine** component on the landing page hero section (3 spinning reels: Niche + Problem + Constraint) with a "Turn this into a Full Idea" CTA.
- [x] **Task 5.2:** Configure dynamic OpenGraph image generation (`app/ideas/[slug]/opengraph-image.tsx`) using `next/og` so shared links render branded cards on X, LinkedIn, and WhatsApp.
- [x] **Task 5.3:** Write `README.md`, `CONTRIBUTING.md`, and `.env.example` for open-source contributors.

## Milestone 6: Architectural Discussions & Builder Profiles (Completed)
- [x] **Task 6.1:** Build **Threaded Comments / Discussions System** on Idea Detail view (`/ideas/[slug]`):
  - 2-level nested replies (`parent_comment_id`) with inline reply composers.
  - Interactive like toggling with optimistic count updates.
  - Pre-seeded realistic technical architecture debates & author responses.
  - Quick architectural prompt starter chips.
- [x] **Task 6.2:** Build **User Profile & Reputation System** (`/profile/[username]` and `/profile`):
  - Dynamic developer badge engine (*"Ideator"*, *"Remixer"*, *"Shipper"*, *"Architect"*).
  - High-craft Obsidian Telemetry Console with score calculation (+10/star, +25/fork, +50/shipped build, +30/merged PR).
  - Tabbed portfolio for Authored Specs, Fork Remixes, and Shipped Proof-of-Work builds.
  - Direct author attribution links across Idea Cards, Lineage Trees, and Sidebar cards.

## Milestone 7: The Idea Bank & Discovery Feed Engine (Completed)
- [x] **Task 7.1:** Build dedicated **Explore & Idea Bank Feed** (`/ideas`):
  - Responsive Bento Grid and Detailed List view of all 50+ project blueprints.
  - Multi-dimensional filter controls: Category, Difficulty tier, Target Region (dynamically extracted), Collaboration status, and Shipped Proof-of-Work status.
  - Multi-criteria sorting: Most Upvotes (Stars), Newest, Most Forked, Most Shipped Builds.
  - Real-time debounced search bar querying title, hook, problem statement, and suggested stack tags.
  - Telemetry counter with active filter indicators and 1-click filter reset.
  - Direct Fork Modal branching and optimistic Star/Upvote toggling.
- [x] **Task 7.2:** Enhance **Global Command Palette (⌘K)**:
  - Dynamically search across all live specifications from anywhere in the app with keyboard shortcuts.
- [x] **Task 7.3:** Extend **Dynamic Island Navigation** & User Profile:
  - Add "Explore (50+)" to `FloatingNavbar` and update cross-page anchor routing.
  - Add "Starred Specs" portfolio tab to User Profile (`/profile/[username]`).
  - Add Discovery CTA banner to landing page Curated Blueprints gallery.

## Milestone 8: The Official About & Platform Architecture Page (`/about`) (Completed)
- [x] **Task 8.1:** Build `/about` page with strict Editorial Daylight Canvas (`#FAF9F6`), dual pastel auroras, and Obsidian hardware consoles:
  - Executive story: The "GitHub + Dribbble" for software specifications and project blueprints.
  - The 4 Core Mechanics visual breakdown (Structured Specs, Chaos Synthesizer, Git Lineage Branching, Shipped Showcase).
  - The Reputation Algorithm & Badges telemetry matrix (Ideator, Remixer, Shipper, Architect).
  - Open-source manifesto, architectural principles, and tech stack disclosures.
  - Direct links in `FloatingNavbar` and `ObsidianMegaFooter`.

## Milestone 9: Builder Collaboration Requests & Team Formation Engine (Completed)
- [x] **Task 9.1:** Build **Collaboration Request Modal** on Idea Detail view (`/ideas/[slug]`):
  - When an idea is marked `Seeking Co-Founder / Builder`, allow authenticated builders to pitch their role (Frontend, Systems/Backend, AI/ML, Hardware, Mobile).
  - Provide contact handle (GitHub, Discord, X, Email) and personal portfolio link.
  - Store collaboration requests in state and database schema.
- [x] **Task 9.2:** Build **Collaborators & Team Roster HUD** on Idea Detail page:
  - Idea owners can view incoming collaboration pitches, accept or pass, and manage active collaborators.
  - Display accepted team members on the specification header.

## Milestone 10: AI Coding Agent Exporter & GitHub PRD Tooling (Completed)
- [x] **Task 10.1:** Build **"Export for AI Coding Agents" Modal** on `/ideas/[slug]`:
  - 1-click optimized system prompts for **Cursor**, **Windsurf**, **Antigravity**, and **Claude Code** including architectural constraints, stack rules, and checkable MVP milestones.
  - 1-click **GitHub Issue / PRD Markdown** download and copy button.

## Milestone 11: Developer Profile Settings & Builder Inbox Notifications (Completed)
- [x] **Task 11.1:** Build **Developer Profile Editor & Account Settings** (`/settings`):
  - Editorial Daylight + Obsidian live architect badge preview with 1-click portrait presets and custom avatar URL support.
  - Full persistence of `full_name`, `headline`, `bio`, `location`, `availability`, `preferred_stack`, GitHub/X/Discord/website endpoints, and contact email via `localStorage` overrides + live propagation across blueprints/profiles + optional Supabase `public.profiles` sync when signed in.
  - Direct navigation entry points in `FloatingNavbar`, `/profile/[username]`, Builder Inbox footer, and `ObsidianMegaFooter`.
- [x] **Task 11.2:** Build **Builder Notification & Activity Center ("Builder Inbox")**:
  - `NotificationDrawer` slide-over inbox triggered from `FloatingNavbar` with live unread counter badge (`subscribeNotifications`).
  - Category filters (`All`, `Unread`, `PRs & Collabs`, `Forks & Stars`), 1-click *Mark all read*, and deep-link navigation straight to `/ideas/[slug]?tab=...` (`prs`, `team`, `builds`, `lineage`, `discussions`).
  - Automatic notification emission on stars, lineage forks, Feature PR submissions, proof-of-work builds, threaded discussions, and collaboration pitches.

## Milestone 12: Shareable Collections, Hosting Cost Estimator & System Topology (Completed)
- [x] **Task 12.1:** **Shareable Filter URLs, Curated Collections & Reading List**:
  - Two-way URL query parameter synchronization in `/ideas` (`q`, `category`, `difficulty`, `region`, `collab`, `status`, `collection`, `sort`, `view`) with 1-click *Copy Filter URL* sharing inside a `<Suspense>` boundary.
  - 5 Curated Blueprint Playlists (*Weekend Portfolio Quickstarts*, *Autonomous AI Agent Specs*, *Local-First & Offline Systems*, *Hardware & IoT Weekend Hacks*, and personal *Want to Build* reading list).
  - Live `localStorage` Bookmark ("Want to Build") toggles synced across `IdeaCard`, `/ideas/[slug]`, `/ideas`, and the `/profile/[username]` *Reading List* portfolio tab (`subscribeBookmarks`).
- [x] **Task 12.2:** **Infrastructure & Monthly Hosting Cost Estimator** (`lib/architecture.ts`, `components/infrastructure-estimator.tsx`):
  - Interactive scale toggle (`Hobby / MVP`, `Production`, `High Scale`) calculating realistic monthly provider spend across Compute, Database, Storage/Realtime, and AI/Transactional services, plus recommended packages and 1-line starter bootstrap CLI commands.
- [x] **Task 12.3:** **Visual System Architecture Topology & Mermaid Export** (`components/architecture-topology.tsx`, `components/spec-export-modal.tsx`):
  - Interactive dot-matrix node topology canvas with clickable architectural layers (`Surface`, `Compute`, `Data Store`, `External`), live payload flow protocol inspector, standalone `Mermaid .mmd` view/copy toggle, and embedded Mermaid diagrams + cost estimates in all *Export for AI* (`Cursor`, `Claude Code`, `GitHub SPEC.md`, `Mermaid & Infra`) outputs.

## Milestone 13: Real Production Supabase Authentication & Persistence (Completed)
- [x] **Task 13.1:** **Idempotent v2 Database Schema, Triggers & RLS Migration** (`supabase/migrations/20261111000000_production_auth_and_persistence.sql`, `types/database.ts`, `types/idea.ts`):
  - Added `SECURITY DEFINER` counter/merge triggers for `stars_count`, `forks_count`, `comment_likes`, and Feature PR blueprint appends so mutations succeed cleanly under strict RLS.
  - Extended `public.profiles` (`full_name`, `headline`, `location`, `availability`, `preferred_stack`, `x_handle`, `discord_handle`, `website_url`, `contact_email`, `updated_at`) and added RLS-protected `public.bookmarks`, `public.collaboration_requests`, and `public.notifications` tables.
- [x] **Task 13.2:** **Global Auth Session, Developer Passport & PKCE Middleware** (`components/auth-provider.tsx`, `components/auth-passport-form.tsx`, `components/auth-modal.tsx`, `app/auth/page.tsx`, `app/auth/callback/route.ts`, `lib/supabase/middleware.ts`, `lib/supabase/client.ts`):
  - Built unified `AuthProvider` (`useAuth()`, `requireAuth()`) with real Email/Password Sign In, Sign Up, Password Reset / Update, Magic Link OTP, live provider capability detection (`/api/supabase/status`, `/auth/v1/settings`), and ready-to-enable GitHub & Google OAuth triggers.
  - Protected `/ideas/new`, `/settings`, and exact `/profile` at both Edge middleware and page boundaries, hardened `/auth/callback` open-redirect guards + `token_hash` verification, and ensured automatic `public.profiles` provisioning via `ensureProfileExists`.
- [x] **Task 13.3:** **Authenticated Ownership Enforcement & Cross-Device Postgres Sync** (`lib/ideas.ts`, `components/floating-navbar.tsx`, `app/ideas/new/page.tsx`, `app/ideas/[slug]/page.tsx`, `app/settings/page.tsx`, `app/profile/**`, `components/idea-card.tsx`, `components/fork-modal.tsx`, `components/collaborate-modal.tsx`):
  - Enforced true `user.id === idea.author_id` ownership checks for Feature PR merge/decline and collaboration request acceptance/rejection while gating all write mutations behind `requireAuth()`.
  - Wired `@username` handle uniqueness updates with URL preview, Account Security password updates in `/settings`, owner-only `Reading List` / `EDIT PROFILE` controls on `/profile/[username]`, and live Postgres + `localStorage` cache hydration across user sessions.
