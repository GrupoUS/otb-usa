---
name: ui-ux-pro-max
description: Use for product UI design, new pages, component design, refactoring UI, layout systems, typography, color, accessibility, interaction quality, and pre-launch UI review.
---

# UI/UX Pro Max

Searchable design intelligence database: 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 technology stacks.

## When to Apply

### Must Use

- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for accessibility or visual consistency
- Implementing navigation structures, animations, or responsive behavior
- Making product-level design decisions (style, information hierarchy, brand expression)

### Recommended

- UI looks unprofessional but the cause is unclear
- Pre-launch UI quality optimization
- Aligning cross-platform design (Web / iOS / Android)
- Building design systems or reusable component libraries

### Skip

- Pure backend logic, API or database design
- Performance optimization unrelated to the interface
- Infrastructure, DevOps, or non-visual automation

**Decision criteria:** If the task changes how a feature looks, feels, moves, or is interacted with — use this skill.

## Rule Categories by Priority

*Follow priority 1→10 to decide which category to focus on first. Use `--domain <Domain>` for detailed rules.*

| Priority | Category | Impact | Domain | Key Checks | Anti-Patterns |
|----------|----------|--------|--------|------------|---------------|
| 1 | Accessibility | CRITICAL | `ux` | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels | No focus rings, Icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | `ux` | Min 44×44px targets, 8px+ spacing, Loading feedback | Hover-only, Instant state changes (0ms) |
| 3 | Performance | HIGH | `ux` | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) | Layout thrashing, Cumulative Layout Shift |
| 4 | Style Selection | HIGH | `style`, `product` | Match product type, Consistency, SVG icons | Mixing flat/skeuomorphic, Emoji as icons |
| 5 | Layout & Responsive | HIGH | `ux` | Mobile-first, Viewport meta, No horizontal scroll | Fixed px widths, Disable zoom |
| 6 | Typography & Color | MEDIUM | `typography`, `color` | Base 16px, Line-height 1.5, Semantic tokens | Body < 12px, Gray-on-gray, Raw hex |
| 7 | Animation | MEDIUM | `ux` | 150–300ms, Motion conveys meaning, Spatial continuity | Decorative-only, Animating width/height |
| 8 | Forms & Feedback | MEDIUM | `ux` | Visible labels, Error near field, Progressive disclosure | Placeholder-only labels, Errors only at top |
| 9 | Navigation Patterns | HIGH | `ux` | Predictable back, Bottom nav ≤5, Deep linking | Overloaded nav, Broken back behavior |
| 10 | Charts & Data | LOW | `chart` | Legends, Tooltips, Accessible colors | Color-only encoding |

## How to Use This Skill

The skill uses a Python CLI search tool. Full workflow, commands, domain reference, and usage tips:

> See [templates/base/skill-content.md](templates/base/skill-content.md)

**Quick pattern:**

```bash
# Full design system recommendation (always start here)
python3 skills/ui-ux-pro-max/scripts/search.py "<product keywords>" --design-system -p "Project Name"

# Domain-specific deep dive
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain>

# Stack-specific guidelines
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack react-native
```

**Available domains:** `product` `style` `typography` `color` `landing` `chart` `ux` `google-fonts` `react` `web` `prompt`

## Quick Reference (UX Rules §1–10)

All 99 UX rules grouped by category (accessibility, touch, performance, style, layout, typography, animation, forms, navigation, charts):

> See [templates/base/quick-reference.md](templates/base/quick-reference.md)

## Professional UI Rules & Pre-Delivery Checklist

Icons, interaction, light/dark mode, layout/spacing rules and a full pre-delivery checklist (Visual Quality, Interaction, Light/Dark, Layout, Accessibility):

> See [templates/base/skill-content.md](templates/base/skill-content.md) — sections "Common Rules for Professional UI" and "Pre-Delivery Checklist"

## Reference Files

| File | Content |
|------|---------|
| [`templates/base/skill-content.md`](templates/base/skill-content.md) | Full workflow (Steps 1–4), search reference, example, tips, Pro UI rules, pre-delivery checklist |
| [`templates/base/quick-reference.md`](templates/base/quick-reference.md) | UX rules §1–10 (99 rules across all categories) |
| [`data/`](data/) | CSV databases: styles, colors, fonts, products, charts, UX guidelines |
| [`scripts/search.py`](scripts/search.py) | CLI search tool |
| [`templates/platforms/`](templates/platforms/) | Platform-specific configs (Cursor, Copilot, Gemini, etc.) |
