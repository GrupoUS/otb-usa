# Design — Universal Tier 2 Rules

> Universal design do/don't. Portable to any project.
> Project tokens (color palette, typography pairing, brand utilities, glow / glass / depth) live in the project's brand / theme skill — Claude auto-loads via skill description match.
> Tech-stack syntax (Tailwind v4 `@theme`, vanilla-extract, CSS Modules, etc.) lives in the matching tech-stack skill.

---

## 1. Color

### Do
- Use **semantic tokens** (`bg-background`, `text-foreground`, `bg-primary`, `border-border`) or named brand utilities. Tokens carry meaning; the implementation can swap freely.
- Hex values live **only** in the design-token source file (e.g., `:root` CSS variables, `@theme` block, theme config). Never inline.
- Validate every foreground / background pair against WCAG before commit.
- Status (success / warning / destructive) is communicated with **color + icon + text** — never color alone.

### Don't
- Hardcode hex outside the design-token source file (`bg-[#hex]`, `text-[#hex]`, `style="color:#hex"`).
- Use pure black `#000` or pure white `#fff` for body text on a colored background — drop a step on the neutral scale instead.
- Cross-mode bleed: importing light tokens into a dark-only project (or vice versa).
- Color as the **sole** signal for state, status, or focus.

### Contrast minimums (WCAG AA)
| Surface | Ratio |
|---|---|
| Body text | ≥ 4.5:1 |
| Large text (18pt / 14pt bold) | ≥ 3:1 |
| Non-text UI (icons, borders, focus rings) when informative | ≥ 3:1 |

---

## 2. Typography

### Do
- One heading family + one body family — total typographic system has at most two type families.
- **Sentence case** in headlines. UPPERCASE only on badges / status pills with letter-spacing (≥ 0.04em).
- `tabular-nums` on currency, KPI counters, dates, anything aligned in columns.
- Heading-to-body ratio ≥ 2x at the largest viewport.
- Minimum font size: 12px.

### Don't
- More than two type families (excludes monospace for code).
- ALL CAPS in body or headings (limit to badges).
- Font size < 12px on any viewport.
- Justified text (creates rivers, hurts readability).

---

## 3. Components

### Buttons

- Hierarchy: **primary** (one per view, drives the conversion), **secondary** (alternative path), **ghost** (low-emphasis nav / utility), **destructive** (red / warning, confirms-required).
- Touch target: **≥ 44 × 44 px** on mobile, ≥ 36 × 36 px on desktop.
- Focus ring on `:focus-visible`: 2px solid + 2px offset.
- Icon-only buttons require `aria-label`.
- Active state via `transform: scale(0.98)` (or any tactile press effect you like).

### Cards

- Padding scales by viewport: smaller on mobile, larger on desktop.
- Hover lift: `transform: translateY(-Npx)` + optional `scale(1.0X)`, or richer choreography — go bold.
- Borders: ghost (low-contrast) by default; named token color on premium / focus.

### Inputs

- Padding: `px-4 py-3` (or equivalent ≥ 12px / ≥ 16px).
- `:focus-visible` ring (2px solid + 2px offset), uses focus token color.
- Placeholder ≤ 0.6 opacity vs body text — never primary color.
- Disabled: `opacity 0.5` + `cursor-not-allowed`.

### Badges / pills

- `rounded-full`, 11–12px font, weight 500, letter-spacing 0.04em, UPPERCASE.
- Padding `px-3 py-1` (or equivalent).

---

## 4. Layout

- 8px spacing grid — every margin / padding / gap is a multiple of 8 (or 4 in tight UI).
- Container: max-width pattern (`max-w-7xl mx-auto px-6 lg:px-8` or equivalent).
- Asymmetric splits (7/5, 8/4) for hero. Avoid 50/50 — visually static.
- Section vertical spacing: generous on desktop (≥ 96px), compressed on mobile (≥ 64px).

### Responsive breakpoints

| Breakpoint | Behavior |
|---|---|
| Mobile (< 640px) | Single column, hamburger nav, sticky CTA bar |
| Tablet (640–1024px) | 2-col grids, condensed nav |
| Desktop (≥ 1024px) | Full layout, 3-col grids, asymmetric hero |
| Wide (≥ 1280px) | Edge-to-edge `max-w-7xl`, generous gutters |

---

## 5. Border radius

- Use a discrete radius scale (e.g., `sm` / `md` / `lg` / `xl` / `2xl` / `full`).
- Pills + avatars + icon buttons: `rounded-full`.
- Inputs + default buttons: medium (`rounded-md`).
- Cards: large (`rounded-lg` / `rounded-xl`).
- Modals: largest (`rounded-2xl`).
- Never inline `border-radius: <px>` — token only.

---

## 6. Iconography

