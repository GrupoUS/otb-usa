# Debugging Patterns & Checklists — GPUS Astro landing

Quick reference for static Astro/content/SEO debugging.

---

## Static Assertion Patterns

Prefer deterministic checks over visual guessing.

| Scenario | Pattern |
|---|---|
| Anchor exists | `grep -RIn 'id="<expected-anchor>"' dist/index.html` |
| Legacy domain absent | `grep -RIn '<legacy-domain>' . --exclude-dir=_archive --exclude-dir=dist` |
| Sitemap canonical only | inspect `dist/sitemap-0.xml` for `${project.productionUrl}/` only |
| OG image exists | check the default OG image under `public/og/` and generated `og:image` |
| WhatsApp helper only | grep `wa.me/` in `src` and allow only `src/lib/whatsapp.ts` |
| Static-only Astro | grep `ClientRouter`, `prerender = false`, SSR adapters |

---

## Content Collection Checks

```bash
bunx astro check
```

When an asset is referenced by `${content.productJson}`, verify the file exists under `public/`:

```bash
python -c "import json, pathlib; data=json.load(open('${content.productJson}', encoding='utf-8')); paths=[data['seo']['ogImage']]; missing=[p for p in paths if not pathlib.Path('public', p.lstrip('/')).exists()]; print(missing)"
```

Expected result: `[]`.

---

## UI / Accessibility Smoke

- One `<h1>` on the canonical page.
- Skip link points to `#conteudo-principal`.
- CTA anchors point to existing IDs.
- Focus-visible styles remain visible.
- No emoji icons; use Lucide/SVG.
- Reduced-motion users get reduced/disabled motion (`prefers-reduced-motion` honored).
- Static/no-JS fallback reveals content.

---

## SEO Smoke

| Check | Expected |
|---|---|
| `astro.config.mjs site` | `${project.productionUrl}` |
| `robots.txt` sitemap | `${project.productionUrl}/sitemap-index.xml` |
| Home canonical | `${project.productionUrl}/` |
| Stale/compatibility route | noindex/redirect fallback to `/` |
| Sitemap | only canonical URL(s), no stale route |
| OG/Twitter image | absolute URL to existing asset |
| Organization JSON-LD | Grupo US as organization, the product as product/page context |

---

## Legal/Copy Guardrails

- Product copy lives in `${content.productJson}`.
- Regulated-health (saúde estética) claims may be stated only as descriptive context.
- Never imply official affiliation, endorsement, certification, partnership, or diploma (PRODUCT.md § Guardrails).
- `Grupo US` is the parent brand; do not broaden CTAs to off-product programs.
- WhatsApp messages must start with `${lead.whatsappGreeting}`.

---

## Validation Commands

```bash
bun run lint
bunx astro check
bun run build
```

Full gate:

```bash
bun run lint && bunx astro check && bun run build
```
