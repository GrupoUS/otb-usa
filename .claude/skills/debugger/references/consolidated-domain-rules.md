# Consolidated Domain Rules

Na Mesa Certa — Premium Event Landing Page.
Stack: Astro 6 (SSG) + React 19 (Islands) + Tailwind CSS v4 + Framer Motion + Lucide React.
Deploy: Railway (static site). Package manager: Bun.

> **Cross-reference:** `.claude/skills/astro/` — Full Astro 6 reference with detailed guides.

Use this file when a bug spans components, styling, performance, accessibility, or build issues.

---

## 1. Astro Component Rules

### Static sections (`.astro` files only)

- Hero, PainPoints, Methodology, Benefits, `ScheduleSection`, `PricingSection`, SpeakersGrid, `HostessSection`, CTASection, MobileCTABar must be `.astro` components.
- Never use React for static sections — Astro ships zero JS by default.
- Use Content Collections (`getCollection`) for all dynamic data (speakers, benefits, FAQ items, testimonials). Never hardcode content data in component markup.
- Use `<Image>` from `astro:assets` for all images — provides automatic optimization, format conversion, and explicit dimensions.
- Semantic HTML hierarchy: `<h1>` in Hero only, `<h2>` for each section title, `<h3>` for items within sections. Never skip heading levels.

### Content Collections contract (Astro 6)

- **Astro 6 infers schemas automatically** from JSON/YAML/MD files in `src/content/<collection>/`.
- **No `src/content/config.ts` needed** — Astro 6 detects collection structure from file contents.
- Components fetch via `getCollection("collectionName")` or `getEntry("collection", "id")`.
- **Data flow to React islands:** `getCollection('x').then(items => items.map(i => i.data))` — always map to `.data` before passing as props.
- If data shape changes, update the JSON files directly. Types are auto-generated.

> See `astro` skill → `references/content-collections.md` for full patterns.

### Astro anti-patterns to flag

- Hardcoded content arrays inside `.astro` files instead of Content Collections
- Using `<img>` instead of Astro `<Image>` from `astro:assets`
- Missing `alt` text on images
- Multiple `<h1>` tags on the page
- Importing React components without `client:*` directive
- Using `ViewTransitions` instead of `ClientRouter` (Astro 6)
- Creating `src/content/config.ts` (Astro 6 infers schemas — no config needed)
- Using `client:*` directive on `.astro` components (only works on framework components)
- Passing `CollectionEntry` objects directly to React islands (must map to `.data`)
- Using `@tailwind base/components/utilities` (Tailwind v4 uses `@import "tailwindcss"`)

---

## 2. React Islands Rules

### Allowed Islands (strict limit: 3)

| Component             | Directive        | Purpose                          |
| --------------------- | ---------------- | -------------------------------- |
| `CountdownTimer.tsx`  | `client:load`    | Real-time countdown to event     |
| `FAQAccordion.tsx`    | `client:visible` | Interactive expand/collapse      |
| `Testimonials.tsx`    | `client:visible` | Carousel with auto-play/swipe    |

- Adding a 4th React Island is forbidden. If interactivity is needed elsewhere, use CSS-only solutions or vanilla JS in `<script>` tags.

### Hydration mismatch prevention

```typescript
// Pattern: isMounted guard for client-only values
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);

// Use isMounted to gate client-only values like Date.now()
const targetDate = isMounted ? calculateTarget() : fallbackDate;
```

**Why:** Astro SSG renders at build time. Values like `Date.now()`, `window.innerWidth`, or `Math.random()` differ between server and client, causing hydration mismatches. Always provide a deterministic fallback for SSR and switch to live values after mount.

### Framer Motion: reduced motion contract

```typescript
import { useReducedMotion } from "framer-motion";

const shouldReduceMotion = useReducedMotion();

// Every animated component must respect this
const variants = shouldReduceMotion
  ? { initial: {}, animate: {} }
  : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
```

**Rule:** Every Framer Motion animation in every Island must call `useReducedMotion()` and disable animations when true. No exceptions.

### FAQ accordion: expand/collapse without Framer `height`

- **Do not** drive the answer panel with `AnimatePresence` + `motion.div` `height: 0` ↔ `auto` (layout thrash, conflicts with “no height animation” guidance).
- **Do** use a **CSS grid** wrapper: outer `grid` with `grid-template-rows: 0fr` (collapsed) ↔ `1fr` (expanded), inner `min-h-0 overflow-hidden`, and `transition-[grid-template-rows]` (or equivalent). Chevron rotation can stay on Framer with **only** `rotate` / `opacity` — no panel height tweens.
- Wire `aria-expanded`, `aria-controls`, and `role="region"` / `aria-hidden` on the collapsible region per the accordion pattern.

