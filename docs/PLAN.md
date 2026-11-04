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