# Product Requirements Document (PRD): IdeaToX

## 1. Executive Summary & Vision
**Product Name:** IdeaToX  
**Tagline:** The GitHub + Dribbble for Project Ideas.  
**Core Problem:** Growing developers struggle to decide what to build next, while domain experts and builders have valuable project ideas scattered across unstructured platforms (Reddit, X, static GitHub repos).  
**Solution:** An open-source discovery and version-control platform for project ideas where users can browse, filter, fork (remix), submit feature requests, and link shipped codebases to raw ideas.

## 2. Target Audience & User Personas
1. **The Builder (Junior-to-Mid Developer):** Wants structured, real-world project specs with clear MVP features to build for their portfolio or hackathons.
2. **The Ideator (Domain Expert / Non-Dev / Busy Senior Dev):** Has spotted a real-world problem and wants to document it openly or find a technical collaborator to bring it to life.
3. **The Remixer (Indie Hacker):** Wants to browse existing concepts, fork them for a specific country/niche, and validate demand before writing code.

## 3. Core Functional Requirements (MVP & v1.0)

### 3.1 Authentication & User Profiles
- **OAuth Login:** 1-click sign-in via GitHub and Google (powered by Supabase Auth).
- **Role/Badge System:** Auto-detect developer status via GitHub profile data; award dynamic badges ("Ideator", "Remixer", "Shipper").
- **External Contact Links:** Users can display GitHub, X (Twitter), LinkedIn, Discord, or Email links for collaboration requests.

### 3.2 Structured Idea Submission & Management
Users cannot post unstructured walls of text. Every idea requires:
- **Title & 1-Sentence Hook:** Max 140 characters.
- **Problem Statement:** Who is experiencing the pain and why?
- **Proposed MVP Features:** Array of checkable bullet points.
- **Metadata & Tags:**
  - *Category:* Web App, Mobile, CLI, AI/ML, Hardware/IoT, Browser Extension, API.
  - *Difficulty Tier:* Weekend Build (Beginner), Side Project (Intermediate), Full SaaS (Advanced).
  - *Target Region/Country:* Global, or country-specific (e.g., Nigeria, US, India, Europe).
  - *Suggested Tech Stack:* Optional tags (e.g., Next.js, Python, Flutter, Rust).
  - *Collaboration Status:* `Open Concept (Free to Build)` OR `Seeking Co-Founder / Builder`.

### 3.3 Discovery Feed & Idea Bank
- **Bento Grid Feed:** Dribbble/Pinterest-style visual cards showing the Hook, Difficulty Badge, Category, Region Tag, Star Count, Fork Count, and Shipped Count.
- **Search & Multi-Filter:** Instant full-text search + filtering by Category, Difficulty, Country, Collaboration Status, and "Unbuilt Only".
- **Pre-Seeded Idea Bank:** Database ships pre-populated with 100+ curated, high-quality project ideas.

### 3.4 "Git for Ideas" Mechanics
- **Star / Upvote:** Users can bookmark and upvote ideas.
- **Forking (Remixing) Engine:** Clicking "Fork Idea" clones the original idea's structure into a new draft, allowing a user to pivot the niche/region or stack while maintaining a `Forked from @user/idea-slug` lineage link.
- **Feature Pull Requests (PRs):** Any logged-in user can propose `+ Add Feature` or `- Remove Scope` on an existing idea. The idea owner can **Approve (Merge)** or **Decline** the suggestion.
- **Proof-of-Work ("Shipped" Showcase):** Developers can mark an idea as `Currently Building` or `Shipped` by submitting their GitHub Repo URL and Live Demo URL.

### 3.5 Viral & Interactive Features
- **The Chaos Idea Slot Machine:** A no-login-required interactive widget on the hero page that spins `[Target Audience] + [Core Problem] + [Wildcard Tech Constraint]` to generate fun build prompts, with 1-click sharing to X/LinkedIn and an "Auto-Spec with AI" button.
- **Dynamic OG Social Cards:** Every idea URL automatically generates a clean social preview card displaying the title, difficulty, and author for high click-through rates on social media.

## 4. Non-Goals (Out of Scope for v1.0)
- **No Built-in Real-Time Chat/DM Engine:** Use Threaded Comments on ideas and external social links on profiles instead.
- **No Escrow / Freelance Payment Processing:** Collaborators connect externally.
- **No DRM / "IP Piracy" Legal Locks:** All ideas posted are public concepts; private stealth ideas are excluded to keep the platform open and friction-free.