# WhatsApp SDR Laura — Single Source of Truth

> Project SSOT for the SDR (Sales Development Representative) WhatsApp channel: number, default message, URL builder, dedup pattern, conventions.
> Cardinal #6 in `.claude/CLAUDE.md`: **NEVER inline `wa.me/...` URLs**. Always go through `src/lib/whatsapp.ts`.

---

## Identity

**Channel:** Grupo US institutional sales — Laura (SDR).
**E.164:** `+55 62 9470-5081`
**Without `+`:** `556294705081` (used by `wa.me/<E164>` URL pattern).
**Canonical helper:** `src/lib/whatsapp.ts`.

---

## SSOT module — `src/lib/whatsapp.ts`

| Export | Type / Value | Purpose |
|---|---|---|
| `WHATSAPP_SDR_E164` | `"556294705081"` | Brazilian E.164 (no `+`), used by `wa.me/<E164>` |
| `WHATSAPP_DEFAULT_SITE_MESSAGE` | `"Olá, Laura! Gostaria de falar sobre os programas do Grupo US e qual faz sentido para o meu momento."` | Institutional default for floating button + generic CTAs |
| `whatsappUrlWithText(message)` | `(message: string) => string` | Builds `https://wa.me/556294705081?text=<encoded>` |
| `isWhatsAppDestination(url)` | `(url: string) => boolean` | Returns `true` for `wa.me/`, `api.whatsapp.com`, `wa.link/` — used to dedup CTAs |

---

## Conventions

### Every product CTA message starts with `"Olá, Laura!"`

In `src/content/products/<slug>.json`:

```json
{
  "cta": {
    "url": "https://wa.me/556294705081?text=Ol%C3%A1%2C+Laura...",
    "whatsappMessage": "Olá, Laura! Gostaria de saber mais sobre <produto> e como posso me inscrever."
  }
}
```

The `whatsappMessage` field is the source. URL building goes through `whatsappUrlWithText(message)` at render time.

### Generic CTAs use `WHATSAPP_DEFAULT_SITE_MESSAGE`

Footer, contact page generic, header CTA — all use the default constant rather than hand-rolled copy.

### CTA dedup — `isWhatsAppDestination`

When `cta.url` is already a WhatsApp URL, `LandingHero` / `LandingCTA` auto-suppress the secondary green WhatsApp button (would be redundant). **Don't bypass this dedup** by adding a manual second button.

### `aria-label` always names "Laura"

Every WhatsApp button explicitly includes `"Laura"` in its `aria-label`:

```astro
<a href={url} aria-label="Falar com Laura no WhatsApp">Conversar com a Laura</a>
```

Screen-reader users hear the SDR's name + channel — clearer than "Open WhatsApp".

### Floating button is the **only** `client:load` island

`src/components/WhatsAppFloatingButton.tsx` rendered in `src/layouts/Layout.astro` with `client:load`. Persistent across-route floating UI requires immediate hydration. Any other `client:load` use needs written justification.

---

## Anti-patterns

### Forbidden

```astro
<!-- ❌ Inline URL — bypasses SSOT, drift risk -->
<a href="https://wa.me/5511920474028">Falar conosco</a>

<!-- ❌ Wrong number (legacy 55-11) -->
<a href="https://wa.me/5511920474028?text=...">CTA</a>

<!-- ❌ wa.link short URL — not the canonical pattern -->
<a href="https://wa.link/abc123">Falar com Laura</a>

<!-- ❌ Generic aria-label -->
<a href={url} aria-label="Open WhatsApp">CTA</a>

<!-- ❌ Manual second button when cta.url is already WhatsApp (bypasses dedup) -->
<a href={ctaUrl}>Inscrever</a>
<a href="https://wa.me/...">Falar com Laura</a>
```

### Required

```astro
<!-- ✅ SSOT import + helper -->
---
import { whatsappUrlWithText, WHATSAPP_DEFAULT_SITE_MESSAGE } from '@/lib/whatsapp';
const url = whatsappUrlWithText(WHATSAPP_DEFAULT_SITE_MESSAGE);
---
<a href={url} aria-label="Falar com Laura no WhatsApp">Conversar com a Laura</a>

<!-- ✅ Product-specific message via JSON field -->
---
import { whatsappUrlWithText } from '@/lib/whatsapp';
import { getEntry } from 'astro:content';
const product = await getEntry('products', 'mentoria-black-neon');
const url = whatsappUrlWithText(product.data.cta.whatsappMessage);
---
<a href={url} aria-label="Falar com Laura no WhatsApp sobre Mentoria Black NEON">CTA</a>
```

---

## Smoke commands

### No inline `wa.me/` URLs in components

```bash
grep -rn "wa\.me/\|api\.whatsapp\.com" src/components src/pages \
  --include="*.astro" --include="*.tsx"
# expect: empty (every WhatsApp URL goes through src/lib/whatsapp.ts)
```

### Every product `whatsappMessage` starts with `"Olá, Laura!"`

```bash
grep -L "\"whatsappMessage\":\s*\"Olá, Laura" src/content/products/*.json
# expect: empty (every product file matches; exclude external-only products if no whatsappMessage field)
```

### `WHATSAPP_SDR_E164` is the only number

```bash
grep -rnE "55[0-9]{10,11}" src/ | grep -v "WHATSAPP_SDR_E164\|src/lib/whatsapp.ts"
# expect: empty (no other Brazilian numbers hardcoded)
```

---

## Debug triage — WhatsApp URL drift

**Symptom:** Landing CTA opens WhatsApp with wrong number / wrong message.

**Root cause:**
- Inline `wa.me/<oldnumber>` bypassed `src/lib/whatsapp.ts`
- `cta.whatsappMessage` doesn't start with `"Olá, Laura!"`
- Manual second WhatsApp button bypassing `isWhatsAppDestination()` dedup

**Fix:**
1. Run grep above — must be empty.
2. All WhatsApp URL building goes through `whatsappUrlWithText(message)`.
3. Every product `cta.whatsappMessage` starts with `"Olá, Laura"`.
4. Re-test failing CTA — clicked URL is `https://wa.me/556294705081?text=...`.

---

## When to load more

- Brand voice + product canon: `references/manual-resumo.md`, `references/produtos-e-rotas.md`
- Astro hydration / island patterns (e.g., why `WhatsAppFloatingButton` uses `client:load`): `astro` skill
- Cardinal #6: `.claude/CLAUDE.md`
