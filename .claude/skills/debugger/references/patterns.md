# Debugging Patterns & Checklists — OTB USA

Quick reference for static Astro/content/SEO debugging.

---

## Static Assertion Patterns

Prefer deterministic checks over visual guessing.

| Scenario | Pattern |
|---|---|
| Anchor exists | `grep -RIn 'id="programa"' dist/index.html` |
| Legacy domain absent | `grep -RIn '<legacy-domain>' . --exclude-dir=_archive --exclude-dir=dist` |
| Sitemap canonical only | inspect `dist/sitemap-0.xml` for `https://otb.drasacha.com.br/` only |
| OG image exists | check `public/og/otb-default.jpg` and generated `og:image` |
| WhatsApp helper only | grep `wa.me/` in `src` and allow only `src/lib/whatsapp.ts` |
| Static-only Astro | grep `ClientRouter`, `prerender = false`, SSR adapters |

---

## Content Collection Checks

```bash
bunx astro check
```

When an asset is referenced by `otb.json`, verify the file exists under `public/`:

```bash
python -c "import json, pathlib; data=json.load(open('src/content/products/otb.json', encoding='utf-8')); paths=[data['seo']['ogImage'], data['hero']['background']['image'], data['audience']['background']['image'], data['bostonHarvard']['background']['image']]; missing=[p for p in paths if not pathlib.Path('public', p.lstrip('/')).exists()]; print(missing)"
```

Expected result: `[]`.

---

## UI / Accessibility Smoke

- One `<h1>` on the canonical page.
- Skip link points to `#conteudo-principal`.
- CTA anchors point to existing IDs.
- Focus-visible styles remain visible.
- No emoji icons; use Lucide/SVG.
- Reduced-motion users are not forced through layout animations.
- Static/no-JS fallback reveals content.

---

## SEO Smoke

| Check | Expected |
|---|---|
| `astro.config.mjs site` | `https://otb.drasacha.com.br` |
| `robots.txt` sitemap | `https://otb.drasacha.com.br/sitemap-index.xml` |
| Home canonical | `https://otb.drasacha.com.br/` |
| `/otb` | noindex/redirect fallback to `/` |
| Sitemap | only canonical URL(s), no `/otb` |
| OG/Twitter image | absolute URL to existing asset |
| Organization JSON-LD | Grupo US as organization, OTB as product/page context |

---

## OTB Legal/Copy Guardrails

- Product copy lives in `src/content/products/otb.json`.
- Harvard may be mentioned only as context/ecosystem.
- Never imply Harvard affiliation, endorsement, certification, official partnership, or diploma.
- `Grupo US` is the parent brand; do not broaden CTAs to non-OTB programs.
- WhatsApp messages must start with `Olá, Laura!`.

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
