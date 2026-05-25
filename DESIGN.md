---
name: otb-usa
description: Landing OTB USA — MBA em Business Aesthetic Health do Grupo US. Dark-only, Navy + Gold, Astro 6 + Tailwind v4.
mode: dark-only
colors:
  navy: "#1a1a2e"
  navy-light: "#2a2a40"
  navy-lighter: "#3d3d5c"
  gold: "#d4af37"
  gold-light: "#e8c96a"
  gold-dark: "#b8960c"
  text-primary: "#fafaf9"
  text-muted: "#94a3b8"
  whatsapp: "#25d366"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 700
    use: "Hero, títulos de seção, momentos institucionais"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 400
    use: "Body, UI, parágrafos, captions"
spacing-grid: "8px (Tailwind default)"
focus-ring: "2px solid var(--color-gold), offset 2px"
---

# Design System — OTB USA

> Índice visual do projeto. Tokens vivos ficam em [`src/styles/global.css`](src/styles/global.css). Este arquivo orienta decisões; o CSS é a fonte técnica.

## 1. Creative north star

**Autoridade internacional contida.** OTB USA precisa parecer uma experiência executiva em Boston/EUA para profissionais de Saúde Estética Avançada: premium, acadêmico, estratégico, sem excesso decorativo.

Palavras-guia:

- Boston / Estados Unidos;
- business + saúde estética avançada;
- sofisticação sóbria;
- gold como hierarquia;
- dark-only institucional.

## 2. Tokens

Fonte da verdade: `src/styles/global.css` bloco `@theme {}`.

| Role | Token | Hex |
|---|---|---|
| Canvas | `--color-navy` / `bg-navy` | `#1a1a2e` |
| Surface | `--color-navy-light` | `#2a2a40` |
| Surface hover | `--color-navy-lighter` | `#3d3d5c` |
| Primary CTA | `--color-gold` | `#d4af37` |
| Gold hover | `--color-gold-light` | `#e8c96a` |
| Gold deep | `--color-gold-dark` | `#b8960c` |
| Text primary | `--color-text-primary` | `#fafaf9` |
| Text muted | `--color-text-muted` | `#94a3b8` |
| WhatsApp | `--color-whatsapp` | `#25d366` |

**Hex inline em componentes é proibido.** Se precisar de cor nova, criar token em `global.css`.

## 3. Typography

- **Playfair Display** — hero, headlines e momentos de autoridade.
- **Inter** — body, navegação, captions e UI.

Regra: destacar por peso/tamanho/spacing; não introduzir terceira família.

## 4. Components

### Buttons

- CTA primário: fundo gold, texto navy escuro.
- WhatsApp: verde apenas para ação de contato.
- Ghost/outline: navegação e CTAs secundários.
- Touch target mínimo 44px.

### Cards

- Base em `bg-navy-light`; hover em `bg-navy-lighter`.
- Efeitos só com `transform` + `opacity`.
- Glass card é acento cirúrgico, não padrão.
- Evitar cards aninhados.

### Hero

- Hero deve vender autoridade, não decoração.
- Usar imagem/contexto de Boston quando aplicável.
- `min-h-[100dvh]` preferido a `h-screen`.
- CTA acima da dobra, com mensagem WhatsApp vindo do JSON.

### Reveal / motion

- `[data-reveal]` + IntersectionObserver.
- `prefers-reduced-motion` precisa desligar animação decorativa.
- Nunca `transition: all`.

### FAQ

- Preferir HTML nativo/estático.
- Se animar painel, usar grid `0fr → 1fr`; não animar `height`.

## 5. Do / Don't

### Do

- Usar tokens semânticos (`bg-navy`, `text-gold`, `text-text-muted`).
- Consumir copy de `src/content/products/otb.json`.
- Manter foco visível em gold.
- Usar Lucide para ícones.
- Priorizar SSR/static e zero JS por padrão.

### Don't

- Não copiar layout de template genérico.
- Não usar hex inline em `.astro` / `.tsx`.
- Não animar layout properties.
- Não usar emoji como ícone.
- Não usar gold em parágrafo longo.
- Não sugerir vínculo/certificação oficial por Harvard.
- Não importar copy, rotas ou CTAs de produtos que não sejam OTB USA.

## 6. Routing

| Pergunta | Abrir |
|---|---|
| Tokens e tema OTB | `.claude/skills/otb-theme/` |
| Copy e produto OTB USA | `.claude/skills/otb-usa/` |
| Regras universais de design | `.claude/rules/DESIGN.md` |
| Astro / Content Collections | `.claude/rules/astro.md` + `.claude/skills/astro/` |
| Brief de produto | `PRODUCT.md` |
