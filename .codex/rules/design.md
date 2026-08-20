---
paths:
  - "src/components/**"
---

# Design — what is not preference

> Graph Powers template. What is here holds in any product. This project's visual identity — palette,
> fonts, tone, named rules — is not this: it lives in `DESIGN.md` at the root (built per the plugin's
> `DESIGN.md` spec). **This rule points at it; it never restates it**, because two copies diverge.

## Colour

- Semantic tokens, always. A colour literal in a component is a decision nobody can change later
  without hunting occurrences.
- WCAG AA contrast on text and on interactive elements. AAA where the text is long.
- Colour is never the only carrier of information — pair it with shape, icon or text.

## Typography

- Two families at most. The third always looks like an accident.
- Nothing below 12px at any viewport.
- Numbers compared in a column use `tabular-nums`.

## Space and targets

- A 8px (4px em UI densa) grid. A value off the grid needs a reason written in the code.
- Minimum touch target 44 × 44 px (≥ 36 × 36 px no desktop) on touch screens.

## Motion

- `prefers-reduced-motion` is required, not optional. Whoever asked for less motion has a medical
  reason more often than people assume. **Neste projeto é o único requisito de motion.**
- **Divergência deliberada do template:** esta landing permite animar qualquer propriedade,
  incluindo layout (`width`/`height`/`top`/`left`/`padding`/`margin`), e `transition: all`.
  `transform`/`opacity` são *preferidos* quando produzem o mesmo resultado visual, por rodarem no
  compositor — preferência, não regra. Ver `.claude/CLAUDE.md § Cardinal rules #8` e raiz
  `DESIGN.md § 9`; a troca contra INP é decisão de projeto já aceita.
- Hover/foco ~150ms, reveal 300–600ms; coreografia de herói leva o tempo que o momento merecer.
- Um runtime de motion só: `src/scripts/motion.ts`, com **um** listener de scroll. Componente declara
  atributo, não abre listener próprio.

## Focus and keyboard

- `:focus-visible` with a visible 2px sólido + 2px de offset, no token de foco ring. Removing the ring without replacing it breaks
  keyboard navigation.
- A button is a `<button>`, a link is an `<a>`. Swapping them breaks keyboard and screen reader at
  the same time.

## Images

- Explicit `width` and `height`, always — without them the page jumps when the image arrives.
- `alt` that describes the function, not the file. A decorative image takes `alt=""`.

## States

Every screen that fetches data has four states designed: loading, empty, error and full. The empty
state is the most forgotten and the first one a new user sees.

## Where this project's identity lives

Root `DESIGN.md` — tokens, named rules, hierarchy, component authority, refused patterns.

`Skill('gpus-theme')` — canon Navy/Gold dark-first. `.claude/rules/DESIGN.md` — do/don't universal.
`.claude/config.json::gates` — alvos de Lighthouse/CWV (advisory).

**Divergência declarada desta landing:** a escala neutra é `ink` (preta), não a Navy padrão do
`gpus-theme`. Ver raiz `DESIGN.md § 2`.
