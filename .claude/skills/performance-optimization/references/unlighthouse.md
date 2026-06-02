# Unlighthouse — Site-Wide Audits

For full-site crawling and multi-page audits. Requires Node 20+ and Chrome.

## Installation

```bash
# One-off run (no install)
bunx unlighthouse --site ${project.stagingUrl}

# Or install globally
bun add -g @unlighthouse/cli unlighthouse
```

## CLI Usage

```bash
# Quick site scan (mobile, throttled)
bunx unlighthouse --site ${project.stagingUrl} --throttle --samples 1

# Specific routes only
bunx unlighthouse --site ${project.stagingUrl} \
  --urls / \
  --throttle --samples 1

# Desktop mode
bunx unlighthouse --site ${project.stagingUrl} --desktop

# No cache (fresh scan)
bunx unlighthouse --site ${project.stagingUrl} --no-cache
```

## Configuration File

```typescript
// unlighthouse.config.ts
import { defineUnlighthouseConfig } from 'unlighthouse'

export default defineUnlighthouseConfig({
  site: '${project.stagingUrl}',
  scanner: {
    device: 'mobile',
    samples: 1,
    throttle: true,
    maxRoutes: 50,
    exclude: ['/api/*', '/health/*']
  },
  lighthouseOptions: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
  },
  ci: {
    budget: {
      performance: 75,
      accessibility: 90,
      'best-practices': 80,
      seo: 95,
    }
  }
})
```

## Output

- Dashboard: `localhost:5678` (interactive Vite UI)
- Reports: `./unlighthouse-reports/` (HTML + JSON)
