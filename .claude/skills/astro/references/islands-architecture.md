# Islands Architecture

## Concept

Islands = interactive JavaScript widgets floating in static HTML. Astro renders everything to HTML by default, then selectively hydrates islands.

```
┌─────────────────────────────────────────┐
│  Static HTML (zero JS, server-rendered) │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │ React Island │  │  Vue Island     │  │
│  │ client:load  │  │  client:visible │  │
│  └──────────────┘  └─────────────────┘  │
│                                         │
│  Static HTML continues...               │
└─────────────────────────────────────────┘
```

## Client Directives

Only framework components (React, Vue, Svelte, etc.) accept `client:*` directives. Astro components NEVER use them.

### client:load

Loads and hydrates immediately on page load.

```astro
<CountdownTimer client:load targetDate={eventDate} />
```

**Use for**: Critical interactive UI that must work immediately (auth forms, live data, countdown timers).

### client:idle

Loads when the browser becomes idle (uses `requestIdleCallback`).

```astro
<ChatWidget client:idle />
```

**Use for**: Non-critical above-fold widgets that can wait a moment.

### client:visible

Loads only when the component enters the viewport (uses `IntersectionObserver`).

```astro
<FAQAccordion client:visible items={faqData} />
<Testimonials client:visible data={testimonialData} />
```

**Use for**: Below-fold interactive content. Best for performance.

### client:hover

Starts loading when user hovers over the component.

```astro
<VideoPlayer client:hover />
```

**Use for**: Components triggered by user intent (previews, tooltips).

### client:only="framework"

Renders ONLY on client. Skips server-side rendering entirely.

```astro
<Canvas3D client:only="react" />
```

**Use for**: Components that cannot server-render (WebGL, browser-only APIs). Must specify framework string.

### server:defer (Server Islands — Astro 5+)

Deferred server rendering. Main page sends immediately, island renders async.

```astro
<UserProfile server:defer>
  <div slot="fallback">Loading...</div>
</UserProfile>
```

**Use for**: Personalized content, dynamic server data without blocking page.

## Best Practices

1. **Default to `.astro`** — Only use React/Vue when interactivity is required
2. **Prefer `client:visible`** — Lazy loads, best performance
3. **Use `client:load` sparingly** — Only for immediately-needed interactivity
4. **Each island is isolated** — Islands run independently, share no state by default
5. **Mix frameworks** — Different islands can use different frameworks on same page
6. **Keep islands small** — Less JS = faster hydration

## Data Passing to Islands

Islands receive props serialized from server. Only pass serializable data:

```astro
---
// ✅ Plain objects, arrays, strings, numbers, booleans
const data = { name: "test", items: [1, 2, 3] };

// ❌ Functions, Dates (serialize first), class instances
---
<MyIsland client:visible data={data} />
```

## Hydration Errors

Common causes:
1. **Server/client mismatch** — Component renders differently on server vs client
2. **Date/timezone** — Server renders UTC, client renders local time
3. **Random values** — `Math.random()` differs between server and client
4. **Browser-only APIs** — `window`, `document` not available on server

Fix: Use `client:only` for browser-dependent components, or guard with `typeof window !== 'undefined'`.

## Known case: FAQ accordion (React island)

**Goal:** Expand/collapse answer panels without Framer Motion animating **layout height** (`height: 0` ↔ `"auto"`), which conflicts with project rules (jank, INP, and “no height tweens” in Motion).

**Pattern (Na Mesa Certa / approved):**

1. **Panel wrapper:** CSS **grid** on the collapsible region — e.g. `grid` with `grid-template-rows: 0fr` (collapsed) vs `1fr` (expanded), plus `transition` on `grid-template-rows`. Inner child: `min-h-0 overflow-hidden` so content clips cleanly.
2. **Framer Motion (optional):** Use only for **non-layout** motion on the trigger — e.g. chevron `rotate` / `opacity`. Call `useReducedMotion()` and skip those tweens when the user prefers reduced motion.
3. **A11y:** `button` with `aria-expanded`, `aria-controls` → `id` on the region; region with `role="region"` (or appropriate role), `aria-labelledby`, and `aria-hidden` on the hidden branch when collapsed (pattern used in `FAQAccordion.tsx`).
4. **Directive:** `client:visible` is appropriate — FAQ is below the fold.

```tsx
// ❌ Avoid: AnimatePresence + motion.div height for the answer body
// ✅ Prefer: grid rows 0fr/1fr on a wrapper; Motion only on icon if needed

<div
  className="grid transition-[grid-template-rows] duration-300 ease-out"
  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
>
  <div className="min-h-0 overflow-hidden">{children}</div>
</div>
```

**See also:** `references/performance.md` → *Animation Performance* (accordion exception).

## Island Communication

Islands are isolated but can communicate via:
1. **Custom events** — `dispatchEvent` / `addEventListener`
2. **Shared stores** — nanostores, signals
3. **URL state** — Query params, hash
4. **DOM** — Shared parent elements

```tsx
// nanostores example (works across framework islands)
import { atom } from 'nanostores';
export const $count = atom(0);
```
