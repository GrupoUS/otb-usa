/**
 * OTB Theme - optional Tailwind token export.
 * Runtime source of truth remains src/styles/global.css.
 */

export const otbTheme = {
  colors: {
    navy: "#1a1a2e",
    "navy-light": "#2a2a40",
    "navy-lighter": "#3d3d5c",
    gold: "#d4af37",
    "gold-light": "#e8c96a",
    "gold-dark": "#b8960c",
    "text-primary": "#fafaf9",
    "text-muted": "#94a3b8",
    whatsapp: "#25d366",
  },
  fontFamily: {
    serif: "var(--font-playfair)",
    sans: "var(--font-inter)",
  },
  borderRadius: {
    xl: "1rem",
    "2xl": "1.5rem",
  },
} as const;

export default otbTheme;
