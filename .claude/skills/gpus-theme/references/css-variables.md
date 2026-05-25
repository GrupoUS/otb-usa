# CSS Variables Reference

Complete list of CSS custom properties from the GPUS design system.

---

## Light Theme (`:root`)

### Background Layers

| Variable | Value (HSL) | Hex Equivalent | Usage |
|----------|-------------|----------------|-------|
| `--background` | `0 0% 100%` | `#ffffff` | Page background |
| `--foreground` | `222 47% 11%` | `#0f172a` | Primary text |

### Cards & Surfaces

| Variable | Value (HSL) | Usage |
|----------|-------------|-------|
| `--card` | `0 0% 100%` | Card background |
| `--card-foreground` | `222 47% 11%` | Card text |
| `--popover` | `0 0% 100%` | Dropdown background |
| `--popover-foreground` | `222 47% 11%` | Dropdown text |

### Brand Colors

| Variable | Value (HSL) | Usage |
|----------|-------------|-------|
| `--primary` | `38 60% 45%` | Primary buttons, links |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--secondary` | `38 50% 85%` | Secondary elements |
| `--secondary-foreground` | `0 0% 100%` | Text on secondary |

### Neutral Colors

| Variable | Value (HSL) | Usage |
|----------|-------------|-------|
| `--muted` | `210 40% 96%` | Muted backgrounds |
| `--muted-foreground` | `215 25% 40%` | Muted text |
| `--accent` | `38 60% 95%` | Accent highlights |
| `--accent-foreground` | `222 47% 11%` | Text on accent |

### States

| Variable | Value (HSL) | Usage |
|----------|-------------|-------|
| `--destructive` | `0 84% 60%` | Error states |
| `--destructive-foreground` | `0 0% 100%` | Text on error |

### Borders & Focus

| Variable | Value (HSL) | Usage |
|----------|-------------|-------|
| `--border` | `214 32% 91%` | Border color |
| `--input` | `214 32% 91%` | Input borders |
| `--ring` | `38 60% 45%` | Focus ring |

### Chart Colors

| Variable | Value (HSL) | Color |
|----------|-------------|-------|
| `--chart-1` | `38 60% 45%` | Gold |
| `--chart-2` | `142 76% 36%` | Green |
| `--chart-3` | `38 92% 50%` | Bright gold |
| `--chart-4` | `0 84% 60%` | Red |
| `--chart-5` | `217 91% 60%` | Blue |

### Sidebar

| Variable | Value (HSL) |
|----------|-------------|
| `--sidebar-background` | `0 0% 98%` |
| `--sidebar-foreground` | `222 47% 11%` |
| `--sidebar-primary` | `38 60% 45%` |
| `--sidebar-primary-foreground` | `0 0% 100%` |
| `--sidebar-accent` | `38 60% 95%` |
| `--sidebar-accent-foreground` | `222 47% 11%` |
| `--sidebar-border` | `214 32% 91%` |
| `--sidebar-ring` | `38 60% 45%` |

### Radius

| Variable | Value |
|----------|-------|
| `--radius` | `0.625rem` |

---

## Dark Theme (`.dark`)

### Background Layers

| Variable | Value (HSL) | Hex Equivalent | Usage |
|----------|-------------|----------------|-------|
| `--background` | `211 49% 10%` | `#0d1b2a` | Navy background |
| `--foreground` | `39 44% 65%` | `#c9a66b` | Gold text |

### Cards & Surfaces

| Variable | Value (HSL) |
|----------|-------------|
| `--card` | `212 48% 13%` |
| `--card-foreground` | `39 44% 65%` |
| `--popover` | `211 49% 10%` |
| `--popover-foreground` | `39 44% 65%` |

### Brand Colors

| Variable | Value (HSL) |
|----------|-------------|
| `--primary` | `39 44% 65%` |
| `--primary-foreground` | `48 10% 80%` |
| `--secondary` | `211 49% 10%` |
| `--secondary-foreground` | `39 44% 65%` |

### Neutral Colors

| Variable | Value (HSL) |
|----------|-------------|
| `--muted` | `39 29% 54%` |
| `--muted-foreground` | `48 10% 80%` |
| `--accent` | `26 5% 27%` |
| `--accent-foreground` | `39 44% 65%` |

### States

| Variable | Value (HSL) |
|----------|-------------|
| `--destructive` | `0 84% 60%` |
| `--destructive-foreground` | `30 11% 11%` |

### Borders & Focus

| Variable | Value (HSL) |
|----------|-------------|
| `--border` | `26 6% 21%` |
| `--input` | `26 6% 21%` |
| `--ring` | `39 29% 54%` |

### Chart Colors (Dark)

| Variable | Value (HSL) | Color |
|----------|-------------|-------|
| `--chart-1` | `234 89% 74%` | Purple-blue |
| `--chart-2` | `239 84% 67%` | Violet |
| `--chart-3` | `243 75% 59%` | Indigo |
| `--chart-4` | `245 58% 51%` | Deep purple |
| `--chart-5` | `244 55% 41%` | Dark purple |

### Custom Brand

| Variable | Value (HSL) |
|----------|-------------|
| `--us-purple-light` | `270 70% 70%` |

### Sidebar (Dark)

| Variable | Value (HSL) |
|----------|-------------|
| `--sidebar-background` | `212 48% 13%` |
| `--sidebar-foreground` | `39 44% 65%` |
| `--sidebar-primary` | `40 14% 66%` |
| `--sidebar-primary-foreground` | `207 37% 25%` |
| `--sidebar-accent` | `26 5% 27%` |
| `--sidebar-accent-foreground` | `39 44% 65%` |
| `--sidebar-border` | `39 29% 54%` |
| `--sidebar-ring` | `39 29% 54%` |

---

## HSL Format

All colors use HSL format without the `hsl()` wrapper:

```css
/* Usage in CSS */
background-color: hsl(var(--background));
color: hsl(var(--foreground));

/* With opacity */
background-color: hsl(var(--primary) / 0.5);
```
