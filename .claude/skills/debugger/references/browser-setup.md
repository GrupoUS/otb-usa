# Browser Setup — GPUS Static Site

This is a public static Astro landing. Browser evidence should focus on public routes, responsive behavior, anchors, console/network errors, and generated static output.

---

## Browser Mode Selection

| Scenario | Tool | Command / Action |
|---|---|---|
| Public route smoke | Playwright MCP when available | `browser_navigate` → `browser_snapshot` → `browser_take_screenshot` |
| Public route fallback | agent-browser | `agent-browser open http://localhost:4321 --headless` → `snapshot` → `screenshot` |
| Static output inspection | CLI | inspect `dist/index.html`, `dist/sitemap-0.xml`, `dist/robots.txt` |

Default local URL: `http://localhost:4321`.

---

## Evidence Checklist

- `/` renders the full landing funnel in order (sections composed in `src/pages/index.astro`).
- The expected section anchors (`${content.anchors}`) exist on `/`.
- Any stale/compatibility route is redirect/noindex fallback and canonical `/`.
- No console errors from React islands or reveal script.
- No network 404 for assets referenced by `${content.productJson}`.
- Keyboard focus starts at skip link and remains visible.
- Reduced-motion mode does not rely on layout animation.

---

## CLI Smoke Examples

```bash
bun run build
grep -RIn 'id="<expected-anchor>"' dist/index.html
grep -RIn '<legacy-domain>' dist || true
grep -RIn '<stale-route>' dist/sitemap-0.xml || true
```

Use `|| true` only for read-only smoke checks where “no matches” is the expected result; do not use it to mask build/lint/check failures.

---

## Constraints

- Do not start long-running servers without a timeout.
- Do not use npm/yarn/pnpm.
- Do not add browser tooling dependencies unless explicitly requested.
- Do not treat any stale/compatibility route as a second landing; `/` is canonical.