### Lucide React

- Avoid deprecated icons (e.g. **`Instagram`** was removed upstream). For “@handle” affordance use **`AtSign`** or another stable icon.

### React Islands anti-patterns to flag

- Island without `client:*` directive (renders server-only, no interactivity)
- `client:load` on non-critical Islands (use `client:visible` for below-fold)
- Direct `Date.now()` or `new Date()` in render without isMounted guard
- Missing `useReducedMotion()` in any Framer Motion usage
- Large dependency imports inside Islands (keep bundle small)
- Framer Motion animating **accordion panel height** (`height` to `"auto"`) instead of CSS grid `0fr`/`1fr`

---

## 3. Tailwind CSS v4 Rules

### Theme configuration (Tailwind v4 — CSS-first)

- **No `tailwind.config.js`** — Tailwind v4 uses CSS-first configuration.
- Configured as Vite plugin: `@tailwindcss/vite` in `astro.config.mjs`.
- Use `@theme` directive in CSS for custom design tokens (`--color-*`, `--font-*`).
- Use `@utility` directive for custom utility classes.
- Use `@import "tailwindcss"` (not `@tailwind base/components/utilities`).
- GPUS theme palette: dark navy background + gold accents. All defined as semantic tokens.

> See `astro` skill → `references/styling-tailwind.md` for Tailwind v4 patterns.

### Semantic token contract

```css
/* Required semantic tokens */
--color-background    /* Dark navy base */
--color-foreground    /* Light text on dark */
--color-primary       /* Gold accent */
--color-primary-foreground
--color-muted
--color-muted-foreground
--color-border
```

- Use `bg-background`, `text-foreground`, `bg-primary`, `text-primary`, etc.
- Never hardcode hex values (`#1a1a2e`, `#d4af37`, etc.) in components.
- Custom utilities: `.glass-card`, `.bg-mesh`, `.bg-noise` from GPUS theme.

### Tailwind anti-patterns to flag

- Hardcoded hex colors (e.g., `bg-[#1a1a2e]`, `text-[#d4af37]`)
- `transition: all` (animate only specific properties)
- `outline-none` without a replacement focus style
- Arbitrary values that duplicate existing semantic tokens
- Inline styles that could be Tailwind classes
- Using `tailwind.config.js` (Tailwind v4 uses `@theme {}` in CSS)
- Using `@astrojs/tailwind` integration (Tailwind v4 uses `@tailwindcss/vite` plugin)
- Dynamic class name assembly via concatenation (purged in build — use complete strings)

---

## 4. Performance Rules

### Lighthouse 95+ is non-negotiable

| Metric | Target    | How                                                    |
| ------ | --------- | ------------------------------------------------------ |
| LCP    | < 2.5s   | Preload hero image, use Astro `<Image>` with priority  |
| CLS    | 0         | Explicit `width`/`height` on all images and embeds     |
| FID    | < 100ms  | Minimal JS — only 3 React Islands                      |
| TBT    | < 200ms  | `client:visible` for below-fold Islands                |

### Animation performance

- Only animate `transform` and `opacity` (GPU-composited properties) in Framer Motion.
- Never animate `width`, `height`, `top`, `left`, `margin`, `padding` in Motion or other JS-driven layout tweens.
- **Exception (approved):** accordion show/hide via **CSS** `grid-template-rows: 0fr` ↔ `1fr` (browser handles layout; not a Framer `height` tween).
- Use `will-change: transform` sparingly and only on elements that actually animate.

### Font loading

- Use `font-display: swap` on all custom fonts.
- Preload critical font files in `<head>`.
- Limit font weights/styles to what is actually used.

### Image optimization

- All images through Astro `<Image>` component from `astro:assets` (automatic WebP/AVIF).
- Hero image: `loading="eager"` + `fetchpriority="high"` (LCP candidate).
- Below-fold images: `loading="lazy"` (Astro default).
- Always specify `width` and `height` to prevent CLS.
- Use `<Picture>` component for multiple format fallbacks (`formats={['avif', 'webp']}`).

> See `astro` skill → `references/performance.md` for complete image optimization guide.

### Performance anti-patterns to flag

