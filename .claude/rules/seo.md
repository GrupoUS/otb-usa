# SEO — Universal Tier 2 Rules

> Universal SEO + GEO do/don't. Portable to any project.
> Stack-specific config (sitemap plugin, JSON-LD injection, OG image generation) lives in the matching tech-stack skill.
> Project-specific values (canonical URL, contact phone, social handles) live in `.claude/config.json::project` or the project skill.

---

## Locale

Every public page sets `<html lang="...">` to the project's primary locale (e.g., `en-US`, `pt-BR`, `de-DE`). Wired in the root layout.

---

## Routes

Every route belongs to one of three categories:

| Type | SEO requirements |
|---|---|
| **Canonical static / dynamic** | OG image, JSON-LD when applicable, title ≤ 60 chars, description ≥ 120 chars |
| **Redirect-only** | 301 → external (or canonical internal); excluded from sitemap; emits `noindex` + `meta refresh` + `canonical` to destination |
| **Error / utility** (`/404`, `/500`) | `<meta name="robots" content="noindex">` |

> **Double-source rule:** if a slug exists both as a page **and** a redirect entry, the redirect wins at runtime. Remove the page once the redirect is canonical, or remove the redirect once the local page is canonical. Don't ship both.

---

## Sitemap

- Generated at build time by the framework's sitemap plugin.
- Filter excludes redirect-only paths — without exclusion, search engines split-index the slug **and** the redirect destination.
- Add to filter list in the **same commit** that adds a new redirect.
- Rebuild on every redirect change.

> Stack-specific sitemap plugin config → matching tech-stack skill.

---

## robots.txt

```
User-agent: *
Allow: /

Sitemap: https://<canonical-host>/sitemap-index.xml
```

Disallow only when the project ships staging routes that should not index.

---

## OG / Twitter cards

Set per page in the root layout:

| Field | Default |
|---|---|
| `og:title` | Page title |
| `og:description` | Page description |
| `og:image` | 1200 × 630 brand image (default fallback) |
| `og:locale` | Project locale |
| `og:type` | `website` (or `article` for posts) |
| `twitter:card` | `summary_large_image` |
| `twitter:title` | Page title |
| `twitter:description` | Page description |
| `twitter:image` | Same as `og:image` |

> Ensure the default OG image exists under `public/` (or framework asset folder). Pages without an explicit `ogImage` fall back to this default — without it, every page lacking explicit override emits a 404 reference.

---

## JSON-LD

### Organization (root layout, every page)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "<project name>",
  "url": "<canonical URL>",
  "logo": "<canonical URL>/<logo path>",
  "sameAs": ["<social URLs>"],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "<E.164>",
    "contactType": "<sales | customer service | …>",
    "areaServed": "<country code or region>",
    "availableLanguage": ["<language>"]
  }
}
```

### BreadcrumbList (deep pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "<canonical URL>" },
    { "@type": "ListItem", "position": 2, "name": "<page name>", "item": "<page URL>" }
  ]
}
```

### Other schemas (FAQ, Event, Product, Article)

When a page has matching content, emit the corresponding schema. Validate against [Schema.org](https://schema.org) + Google Rich Results Test before merge.

---

## CWV thresholds

| Metric | Threshold |
|---|---|
| LCP | < 2.5s |
| CLS | 0 |
| INP | < 100ms |
| Initial JS | < 50KB on prerendered pages |

Strategies:
- Hero image with eager loading + `fetchpriority="high"`.
- Preconnect to font / asset hosts.
- Explicit `width` / `height` on every image.
- Idle / on-visible hydration for non-LCP islands.

---

## AI citation (GEO)

LLM search engines cite content based on:

- **Description** ≥ 120 characters, unique per page. Feeds `<meta name="description">` and AI snippets.
- **Tagline** ≤ 90 characters — distills the core promise.
- **Working CTAs** — broken destinations hurt LLM citation confidence.
- **Server-rendered meta** — every meta tag must be present in the static HTML payload (not injected client-side).
- **Plain-language phrasing** aligned with project voice — see project brand skill.

---

## Stack & project signals

| Surface | Load |
|---|---|
| Sitemap plugin config, JSON-LD injection, framework SEO helpers | matching tech-stack skill |
| Canonical URL / contact phone / social handles | `.claude/config.json::project` or project skill |
| Brand voice / locale-specific phrasing | matching project skill |

---

## When to load more

| Need | Load |
|---|---|
| Pages, components, hydration, a11y, perf | `.claude/rules/frontend.md` |
| Tokens, typography, motion | `.claude/rules/DESIGN.md` |
| Universal stability checklist | `.claude/rules/stability.md` |
| Cardinal rules + routing matrix | `.claude/CLAUDE.md` + root `AGENTS.md` |
| Framework-specific SEO config | matching tech-stack skill |
| Project canonical values / brand voice | matching project skill |
