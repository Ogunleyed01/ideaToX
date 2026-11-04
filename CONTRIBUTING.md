# Contributing to IdeaToX

Thank you for your interest in contributing to **IdeaToX** — the open-source "GitHub + Dribbble for Project Ideas"!

IdeaToX exists to bridge the gap between raw ideation and shipped software architecture. We believe that developers should have access to structured, validated project specifications and a git-like lineage system to fork and refine ideas before burning sprint cycles.

---

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Ways to Contribute](#ways-to-contribute)
3. [Local Development Setup](#local-development-setup)
4. [Adding New Curated Project Ideas](#adding-new-curated-project-ideas)
5. [Architecture & Coding Standards](#architecture--coding-standards)
6. [Testing & Verification](#testing--verification)
7. [Submitting a Pull Request](#submitting-a-pull-request)

---

## Code of Conduct
We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please treat all contributors with respect, deliver constructive feedback, and focus on collaborative code quality.

---

## Ways to Contribute
You can contribute to IdeaToX in several impactful ways:
- **Seed the Idea Bank:** Add high-signal, real-world software ideas to `data/seed-ideas.json`.
- **Implement Core Features:** Pick up an unassigned task from `docs/PLAN.md` or submit improvements to existing modules.
- **Report & Fix Bugs:** Open an issue with clear reproduction steps, or submit a bug-fix PR.
- **Improve Documentation:** Enhance guides, API documentation, or architecture explanations.

---

## Local Development Setup

### Prerequisites
- **Node.js:** v20.x or higher
- **Package Manager:** `npm`, `pnpm`, or `bun`

### Setup Steps
1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/ideatox.git
   cd ideatox
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   > **Note:** IdeaToX runs with full functionality out of the box using pre-seeded JSON data and built-in heuristic synthesizers. You can explore the feed, slot machine, fork engine, and idea pages without needing immediate Supabase or Gemini credentials.

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Adding New Curated Project Ideas
We welcome submissions of high-quality project ideas to `data/seed-ideas.json`! Every idea must adhere to our structural quality standards:

### Quality Invariants
1. **No Unstructured Walls of Text:** Ideas must be broken down into structured fields.
2. **Title:** Concise and technical (3–8 words).
3. **1-Sentence Hook:** Clear value proposition under 140 characters.
4. **Problem Statement:** 2–3 sentences explaining the exact pain point, who experiences it, and why current solutions fail.
5. **MVP Features:** Array of at least 3 concrete, checkable technical capabilities.
6. **Difficulty Tier:**
   - `beginner`: "Weekend Build" (12–24h, minimal 3rd-party dependencies)
   - `intermediate`: "Side Project" (1–2 weeks, multi-service or local database)
   - `advanced`: "Full SaaS" (Production architecture, distributed systems, hardware, or complex auth)
7. **Category:** `web` | `mobile` | `ai` | `cli` | `hardware` | `extension`
8. **Target Region:** `Global` or specific country (e.g., `Nigeria`, `India`, `Kenya`, `US`, `Germany`).

---

## Architecture & Coding Standards

### Tech Stack
- **Framework:** Next.js 15+ (App Router), React 19
- **Language:** TypeScript in Strict Mode (`noImplicitAny`, strict null checks)
- **Styling:** Tailwind CSS + Vanilla CSS tokens
- **Icons:** `lucide-react`
- **Validation:** `zod`
- **Animation:** `framer-motion`

### Component Guidelines
- **Server Components by Default:** Fetch data and render static layouts on the server (`app/page.tsx`, `app/ideas/[slug]/layout.tsx`).
- **Leaf-Level Client Components:** Apply `"use client"` only to interactive UI controls (e.g., search/filter bars, slot machines, fork modals, upvote toggles).
- **Aesthetic Identity:** Adhere to the "Cosmos × Vela × Aureon" design language outlined in `docs/UI_SKILL.md`:
  - Deep obsidian base canvas (`#060608`)
  - Subtle double-bezel frames with specular top-rim lighting
  - Monospace telemetry labels (`text-[10px] tracking-[0.16em] uppercase`)
  - Curated HSL color accents (teal `#2dd4bf`, amber `#fbbf24`, violet `#a855f7`)

---

## Testing & Verification
Before opening a Pull Request, you MUST verify that your changes introduce zero TypeScript or prerender build errors:

```bash
# 1. Type Check
npx tsc --noEmit

# 2. Production Build Validation
npm run build
```

Both commands must exit cleanly with code `0`.

---

## Submitting a Pull Request
1. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat(slot-machine): add turn into full idea CTA action"
   ```
3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a Pull Request against the `main` branch with:
   - A clear description of the problem solved
   - Screenshots or video recordings of UI changes
   - Confirmation that `npm run build` passes with zero errors

Thank you for helping make IdeaToX the premier home for builders worldwide! 🚀