- `<img>` tags without explicit dimensions
- Large unoptimized images (check `dist/` output sizes)
- React Islands using `client:load` when `client:visible` suffices
- CSS animations on layout properties
- Unused CSS/JS in the bundle

---

## 5. Accessibility Rules

### WCAG AA minimum

- Contrast ratio: 4.5:1 for normal text, 3:1 for large text.
- Gold on dark navy must meet contrast — verify with tooling.

### Focus management

- All interactive elements must have visible focus states.
- Focus style: gold outline (`outline-primary` or equivalent).
- Use `focus-visible:` to avoid focus rings on mouse clicks.
- Tab order must be logical (follows DOM order).

### Keyboard navigation

- FAQ Accordion: arrow keys to navigate items, Enter/Space to toggle.
- Testimonial Carousel: arrow keys or swipe, pause on focus.
- MobileCTABar: all actions reachable via keyboard.
- **Skip link:** first focusable control skips to `main#conteudo-principal` (main must accept focus when targeted, e.g. `tabindex="-1"`).
- **Legal:** footer links to `/termos` and `/politica-de-privacidade` must be real routes, not `href="#"`.
- **No-JS:** static sections using `[data-reveal]` need a `<noscript>` fallback so content is not permanently hidden.

### ARIA contract

- Icon-only buttons must have `aria-label`.
- FAQ items use `aria-expanded` and `aria-controls`.
- Carousel uses `aria-live="polite"` for slide changes.
- Sections use `aria-labelledby` pointing to their heading.

### `prefers-reduced-motion` contract

- Every Framer Motion component must use `useReducedMotion()`.
- CSS animations must have `@media (prefers-reduced-motion: reduce)` fallbacks.
- Countdown timer must work without animation (numbers update, no transitions).

### Accessibility anti-patterns to flag

- `outline-none` without `focus-visible` replacement
- Icon button without `aria-label`
- Missing `alt` text on images
- Heading level skips (h1 -> h3)
- Auto-playing carousel without pause control
- Color as the only means of conveying information

---

## 6. Build & Deploy Rules

### Bun only (non-negotiable)

```bash
bun install        # Install dependencies
bun run dev        # Dev server
bun run build      # Production build -> dist/
bun run preview    # Preview production build
bunx astro check   # Type checking
```

- Never use `npm`, `yarn`, or `pnpm`. Not even for one-off commands.
- Use `bunx` instead of `npx`.

### Railway deploy

- Build command: `bun run build`
- Output directory: `dist/`
- Static site deployment (no server runtime needed).
- Environment variables (if any) configured in Railway dashboard.

### Build anti-patterns to flag

- `npm install`, `yarn add`, or `pnpm add` in any script or CI config (use `bun add` only)
- Missing `dist/` in deploy output configuration
- Dev dependencies leaking into production build
- Build warnings treated as acceptable (investigate all warnings)

---

## Systematic Audit Pack

### Audit execution order

1. Inventory all findings before fixing.
2. Classify severity (`P0` to `P3`).
3. Fix one issue at a time.
4. Re-run quality gates after each fix.
5. Run final full validation.

### High-signal checks

- Missing imports and type errors (`bunx astro check`)
- Hardcoded hex colors instead of semantic tokens
- Images without explicit dimensions (CLS risk)
- React Islands missing `useReducedMotion()`
- Hydration mismatches (client-only values without isMounted guard)
- `console.log` in production code
- Dead links and broken anchor references (including placeholder `#` on Termos/Privacidade)
- Icon buttons without `aria-label`
- Heading hierarchy violations

### Final gates

```bash
bunx astro check
bun run build
# Verify dist/ output size is reasonable
# Run Lighthouse on preview server
bun run preview
```

---

## Quick Triage Matrix

| Symptom                    | First Check                                                  |
| -------------------------- | ------------------------------------------------------------ |
| Hydration mismatch         | isMounted guard for client-only values (Date, window, Math)  |
| Layout shift (CLS)         | Missing width/height on images or embeds                     |
| Slow LCP                   | Hero image not preloaded, unoptimized format                 |
| Animation jank             | Animating layout properties instead of transform/opacity     |
| Focus not visible          | Missing focus-visible styles or outline-none without replace  |
| Build failure              | Run `bunx astro check` for type errors, check imports        |
| Island not interactive     | Missing or wrong `client:*` directive                        |
| Content not updating       | Content Collection schema mismatch or stale cache            |
| Accessibility violation    | Run axe audit, check contrast ratios, verify ARIA attrs      |
| Regression after fix       | Re-run all gates + focused visual/interaction retest         |