### Do
- **One icon library** per project. Choose and stick with it.
- Named imports only — supports tree-shaking.
- Decorative icons: `aria-hidden="true"`.
- Icon-only buttons: `aria-label` required.
- Inherit color via `currentColor` — color hop via `text-*` utility on parent.

### Don't
- Emoji as UI icons.
- Mix icon libraries (Material Symbols + Lucide + Font Awesome).
- `import * as Icons from '<lib>'` — defeats tree-shaking.
- Custom inline SVG (except logos).

---

## 7. Motion

Motion is encouraged — bold, dynamic, expressive. Animate freely.

### Allowed (anything)
- `transform` (translate, scale, rotate, skew, 3D), `opacity`, `filter` (`blur`, `brightness`, `drop-shadow`), `clip-path`, animated gradients.
- Layout properties — `width`, `height`, `top`, `left`, `padding`, `margin`, `border-width` — allowed when the effect calls for it.
- `transition: all` allowed.
- Accordion / disclosure may animate via `height`, CSS grid `0fr ↔ 1fr`, or native `<details>` — author's choice.

### Performance note (preference, not a rule)
- `transform` + `opacity` animate on the compositor (no layout / paint) — prefer them when they produce the *same* visual result, for smoother INP. Not mandatory; reach for layout-property animation when it unlocks the effect you want. Trade-off (INP / CLS / Lighthouse) is an accepted project decision.

### Required (accessibility only)
- `prefers-reduced-motion` honored on every animation:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- React / Framer islands wrap animations in the framework's reduced-motion hook.

### Suggested durations (tune freely)
- Hover / focus: ~150ms
- Reveal on scroll: ~300–600ms
- Page / hero choreography: as the moment deserves

---

## 8. Imagery

### Do
- Hero / above-fold: `loading="eager"` + `fetchpriority="high"`.
- Below-fold: `loading="lazy"` + `fetchpriority="low"`.
- Always explicit `width` + `height` (CLS = 0).
- Decorative: `alt=""` + `aria-hidden="true"`.
- Meaningful: descriptive `alt` (who + role + context, in project locale).
- Aspect ratios: hero 16:9 or 21:9; card 4:3; avatar 1:1.

### Don't
- Stock-clinical imagery on a brand-led product.
- Wrong priority on a competing LCP candidate.
- Missing dimensions → CLS spike.
- Lossy formats for vector-style content (use SVG).

---

## 9. Depth & elevation

Layer with whatever reads best — tonal contrast, shadow, glow, glass. Dramatic depth is welcome.

| Level | Surface | Effect |
|---|---|---|
| 0 | Page background | none |
| 1 | Section alternate | tonal step |
| 2 | Card | border + optional glow |
| 3 | Glass / blur | translucent + backdrop-blur (use liberally) |
| 4 | Hover lift | translate + shadow (soft or bold) |
| 5 | CTA halo | brand-color glow — use where it earns attention |
| 6 | Modal | large radius + heavy shadow + overlay |

Shadows and glows: soft *or* dramatic — your call. Big colored glows are fair game when they serve the design.

---

## 10. Focus & keyboard

- `:focus-visible` ring: 2px solid (brand focus token) + 2px offset.
- Never `outline: none` without replacement.
- `<button>` for actions, `<a href>` for navigation. Never `href="#"`.

---

## 11. Do's and Don'ts

| Do | Don't |
|---|---|
| Semantic tokens + named brand utilities | Hardcoded hex in components |
| Sentence case headlines | UPPERCASE outside badges |
| `tabular-nums` for numerics | Pure `#000` / `#fff` body text |
| One icon library, named imports | `import *` of icon library |
| 8px spacing grid | Inline custom CSS bypassing tokens |
| Soft *or* dramatic shadows / glow / glass | Flat, depthless surfaces when depth would help |
| `prefers-reduced-motion` honored | Ignoring `prefers-reduced-motion` |
| `<button>` actions / `<a>` nav | `href="#"` placeholders |
| Expressive motion (any property) | Janky motion with no reduced-motion fallback |
| Validate contrast before commit | Cross-mode bleed |

---

## 12. Stack & project signals

When the task touches **project tokens / brand voice / theme implementation**, load the matching project skill (e.g., a `<brand>-theme` skill).

When the task touches **stack-specific token syntax** (Tailwind v4 `@theme`, vanilla-extract, CSS Modules, styled-components), load the matching tech-stack skill.

---

## 13. When to load more

| Need | Load |
|---|---|
| Pages, components, hydration, content data, a11y plumbing | `.claude/rules/frontend.md` |
| Universal stability checklist | `.claude/rules/stability.md` |
| SEO meta / JSON-LD | `.claude/rules/seo.md` |
| Cardinal rules + routing matrix | `.claude/CLAUDE.md` |
| Project tokens / brand voice | matching project skill |
| Stack-specific token syntax | matching tech-stack skill |
