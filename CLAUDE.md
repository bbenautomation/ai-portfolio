# Portfolio Website — Project Guide

## Project Overview

Personal portfolio website. Goal: a distinctive, memorable design that avoids generic AI-slop aesthetics. Every decision should feel intentional and specific to the person it represents.

---

## Design Philosophy

This project uses the `front-end-skill.md` / `taste-skill.md` anti-slop design system. Before writing any code, read the brief and commit to a clear aesthetic direction.

### Before touching code

1. State a **Design Read** in one line: *"Reading this as: \<page kind> for \<audience>, with a \<vibe> language, leaning toward \<aesthetic family>."*
2. Set the **Three Dials** based on the design read:
   - `DESIGN_VARIANCE` — 1 (symmetrical) to 10 (asymmetric chaos). Default for developer portfolio: **6**
   - `MOTION_INTENSITY` — 1 (static) to 10 (cinematic). Default for developer portfolio: **5**
   - `VISUAL_DENSITY` — 1 (art gallery) to 10 (cockpit). Default for developer portfolio: **4**
3. Dial values from `front-end-skill.md` Section 1.B: Portfolio (Developer) → `6 / 5 / 4`

---

## Stack

- **Framework:** React / Next.js (Server Components by default; `'use client'` only for interactive islands)
- **Styling:** Tailwind v4 (`@tailwindcss/postcss`, NOT the v3 plugin)
- **Animation:** `motion/react` (`import { motion } from "motion/react"`)
- **Icons:** `@phosphor-icons/react` (first choice), `@tabler/icons-react` (second). Never hand-rolled SVG paths. Never `lucide-react` unless already in `package.json`.
- **Fonts:** `next/font` or self-hosted `@font-face`. Never `<link>` to Google Fonts in production.

---

## Hard Design Rules

### Typography
- **No Inter as default.** Use `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or similar distinctive sans.
- **No Fraunces or Instrument_Serif** as display serifs. Serifs only when the brief genuinely calls for editorial/luxury/heritage.
- Display headlines: `text-4xl md:text-6xl tracking-tighter leading-none`
- Body: `text-base text-gray-600 leading-relaxed max-w-[65ch]`
- Italic with descenders (`y g j p q`) in display type: `leading-[1.1]` min + `pb-1` reserve.

### Color
- Max 1 accent color. Saturation < 80%.
- No AI-purple gradients as default. Use neutral bases (Zinc / Slate / Stone) + a single sharp accent.
- One palette for the whole page. No warm/cool gray mixing within the same project.
- No pure `#000000` or `#ffffff` — use off-black (zinc-950) and off-white.

### Layout
- `min-h-[100dvh]` for full-height sections. Never `h-screen`.
- Contain layouts: `max-w-[1400px] mx-auto` or `max-w-7xl`.
- Hero: headline ≤ 2 lines, subtext ≤ 20 words, CTA visible without scroll, top padding max `pt-24`.
- Hero stack: max 4 text elements (optional eyebrow, headline, subtext, CTAs). No tagline below CTAs.
- Navigation: single line at desktop, height ≤ 80px.
- No 3-column equal feature cards. No centered hero when `DESIGN_VARIANCE > 4`.
- Grid over flex-math: use `grid grid-cols-1 md:grid-cols-3` not `w-[calc(33%-1rem)]`.

### Motion
- Animate only `transform` and `opacity`. Never `top`, `left`, `width`, `height`.
- No `window.addEventListener('scroll')`. Use `motion/react` `useScroll()`, GSAP ScrollTrigger, IntersectionObserver, or CSS `animation-timeline`.
- No `useState` for continuous values (mouse position, scroll progress). Use `useMotionValue` / `useTransform`.
- Every animation must have a reason: hierarchy, storytelling, feedback, or state transition.
- `prefers-reduced-motion` must be respected for any `MOTION_INTENSITY > 3`.

### Banned Patterns (AI Tells)
- **Em-dash (`—`) is completely banned.** Zero. Anywhere. Use a hyphen, comma, period, or two sentences.
- No section-numbering eyebrows (`001 · Work`, `00 / INDEX`).
- No eyebrow on every section — max 1 eyebrow per 3 sections.
- No decorative status dots before nav items or list rows.
- No scroll cues (`Scroll`, `↓ scroll`, `Scroll to explore`).
- No version labels in hero (`V0.6`, `BETA`, `EARLY ACCESS`).
- No locale/city/weather strips (`Lisbon 14:23 · 18°C`) unless the brief explicitly calls for it.
- No decoration text strip at hero bottom (`BRAND. MOTION. SPATIAL.`).
- No pills/labels overlaid on images.
- No div-based fake product screenshots.
- No middle-dot (`·`) overuse — max 1 per line in metadata strips.
- No split-header pattern (left giant headline + right floating paragraph). Stack vertically instead.
- No duplicate CTA intent on the same page (one label per action).
- One marquee max per page.

### Images
- Use Picsum with descriptive seeds: `https://picsum.photos/seed/{descriptive-slug}/{w}/{h}`
- No text-only pages — even minimal designs need 2-3 real images.
- No hand-rolled decorative SVGs.

### Dark Mode
- Design for both light and dark from the start.
- One theme per page — no section mid-page inversions.
- Test in both modes before finishing.

---

## Pre-Flight Before Delivering Code

Run through these before saying a task is done:

- [ ] Zero em-dashes (`—`) anywhere visible
- [ ] Page has ONE theme (no section flips)
- [ ] One accent color used consistently everywhere
- [ ] One corner-radius scale applied consistently
- [ ] Every CTA text passes WCAG AA contrast (4.5:1)
- [ ] No CTA label wraps to 2+ lines at desktop
- [ ] Eyebrow count ≤ ceil(sectionCount / 3)
- [ ] Hero fits viewport: headline ≤ 2 lines, CTA visible
- [ ] No `h-screen` — using `min-h-[100dvh]`
- [ ] No `window.addEventListener('scroll')`
- [ ] Reduced motion wrapped for `MOTION_INTENSITY > 3`
- [ ] Mobile collapse explicit for every multi-column layout
- [ ] No AI tells from the banned patterns list above
- [ ] Real images used (Picsum seed or generated), not div-based fakes
- [ ] Copy self-audit: no grammatically-broken or hallucinated phrases

---

## Skill Files

Full reference material lives in:
- [front-end-skill.md](front-end-skill.md) — comprehensive anti-slop frontend system (sections 0–14)
- [taste-skill.md](taste-skill.md) — design thinking, aesthetic direction, typography/color/motion guidelines
