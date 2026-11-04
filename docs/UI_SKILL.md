# Skill: IdeaToX UI/UX Design System & Anti-Slop Guidelines
> Reference: `github.com/anthropics/skills --skill frontend-design`

## 1. Core Aesthetic Philosophy
IdeaToX rejects generic dark-mode AI templates. It pairs an airy, high-craft **Editorial Daylight Micro-Dot Canvas (`#FAF9F6`)** with **Dual Pastel Auroras (Lavender `#A5B4FC` & Butter-Amber `#FDE047`)**, punctuated by **High-Contrast Obsidian Hardware Consoles (`#0D0E12`)** and **Mixed Sans + Italic Serif + Inline Icon Pill** typography.

---

## 2. Strict Anti-Slop Guardrails (Mandatory)
- **NEVER** use a flat dark-gray page background for the main discovery and marketing flow; always use `.bg-dot-matrix` (`#FAF9F6` with `1.15px` `#D4D4D8` radial dots at `18px` spacing).
- **NEVER** write plain monotonous headings. Every primary section heading MUST pair `font-sans font-semibold tracking-[-0.035em] text-[#111113]` with at least one `font-serif italic font-normal` word and/or an inline dark squircle icon badge (`bg-[#111113] text-white rounded-xl`).
- **NEVER** use generic unstyled boxes. White Bento containers use `rounded-[28px] bg-white border border-zinc-200/80 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.06)]`. Dark recessed consoles use `rounded-[22px] bg-[#0D0E12] text-white border border-white/[0.08]`.

---

## 3. Color & Surface Tokens
- **Canvas Base (`--bg-canvas`):** `#FAF9F6` (Alabaster Paper)
- **Primary Ink (`--text-primary`):** `#111113` (Deep Charcoal)
- **Secondary Ink (`--text-secondary`):** `#52525B` (Zinc 600)
- **Ghost Narrative Ink:** `#C4C4C8`
- **Obsidian Studio Console & Mega-Footer:** `#0D0E12`
- **Aurora Left (Periwinkle/Lavender):** `radial-gradient(circle, rgba(165,180,252,0.42) 0%, rgba(196,181,253,0.18) 45%, transparent 70%)`
- **Aurora Right (Butter/Amber):** `radial-gradient(circle, rgba(253,224,71,0.40) 0%, rgba(251,191,36,0.16) 45%, transparent 70%)`
- **Semantic Status Pills (Inside Dark Console):**
  - `Successful / Shipped`: `bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`
  - `Follow-up / Seeking Dev`: `bg-amber-500/15 text-amber-300 border border-amber-500/30`

---

## 4. Required Page Architecture & Component Patterns
1. **Floating Dynamic Island Navbar:** Centered `#111113` pill (`max-w-md`) with logo, quick links, and compact action button.
2. **Hero Stage:** Mixed Sans + Inline Terminal Glyph + Italic Serif headline, tilted `-rotate-6` / `rotate-6` floating proof cards, rotated `45deg` diamond stack tiles, and ecosystem logo bar.
3. **Narrative Reveal Manifesto:** Large mixed-weight editorial paragraph with inline overlapping circles, status pills, and progressive text hierarchy.
4. **Split Light/Dark Studio Showcase:** Left light interactive spec builder + Right dark `#0D0E12` console containing the **3-Reel Synthesizer**, **LED Dot-Matrix Equalizer**, and **Live Lineage Status Rows**.
5. **Dual Persona Bento Grid:** Left card with 3-tier stacked metric bars & sparklines; Right card with an interactive **94% SVG Circular Ring Gauge** and orbiting stack squircles.
6. **Interactive AI Spec Sandbox:** Floating white prompt card over a dual purple/amber aurora that compiles a 1-line idea into an instant pass/fail architecture audit.
7. **Minimal Hairline FAQ Accordion:** Clean `border-b border-zinc-200` accordion with `+` and `×` triggers.
8. **Superpowers Pre-Footer CTA & Obsidian Mega-Footer:** Rounded top corners (`rounded-t-[36px] bg-[#0F1015]`) featuring a giant edge-to-edge `font-serif` **IdeaToX** wordmark at the bottom.