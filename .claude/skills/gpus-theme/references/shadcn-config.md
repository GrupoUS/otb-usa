# shadcn/ui Configuration

Complete configuration for shadcn/ui in the GPUS project.

---

## Configuration File

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@kokonutui": "https://kokonutui.com/r/{name}.json",
    "@aceternity": "https://ui.aceternity.com/registry/{name}.json",
    "@magicui": "https://magicui.design/r/{name}.json",
    "@tweakcn": "https://tweakcn.com/r/{name}.json",
    "@shadcnui-blocks": "https://www.shadcnui-blocks.com/r/{name}.json",
    "@cult-ui": "https://cult-ui.com/r/{name}.json",
    "@originui": "https://originui.com/r/{name}.json",
    "@tailark": "https://tailark.com/r/{name}.json"
  },
  "iconLibrary": "lucide"
}
```

---

## Style: New York

The `new-york` style features:
- Smaller, rounder corners
- More compact spacing
- Subtle shadows
- Clean, modern aesthetic

---

## Component Inventory (43 components)

### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| accordion | `accordion.tsx` | Collapsible sections |
| alert | `alert.tsx` | Status messages |
| alert-dialog | `alert-dialog.tsx` | Confirmation dialogs |
| avatar | `avatar.tsx` | User images |
| badge | `badge.tsx` | Status labels |
| breadcrumb | `breadcrumb.tsx` | Navigation path |
| button | `button.tsx` | Actions |
| calendar | `calendar.tsx` | Date picker |
| card | `card.tsx` | Content containers |
| checkbox | `checkbox.tsx` | Boolean input |
| collapsible | `collapsible.tsx` | Expandable content |
| command | `command.tsx` | Command palette |
| dialog | `dialog.tsx` | Modal windows |
| dropdown-menu | `dropdown-menu.tsx` | Context menus |
| form | `form.tsx` | Form handling |
| input | `input.tsx` | Text input |
| label | `label.tsx` | Form labels |
| navigation-menu | `navigation-menu.tsx` | Site navigation |
| pagination | `pagination.tsx` | Page navigation |
| popover | `popover.tsx` | Floating content |
| progress | `progress.tsx` | Loading bars |
| radio-group | `radio-group.tsx` | Single selection |
| scroll-area | `scroll-area.tsx` | Custom scrollbars |
| select | `select.tsx` | Dropdown select |
| separator | `separator.tsx` | Visual dividers |
| sheet | `sheet.tsx` | Side panels |
| sidebar | `sidebar.tsx` | App sidebar |
| skeleton | `skeleton.tsx` | Loading placeholders |
| sonner | `sonner.tsx` | Toast notifications |
| switch | `switch.tsx` | Toggle switch |
| table | `table.tsx` | Data tables |
| tabs | `tabs.tsx` | Tab navigation |
| textarea | `textarea.tsx` | Multi-line input |
| tooltip | `tooltip.tsx` | Hover information |

### Extended Components

| Component | Source | Purpose |
|-----------|--------|---------|
| aceternity-sidebar | Custom | Animated sidebar |
| date-range-picker | Custom | Date range selection |
| flip-button | Custom | Animated button |
| floating-navbar | Aceternity | Floating navigation |
| hero-parallax | Aceternity | Parallax hero section |
| hover-border-gradient | Aceternity | Gradient border effect |
| macbook-scroll | Aceternity | MacBook scroll animation |
| motion-wrapper | Custom | Framer Motion wrapper |
| ripple-button | Custom | Button with ripple effect |

---

## Adding Components

### From shadcn/ui

```bash
bunx shadcn@latest add button
```

### From Registries

```bash
# Aceternity components
bunx shadcn@latest add @aceternity/hero-parallax

# Magic UI components
bunx shadcn@latest add @magicui/marquee
```

---

## Path Aliases

| Alias | Path | Usage |
|-------|------|-------|
| `@/components` | `src/components` | All components |
| `@/components/ui` | `src/components/ui` | UI primitives |
| `@/lib` | `src/lib` | Utilities |
| `@/hooks` | `src/hooks` | Custom hooks |
