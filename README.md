# IdeaToX 💡

> **The GitHub + Dribbble for Project Ideas.**  
> Discover validated project architectures, fork interactive technical specifications, and collaborate on software features before writing a single line of code.

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

---

## 🌟 The Problem
Growing developers struggle to decide what to build next, frequently abandoning projects due to vague scope. Meanwhile, domain experts and experienced builders have high-value project concepts scattered across Reddit, X, and forgotten notes.

**IdeaToX** solves this by treating project ideas like open-source repositories: structured, forkable, reviewable, and linked directly to working codebases.

---

## ✨ Core Features

### 🎲 1. The Chaos Idea Slot Machine
- **Hero-Integrated Generator:** Spin 3 mechanical reels — `[Target Audience / Niche]` + `[Core Friction / Problem]` + `[Architecture / Constraint]` — to break builder's block.
- **Lock & Roll:** Pin specific reels while re-spinning the others.
- **One-Click "Turn this into a Full Idea":** Automatically passes the synthesized concept to the AI spec assistant.
- **Viral Sharing:** Instantly share synthesized build challenges to 𝕏 (Twitter) and copy specs to clipboard.

### 🌿 2. "Git for Ideas" — Forks & Lineage Trees
- **Forking Engine:** Remix any idea to pivot the target region (e.g. adapting a global concept for Nigeria or India) or swap the tech stack.
- **Visual Lineage Tree:** Explore the upstream origin and downstream forks with interactive nodes, branch status, and contributor metrics.
- **Optimistic Star/Upvote:** Bookmark and vote for ideas with instant UI feedback.

### 🔀 3. Feature Pull Requests (PRs)
- **Collaborative Spec Evolution:** Community members can propose `+ Add Feature` or `- Remove Scope` with technical rationale.
- **Owner Review Flow:** Idea creators can **Approve & Merge** (automatically appending to the MVP feature checklist) or **Decline** submissions.

### 🚀 4. Proof-of-Work ("Shipped / Building") Showcase
- **Link Real Builds:** Developers can mark an idea as *Currently Building* or *Shipped to Production* by attaching their GitHub repository and live demo URL.
- **Community Proof:** Validate which conceptual architectures have successfully made it to production.

### 🤖 5. AI Spec Helper & Auto-Expansion
- **From 1-Line Thought to Complete Spec:** Enter a raw thought and let the Gemini-powered Server Action generate:
  - Concise technical title & 140-character hook
  - Root problem statement
  - 4-point MVP feature roadmap
  - Curated technology stack tags
- **Zero-Failure Fallback:** Includes a built-in deterministic heuristic synthesizer if API keys are not configured.

### 🖼️ 6. Dynamic OpenGraph Social Previews (`next/og`)
- Dynamic 1200x630 branded card generation at `/ideas/[slug]/opengraph-image.png`.
- Renders idea title, difficulty tier, category badge, MVP checklist items, stars, and author handle when shared across X, LinkedIn, Discord, and WhatsApp.

### 🔍 7. Discovery Bento Feed
- **Instant Full-Text Search:** Query across titles, hooks, and tech tags with zero latency.
- **Multi-Faceted Filtering:** Slice by Category (`Web`, `Mobile`, `AI`, `CLI`, `Hardware`, `Extension`), Difficulty (`Weekend Build`, `Side Project`, `Full SaaS`), Target Region, and Collaboration Status.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15+ App Router](https://nextjs.org) with React 19 |
| **Language** | [TypeScript](https://www.typescriptlang.org) (Strict Mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + Vanilla CSS tokens |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Validation** | [Zod v4](https://zod.dev) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Database & Auth** | [Supabase](https://supabase.com) (`@supabase/ssr`) |
| **AI Synthesis** | Google Gemini 1.5 Flash + Local Fallback Synthesizer |
| **OG Generation** | `@vercel/og` via `next/og` ImageResponse |

---

## 📁 Repository Directory Structure

```text
ideatox/
├── app/
│   ├── api/ai/spec/        # AI spec expansion route (Gemini + fallback)
│   ├── ideas/
│   │   ├── [slug]/
│   │   │   ├── layout.tsx  # Dynamic OpenGraph & Twitter metadata
│   │   │   ├── opengraph-image.tsx # next/og dynamic image card generator
│   │   │   └── page.tsx    # Idea detail view, tabs, PRs, lineage
│   │   └── new/
│   │       └── page.tsx    # Multi-step creation form & AI expansion
│   ├── globals.css         # Cosmos × Vela × Aureon design tokens
│   ├── layout.tsx          # Root shell layout & fonts
│   └── page.tsx            # Marketing hero, Chaos Slot Machine, Bento gallery
├── components/
│   ├── chaos-slot-machine.tsx # Hero 3-reel interactive slot machine
│   ├── fork-modal.tsx      # Modal for remixing and pivoting ideas
│   ├── idea-card.tsx       # Bento grid card with hover specular lighting
│   └── lineage-tree.tsx    # SVG/DOM interactive fork lineage visualizer
├── data/
│   ├── category-images.ts  # Curated Unsplash CDN category imagery
│   └── seed-ideas.json     # Pre-seeded bank of 50+ structured ideas
├── docs/
│   ├── PLAN.md             # Phased AI-Agent execution roadmap
│   ├── PRD.md              # Product requirements document
│   ├── SYSTEM_DESIGN.md    # SQL schema, RLS policies, architecture
│   └── UI_SKILL.md         # Design system & aesthetic direction
├── lib/
│   └── ideas.ts            # Data operations (upvotes, forks, PRs, builds)
├── types/
│   └── idea.ts             # TypeScript domain interfaces
├── .env.example            # Environment variables template
├── CONTRIBUTING.md         # Open-source contribution guidelines
└── README.md               # Main project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- npm, pnpm, or bun

### 2. Clone and Install
```bash
git clone https://github.com/your-username/ideatox.git
cd ideatox
npm install
```

### 3. Environment Variables
Copy the template to `.env.local`:
```bash
cp .env.example .env.local
```
*(Optional: Add `GEMINI_API_KEY` for live Google Gemini expansion; the app runs completely without it using the fallback synthesizer).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view IdeaToX.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## 🤝 Contributing
Contributions are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) guide before submitting ideas, bug fixes, or new features.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
