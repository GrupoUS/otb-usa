# SEO Optimization Playbook

> Generic SEO baseline. Project-specific routes/locale/branding live in `${overlay}/seo-supplement.md` (loaded by `performance-optimization` skill).

## Phase 0 — Discover First

Always confirm stack before implementation:

- Frontend framework + router (Next.js App Router · Astro · Remix · SvelteKit · Vite + TanStack Router · Nuxt · etc.)
- Existing `robots.txt` / `sitemap.xml` (real files vs SPA HTML fallback)
- Private + dynamic routes that must NOT be indexed
- Metadata strategy (global + route-level)

## Project baseline findings table

Use this table in every SEO execution report:

| # | Finding | Confidence (1-5) | Source | Impact |
|---|---|---|---|---|
| 1 | Current `robots.txt` status | 5 | `${paths.frontendRoot}/public/` + curl | High |
| 2 | Sitemap generation strategy | 5 | framework config + curl | High |
| 3 | Existing metadata patterns | 5 | `index.html` / layout component | Medium |
| 4 | Dynamic / private routes needing exclusion | 5 | router file (`routeTree.gen.ts`, `routes/`, `pages/`, `app/`) | High |
| 5 | Core Web Vitals current state | 4 | Lighthouse / PSI run | High |

## Edge cases (minimum)

1. Authenticated routes accidentally indexed (typically `/dashboard`, `/admin`, `/account`, `/settings`).
2. Tokenized routes indexed (e.g., `/unsubscribe/$token`, `/verify/$id`).
3. Missing canonical for public legal/onboarding pages.
4. Missing `og:image` absolute URL for public sharing.
5. Sitemap present but serving HTML fallback instead of XML.
6. `robots.txt` / `sitemap.xml` returning 200 with wrong content-type.

## Implementation strategies (per framework)

### A) Next.js App Router

Native metadata files:
- `app/robots.ts`
- `app/sitemap.ts`
- `metadataBase` in `app/layout.tsx`

Robots policy: disallow at least `/api/`, `/dashboard/`, `/admin/`, `/_next/`, `/auth/`. Include `sitemap` and `host`. Never globally block all crawlers.

### B) Astro

- `src/pages/robots.txt.ts` (or `public/robots.txt` static)
- `@astrojs/sitemap` integration in `astro.config.mjs`
- Per-page `<head>` metadata via layout slots

### C) Vite + client-side router (TanStack Router / React Router)

Static assets only:
- `${paths.frontendRoot}/public/robots.txt`
- `${paths.frontendRoot}/public/sitemap.xml` (or generate at build)

For dynamic SEO on a SPA stack, consider SSR / prerendering — pure SPA hurts indexability.

### D) Generic robots.txt template

```txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /admin/
Disallow: /auth/
# Add per-project private routes from ${overlay}/seo-supplement.md

# AI crawlers — opt-in only
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

Sitemap: ${project.productionUrl}/sitemap.xml
Host: ${project.productionUrl}
```

### Sitemap rules

- Include only public pages
- Exclude private + tokenized routes
- Include `<lastmod>` for every URL
- Use absolute URLs

## Metadata rules

- Always set `metadataBase` (Next.js) or equivalent base URL
- Title template per page (e.g., `%s | ${project.displayName}`)
- Canonical + OG/Twitter image metadata on every public page
- Meaningful images: descriptive `alt`. Decorative: empty `alt` + `aria-hidden`

## Schema.org (JSON-LD)

Minimum on home + key pages:
- `Organization` / `NGO` / `LocalBusiness` (per project type)
- `WebSite`
- `BreadcrumbList`
- Content-type-specific (`Article`, `Product`, `FAQPage`, `Event`, `Recipe`, etc.)

Project-specific schemas live in `${overlay}/seo-supplement.md`.

## CWV targets

Read from `.claude/config.json::gates`:
- LCP < `${gates.lcp}`ms
- INP < `${gates.inp}`ms
- CLS = `${gates.cls}`
- TTFB < 600ms

## Validation commands

```bash
# Robots and sitemap must be real files (not SPA HTML)
curl -I ${project.productionUrl}/robots.txt
curl -I ${project.productionUrl}/sitemap.xml

# Verify content type + payload start
python - <<'PY'
import urllib.request
for u in ['${project.productionUrl}/robots.txt', '${project.productionUrl}/sitemap.xml']:
    with urllib.request.urlopen(u, timeout=30) as r:
        body = r.read(80).decode('utf-8', errors='replace')
        print(u, r.status, r.headers.get('content-type'), repr(body))
PY

# PSI API SEO check
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${project.productionUrl}&strategy=mobile&category=seo&locale=${project.locale}" \
  | jq '{seo: (.lighthouseResult.categories.seo.score * 100 | round)}'
```

## Non-negotiable constraints

- Never index private areas (`/api/`, `/dashboard/`, `/admin/`, `/auth/`, project-specific private paths from overlay)
- Never apply Next.js-specific guidance to non-Next stacks
- Never ship sitemap entries without `lastmod`
- Never block all crawlers globally
- Never skip post-deploy curl validation

## Success criteria

- `/robots.txt` returns 200 with `text/plain` + expected disallow rules
- `/sitemap.xml` returns 200 with XML content-type + valid URL set
- URLs in sitemap return 200 + are public pages
- Lighthouse SEO score reaches `>= ${gates.lighthouse.seo}` on production
- Public pages have unique + stable title/description/canonical strategy

## AI-citation readiness (GEO)

- Author bylines, publication dates, source links — make it easy for LLM crawlers to cite
- Schema.org `Article` with `author`, `datePublished`, `dateModified`
- Avoid hidden text / cloaking — adversarial against LLM crawl
