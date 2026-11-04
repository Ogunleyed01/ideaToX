# IdeaToX — Project Agent Rules & Architectural Guardrails

You are an expert Full-Stack TypeScript Engineer building **IdeaToX**, an open-source "GitHub + Dribbble for Project Ideas" platform.

## 1. Source of Truth Documents
Before planning or writing code for any feature, always reference the project specification files:
- Frontend Design System & Anti-Slop Rules: @docs/UI_SKILL.md
- Product Requirements: @docs/PRD.md
- Database & Architecture: @docs/SYSTEM_DESIGN.md
- Phased Roadmap: @docs/DEVELOPMENT_PLAN.md
- Seed Data Bank: @scripts/seed-ideas.json

## 2. Workflow & Antigravity Execution Protocol
- **Incremental Execution:** Never attempt to build the entire application in one turn. Follow `@docs/DEVELOPMENT_PLAN.md` one task at a time.
- **Plan First:** When starting a new Milestone, generate an Implementation Plan first, verify file paths, and execute cleanly.
- **Self-Verification:** After generating or modifying components or Server Actions, run `npm run build` or `npx tsc --noEmit` to verify there are zero TypeScript or Next.js build errors before concluding your turn.
- **Seed First, Auth Second:** Ensure the Discovery Feed and Idea Slot Machine work seamlessly using fallback/seeded data from `@scripts/seed-ideas.json` even if Supabase environment variables are not yet connected.

## 3. Tech Stack & Coding Standards
- **Framework:** Next.js 15+ (App Router), React 19, TypeScript (Strict Mode).
- **Component Architecture:**
  - Default to **React Server Components (RSC)** for data fetching (`app/page.tsx`, `app/ideas/[slug]/page.tsx`).
  - Use `"use client"` strictly at the leaf level for interactive UI (Search/Filter bar, Chaos Slot Machine, Upvote button, Fork modal).
- **Styling & UI:** Tailwind CSS + `shadcn/ui` + `lucide-react` icons. Use a sleek, high-contrast developer aesthetic (dark-mode friendly, subtle borders, pill badges for Difficulty & Region).
- **Validation & Mutations:** Use **Next.js Server Actions** validated with `zod` for all mutations (`createIdeaAction`, `forkIdeaAction`, `submitFeaturePRAction`, `mergeFeaturePRAction`).
- **Database:** Supabase (`@supabase/ssr`). Always respect the exact column names defined in `@docs/SYSTEM_DESIGN.md`:
  - `category`: `'web' | 'mobile' | 'ai' | 'cli' | 'hardware' | 'extension'`
  - `difficulty`: `'beginner' | 'intermediate' | 'advanced'`
  - `collab_status`: `'open' | 'seeking_cofounder'`

## 4. Core Domain Invariants
1. **No Unstructured Idea Posts:** Every idea MUST have a `title`, `slug`, `hook` (max 140 chars), `problem_statement`, and `mvp_features` (JSON array of strings).
2. **Git-Style Lineage:** When an idea is forked, always store `parent_idea_id` referencing the original idea's UUID and increment `forks_count` on the parent.
3. **No Built-in DMs or DRM:** Do not build real-time chat or IP locks. Collaboration happens via `feature_requests` (Feature PRs), `comments`, and external profile links.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
