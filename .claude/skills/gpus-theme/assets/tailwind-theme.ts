/**
 * GPUS Theme - Tailwind v3 Configuration
 *
 * Import this in your tailwind.config.ts:
 *
 * import { gpusTheme } from './.agent/skills/gpus-theme/assets/tailwind-theme';
 *
 * export default {
 *   theme: {
 *     extend: {
 *       colors: gpusTheme.colors,
 *     },
 *   },
 * };
 */

export const gpusTheme = {
  colors: {
    // Semantic colors using CSS variables
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
    card: {
      DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
    },
    chart: {
      1: "hsl(var(--chart-1))",
      2: "hsl(var(--chart-2))",
      3: "hsl(var(--chart-3))",
      4: "hsl(var(--chart-4))",
      5: "hsl(var(--chart-5))",
    },
    sidebar: {
      DEFAULT: "hsl(var(--sidebar-background))",
      foreground: "hsl(var(--sidebar-foreground))",
      primary: "hsl(var(--sidebar-primary))",
      "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
      accent: "hsl(var(--sidebar-accent))",
      "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
      border: "hsl(var(--sidebar-border))",
      ring: "hsl(var(--sidebar-ring))",
    },
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
} as const;

/**
 * Raw HSL values for direct usage
 * Format: "H S% L%" (without hsl wrapper)
 */
export const gpusHSLTokens = {
  light: {
    background: "0 0% 100%",
    foreground: "222 47% 11%",
    primary: "38 60% 45%",
    secondary: "38 50% 85%",
    accent: "38 60% 95%",
    muted: "210 40% 96%",
    destructive: "0 84% 60%",
    border: "214 32% 91%",
  },
  dark: {
    background: "211 49% 10%",
    foreground: "39 44% 65%",
    primary: "39 44% 65%",
    secondary: "211 49% 10%",
    accent: "26 5% 27%",
    muted: "39 29% 54%",
    destructive: "0 84% 60%",
    border: "26 6% 21%",
  },
} as const;

export default gpusTheme;
