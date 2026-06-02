---
name: improve-proof-conversion
description: Design-improve chain (bolder+animate+colorize) proof — Speakers, Investimento, FAQ, Footer, WhatsAppFloatingButton. Crimson accent applied, gold CTA preserved.
metadata:
  type: project
---

## Files touched

| File | Change summary |
|---|---|
| `Speakers.astro` | Cards now have rounded-2xl border + `card-glow-hover-crimson`. Avatar ring transitions gold→crimson-bright on hover (conic gradient swap). Instagram badge uses `border-crimson-mid-35 / text-crimson-bright`. Area label is a crimson pill (`bg-crimson-tint-10`). `landing-mesh-usa` ambient bg added (opacity-30). Stagger reveals preserved. |
| `Investimento.astro` | Escassez badge → `border-crimson-mid-35 bg-crimson-tint-10 text-crimson-bright` (pill). Active lote border/bg → `border-crimson-mid-45 / bg-crimson-tint-10`; status badge → crimson pill. Price (`US$ 3.500`) → `text-gradient-crimson`. Benefits checkmarks: every 3rd icon uses crimson (`i % 3 === 0`). CTA primary remains gold (untouched). |
| `FAQ.astro` | Chevron icon: `group-open:border-crimson-mid-35 group-open:bg-crimson-tint-10 group-open:text-crimson-bright`. Answer panel gets `border-l-2 border-crimson-mid-35` left accent bar. `faq-answer` class added for scoped animation selector. `list-style: none` Firefox fix. `prefers-reduced-motion` block preserved. |
| `Footer.astro` | Map-pin icon → `text-crimson-bright`. Bottom copyright row → tiny crimson dot (`bg-crimson-tint-16 border border-crimson-mid-35`). Legal disclaimer + routes INTACT. |
| `WhatsAppFloatingButton.astro` | Hover/focus shadow adds outer ring `color-mix(in_srgb,var(--color-crimson-bright)_30%,transparent)`. Logic, message, helper, gold bg UNTOUCHED. |

## Autocheck — Maestro 6 gates

| Gate | Status |
|---|---|
| Zero hex hardcoded in .astro | PASS — all color-mix refs use CSS vars; conic gradients use var(--color-*) inline style |
| prefers-reduced-motion covered | PASS — global.css covers all CSS; FAQ scoped block preserved; no new JS motion |
| Gold CTA preserved | PASS — Investimento primary CTA remains `bg-gold text-navy`; WhatsApp button remains `bg-gold` |
| WhatsApp SSOT intact | PASS — no wa.me inline; helper unchanged; message untouched |
| faq[0] legal text preserved | PASS — only wrapper/chevron/answer-panel classes touched; resposta verbatim from JSON (not hardcoded) |
| Crimson body text rule | PASS — crimson used only on badges, borders, icons, glow, gradient price (large display). Body copy stays text-text-muted/primary/gold |

**Why: ** Confirms design-improve chain (bolder+animate+colorize) applied cleanly without violating cardinal rules or copy SSOT.
