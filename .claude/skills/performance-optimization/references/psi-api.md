# PSI API Reference

The Google PageSpeed Insights API v5 is the **primary measurement tool**. Zero dependencies (no Chrome/Chromium needed), returns real CrUX field data + Lighthouse lab data.

## API Endpoint

```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
```

## Parameters

| Parameter | Required | Values | Default |
|-----------|----------|--------|---------|
| `url` | Yes | Any valid URL | - |
| `strategy` | No | `mobile`, `desktop` | `desktop` |
| `category` | No | `performance`, `accessibility`, `best-practices`, `seo` (repeatable) | `performance` |
| `locale` | No | BCP 47 locale | `en` |

## Single URL Audit

```bash
# Mobile, all 4 categories
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${project.stagingUrl}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo&locale=${project.locale}" -o /tmp/psi-mobile.json

# Desktop
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${project.stagingUrl}&strategy=desktop&category=performance&category=accessibility&category=best-practices&category=seo&locale=${project.locale}" -o /tmp/psi-desktop.json
```

## Score Extraction

```bash
# Category scores (0-100)
jq '{
  perf: (.lighthouseResult.categories.performance.score * 100 | round),
  a11y: (.lighthouseResult.categories.accessibility.score * 100 | round),
  bp: (.lighthouseResult.categories["best-practices"].score * 100 | round),
  seo: (.lighthouseResult.categories.seo.score * 100 | round)
}' /tmp/psi-mobile.json

# Core Web Vitals
jq '{
  FCP: .lighthouseResult.audits["first-contentful-paint"].displayValue,
  LCP: .lighthouseResult.audits["largest-contentful-paint"].displayValue,
  CLS: .lighthouseResult.audits["cumulative-layout-shift"].displayValue,
  TBT: .lighthouseResult.audits["total-blocking-time"].displayValue,
  SI:  .lighthouseResult.audits["speed-index"].displayValue,
  TTI: .lighthouseResult.audits.interactive.displayValue
}' /tmp/psi-mobile.json

# Top opportunities (sorted by savings)
jq '[.lighthouseResult.audits | to_entries[] | select(.value.details.overallSavingsMs > 0) | {audit: .key, savings_ms: .value.details.overallSavingsMs, savings_bytes: (.value.details.overallSavingsBytes // 0), display: .value.displayValue}] | sort_by(-.savings_ms) | .[0:5]' /tmp/psi-mobile.json

# Full audit details for a specific audit (e.g. unused-javascript)
jq '.lighthouseResult.audits["unused-javascript"].details.items | .[0:5] | .[] | {url: .url, wastedBytes: .wastedBytes, wastedPercent: (.wastedPercent | round)}' /tmp/psi-mobile.json
```

## Multi-Route Scan

```bash
for route in "/" "/dashboard" "/<your-routes>"; do
  echo "Scanning ${route}..."
  curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${project.stagingUrl}${route}&strategy=mobile&category=performance&locale=${project.locale}" | \
    jq -r "{route: \"${route}\", perf: (.lighthouseResult.categories.performance.score * 100 | round), lcp: .lighthouseResult.audits[\"largest-contentful-paint\"].displayValue, cls: .lighthouseResult.audits[\"cumulative-layout-shift\"].displayValue}"
done
```

## Score Thresholds

| Category | Pass | Warn | Fail |
|----------|------|------|------|
| Performance | >= 90 | 50-89 | < 50 |
| Accessibility | >= 90 | 70-89 | < 70 |
| Best Practices | >= 90 | 70-89 | < 70 |
| SEO | >= 95 | 80-94 | < 80 |

## CWV Targets

| Metric | Good | Poor |
|--------|------|------|
| LCP | < 2.5s | > 4.0s |
| FCP | < 1.8s | > 3.0s |
| CLS | < 0.1 | > 0.25 |
| TBT | < 200ms | > 600ms |
| INP | < 200ms | > 500ms |

## PSI vs Local Lighthouse

| Feature | PSI API | Local Lighthouse CLI |
|---------|---------|---------------------|
| Dependencies | None (HTTP GET) | Chrome/Chromium |
| CrUX field data | Yes | No |
| Lab data | Yes (simulated) | Yes (real device) |
| Speed | ~30s per URL | ~15s per URL |
| Auth pages | No (public URLs only) | Yes (with cookies/headers) |

**Use PSI API** for public pages and automated monitoring.
**Use local Lighthouse** when testing auth-protected pages or needing custom Chrome flags.

## Opportunity → Fix Mapping

| PSI Opportunity | Typical Fix |
|----------------|-------------|
| `unused-javascript` | Lazy load with `React.lazy()` + dynamic `import()` |
| `render-blocking-resources` | Defer non-critical CSS/JS, inline critical CSS |
| `uses-responsive-images` | Resize, convert to WebP/AVIF, add `srcset` |
| `offscreen-images` | Add `loading="lazy"` to below-fold images |
| `efficiently-encode-images` | Convert to WebP/AVIF, compress |
| `uses-text-compression` | Enable gzip/brotli on server |
| `server-response-time` | Backend optimization, caching |
| `dom-size` | Virtualize lists, simplify component trees |
| `uses-long-cache-ttl` | Set immutable cache headers for hashed assets |
| `total-byte-weight` | Code splitting, tree shaking, dependency audit |
