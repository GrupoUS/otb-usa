# Verification & Prevention — GPUS Astro landing

> Fix the bug and verify the static site artifact that users/search engines receive.

---

## Static-Site Defense-in-Depth

| Layer | Purpose | Example |
|---|---|---|
| **1. Content schema** | Reject invalid product data | `src/content.config.ts` validates `${content.productJson}` |
| **2. Component contract** | Render only expected fields | Astro props typed from Content Collections |
| **3. Helper/SSOT** | Centralize sensitive behavior | WhatsApp URL via `src/lib/whatsapp.ts` |
| **4. Generated artifact** | Confirm production output | inspect `dist/index.html`, sitemap, robots, assets |

### Implementation Examples

```typescript
// Content schema guard
const ctaSchema = z.object({
	label: z.string().min(2),
	whatsappMessage: z.string().refine((message) => message.startsWith("${lead.whatsappGreeting}")),
});
```

```astro
---
// Component contract: consume typed collection data, not ad-hoc literals.
import type { CollectionEntry } from "astro:content";

export interface Props {
	hero: CollectionEntry<"products">["data"]["hero"];
}
---
```

```typescript
// Helper/SSOT: no inline wa.me in components.
import { whatsappUrlWithText } from "../../lib/whatsapp";
```

```bash
# Generated artifact smoke
bun run build
grep -RIn '${project.productionUrl}/' dist/index.html dist/sitemap-0.xml
grep -RIn '<legacy-domain>' dist || true
```

---

## Regression Prevention

| Bug Level | Required Actions |
|---|---|
| L1-L2 | Fix + targeted smoke |
| L3-L4 | Fix + full validation gate + generated artifact check |
| L5+ | Fix + full validation gate + browser evidence + note remaining risks |

### Regression Risk Assessment

| Risk | Definition | Action |
|---|---|---|
| **High** | Same bug class likely elsewhere | Search active source/docs and fix all in-scope instances |
| **Medium** | Could recur if related content/config changes | Add a smoke command or document rule |
| **Low** | Isolated incident | Standard fix and gate |

### Prevention Checklist

Before closing a L3+ bug/audit:

- [ ] Root cause stated with file evidence.
- [ ] Fix is minimal and on-product only.
- [ ] `bun run lint && bunx astro check && bun run build` passed.
- [ ] Relevant `dist` artifact was inspected.
- [ ] No active legacy references outside archive/dist.
- [ ] Referenced public assets exist.
- [ ] Remaining warnings are reported, not hidden.

---

## Fix Verification Criteria

A fix is verified when all are true:

1. **Reproducible or evidenced**: the original symptom is captured.
2. **Root-cause addressed**: not just a superficial patch.
3. **Isolated**: changed files match the requested scope.
4. **Gate-passing**: `bun run lint && bunx astro check && bun run build` exits 0.
5. **Static output confirmed**: generated HTML/sitemap/assets reflect the fix.

---

## Postmortem Template (L5+)

```markdown
## Bug Postmortem: [Brief Title]

**Date:** YYYY-MM-DD
**Severity:** P1/P2/P3/P4
**Time to Resolve:** Xh

### Timeline
1. Bug reported: [when, how]
2. Root cause identified: [when, technique]
3. Fix implemented: [when]
4. Fix verified: [commands/output]

### Root Cause
[1–2 sentences. Be specific.]

### Why It Escaped
- [ ] Missing static smoke
- [ ] Missing asset/content check
- [ ] Canonical route mismatch
- [ ] Manual copy/config drift

### Prevention Measures
- [ ] Add/update checklist or smoke command
- [ ] Document project rule if recurring
- [ ] Add asset/content verification where useful
```
